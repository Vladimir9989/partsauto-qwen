#!/bin/bash

# Скрипт для настройки Nginx проксирования API запросов
# Использование: bash nginx-fix.sh

set -e

echo "=== Настройка Nginx для проксирования API ==="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

CONFIG_FILE="/etc/nginx/sites-available/partsauto"
BACKUP_FILE="/etc/nginx/sites-available/partsauto.backup.$(date +%Y%m%d_%H%M%S)"

# Проверка, что скрипт запущен от root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Ошибка: Скрипт должен быть запущен от root${NC}"
    echo "Используйте: sudo bash nginx-fix.sh"
    exit 1
fi

# Проверка существования конфига
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Ошибка: Файл конфига не найден: $CONFIG_FILE${NC}"
    exit 1
fi

# Создание резервной копии
echo -e "${YELLOW}1. Создание резервной копии конфига...${NC}"
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo -e "${GREEN}✓ Резервная копия создана: $BACKUP_FILE${NC}"
echo ""

# Проверка, есть ли уже блок location /api/
if grep -q "location /api/" "$CONFIG_FILE"; then
    echo -e "${YELLOW}⚠ Блок 'location /api/' уже существует в конфиге${NC}"
    echo "Показываю текущий конфиг:"
    echo ""
    cat "$CONFIG_FILE"
    echo ""
    read -p "Хотите перезаписать конфиг? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Отменено пользователем"
        exit 0
    fi
fi

# Создание нового конфига
echo -e "${YELLOW}2. Создание нового конфига Nginx...${NC}"

cat > "$CONFIG_FILE" << 'EOF'
# Редирект с www на без www и с HTTP на HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name www.parts-auto-test.ru;
    return 301 https://parts-auto-test.ru$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    server_name parts-auto-test.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.parts-auto-test.ru;
    
    ssl_certificate /etc/letsencrypt/live/parts-auto-test.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parts-auto-test.ru/privkey.pem;
    
    return 301 https://parts-auto-test.ru$request_uri;
}

# Основной сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name parts-auto-test.ru;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/parts-auto-test.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parts-auto-test.ru/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Логи
    access_log /var/log/nginx/partsauto_access.log;
    error_log /var/log/nginx/partsauto_error.log;

    # Максимальный размер загружаемых файлов
    client_max_body_size 10M;

    # ✅ ВАЖНО: Проксирование API запросов к Node.js серверу
    # Этот блок должен быть ПЕРЕД location /
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты для загрузки файлов
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Размер буфера
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Доступ к загруженным файлам
    location /uploads/ {
        alias /var/www/partsauto/public/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }

    # Статические файлы React приложения
    location / {
        root /var/www/partsauto/dist;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических ресурсов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

echo -e "${GREEN}✓ Новый конфиг создан${NC}"
echo ""

# Проверка синтаксиса
echo -e "${YELLOW}3. Проверка синтаксиса конфига...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Синтаксис конфига корректен${NC}"
else
    echo -e "${RED}✗ Ошибка в конфиге! Восстанавливаем из резервной копии...${NC}"
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo -e "${YELLOW}Конфиг восстановлен из резервной копии${NC}"
    exit 1
fi
echo ""

# Перезагрузка Nginx
echo -e "${YELLOW}4. Перезагрузка Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✓ Nginx перезагружен${NC}"
echo ""

# Проверка статуса Nginx
echo -e "${YELLOW}5. Проверка статуса Nginx...${NC}"
systemctl status nginx --no-pager | head -n 10
echo ""

# Проверка Node.js сервера
echo -e "${YELLOW}6. Проверка Node.js сервера (PM2)...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo -e "${YELLOW}⚠ PM2 не установлен или не найден${NC}"
fi
echo ""

# Тестирование API
echo -e "${YELLOW}7. Тестирование API...${NC}"
echo "Локальный тест (localhost:3001):"
curl -s -X POST http://localhost:3001/api/upload-car-image || echo -e "${RED}✗ Node.js сервер не отвечает на localhost:3001${NC}"
echo ""
echo ""
echo "Тест через Nginx (https://parts-auto-test.ru):"
curl -s -k -X POST https://parts-auto-test.ru/api/upload-car-image || echo -e "${RED}✗ API не доступен через Nginx${NC}"
echo ""
echo ""

# Итоги
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Настройка завершена!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Резервная копия сохранена в: $BACKUP_FILE"
echo ""
echo "Проверьте работу API в браузере:"
echo "https://parts-auto-test.ru/api/upload-car-image"
echo ""
echo "Если что-то не работает, проверьте логи:"
echo "  tail -f /var/log/nginx/error.log"
echo "  pm2 logs partsauto"
echo ""
echo "Для восстановления из резервной копии:"
echo "  cp $BACKUP_FILE $CONFIG_FILE"
echo "  nginx -t && systemctl reload nginx"
