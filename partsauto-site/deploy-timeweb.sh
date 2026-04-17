#!/bin/bash
# Скрипт для развертывания на Timeweb через SSH

echo "=== Развертывание PartsAuto на Timeweb ==="

# Настройки (замените на свои)
SERVER_IP="ваш_сервер_ip"
USERNAME="ваш_username"
REMOTE_DIR="/var/www/partsauto"
DOMAIN="ваш-домен.ru"

# 1. Сборка проекта
echo "1. Сборка проекта..."
npm run build

# 2. Копирование файлов на сервер
echo "2. Копирование файлов на сервер..."
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.env' ./ $USERNAME@$SERVER_IP:$REMOTE_DIR/

# 3. Установка зависимостей на сервере
echo "3. Установка зависимостей на сервере..."
ssh $USERNAME@$SERVER_IP "cd $REMOTE_DIR && npm install --production"

# 4. Настройка переменных окружения
echo "4. Настройка переменных окружения..."
ssh $USERNAME@$SERVER_IP "cd $REMOTE_DIR && cp .env.example .env"

# 5. Запуск/перезапуск сервера с PM2
echo "5. Запуск сервера..."
ssh $USERNAME@$SERVER_IP "cd $REMOTE_DIR && pm2 delete partsauto-server 2>/dev/null || true"
ssh $USERNAME@$SERVER_IP "cd $REMOTE_DIR && pm2 start ecosystem.config.js --env production"
ssh $USERNAME@$SERVER_IP "pm2 save"

# 6. Настройка Nginx (если нужно)
echo "6. Настройка Nginx..."
cat > nginx-config.txt << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo "Конфигурация Nginx сохранена в nginx-config.txt"
echo "Скопируйте её в /etc/nginx/sites-available/ и настройте символические ссылки"

# 7. Проверка статуса
echo "7. Проверка статуса..."
ssh $USERNAME@$SERVER_IP "pm2 status"

echo "=== Развертывание завершено ==="
echo "Сайт доступен по адресу: http://$DOMAIN"
echo "API: http://$DOMAIN/api/products"