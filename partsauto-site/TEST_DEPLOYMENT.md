# Тестирование работоспособности после развертывания

## 1. Базовые проверки

### Проверка доступности сайта
```bash
# Проверка HTTP кода ответа
curl -I http://ваш-домен.ru
# Ожидаемый ответ: 200 OK или 301/302 редирект на HTTPS

# Проверка HTTPS
curl -I https://ваш-домен.ru
# Ожидаемый ответ: 200 OK
```

### Проверка SSL сертификата
```bash
# Проверка срока действия SSL
openssl s_client -connect ваш-домен.ru:443 -servername ваш-домен.ru 2>/dev/null | openssl x509 -noout -dates
```

## 2. Проверка API

### Тест основного API эндпоинта
```bash
# Проверка загрузки товаров
curl "https://ваш-домен.ru/api/products?limit=5"

# Ожидаемый ответ:
# {
#   "products": [...],
#   "total": 8292,
#   "page": 1,
#   "totalPages": 415
# }
```

### Тест поиска
```bash
# Поиск по ключевому слову
curl "https://ваш-домен.ru/api/products?search=двигатель&limit=3"

# Фильтрация по бренду
curl "https://ваш-домен.ru/api/products?brand=BMW&limit=3"

# Фильтрация по цене
curl "https://ваш-домен.ru/api/products?priceMin=1000&priceMax=5000&limit=3"
```

## 3. Проверка фронтенда

### Проверка загрузки статических файлов
```bash
# Главная страница
curl -I https://ваш-домен.ru/

# CSS файл
curl -I https://ваш-домен.ru/assets/index-*.css

# JS файл
curl -I https://ваш-домен.ru/assets/index-*.js
```

### Проверка SPA маршрутизации
```bash
# Проверка что все маршруты возвращают index.html
curl -I https://ваш-домен.ru/about
curl -I https://ваш-домен.ru/products
curl -I https://ваш-домен.ru/contact
# Все должны возвращать 200 OK
```

## 4. Проверка производительности

### Время ответа API
```bash
# Измерение времени ответа
time curl -s -o /dev/null -w "%{http_code}" "https://ваш-домен.ru/api/products?limit=1"
# Время должно быть < 2 секунд
```

### Проверка кэширования
```bash
# Первый запрос
curl -I "https://ваш-домен.ru/api/products" | grep -i "cache-control"
# Должен быть заголовок кэширования
```

## 5. Проверка ошибок

### Тест несуществующих эндпоинтов
```bash
curl -I https://ваш-домен.ru/api/nonexistent
# Ожидается 404 Not Found
```

### Тест некорректных параметров
```bash
curl "https://ваш-домен.ru/api/products?page=abc"
# Должна быть корректная обработка ошибок
```

## 6. Проверка логов

### Просмотр логов приложения
Если есть доступ к серверу:
```bash
# Логи PM2
pm2 logs partsauto-server --lines 50

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Проверка ошибок в логах
```bash
grep -i "error\|failed\|exception" /var/log/your-app.log
```

## 7. Автоматизированный тест

Создайте файл `test-deployment.sh`:

```bash
#!/bin/bash
DOMAIN="ваш-домен.ru"

echo "=== Тестирование развертывания на $DOMAIN ==="

# 1. Проверка доступности
echo "1. Проверка доступности..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✓ Сайт доступен (HTTP $HTTP_CODE)"
else
    echo "✗ Ошибка: HTTP $HTTP_CODE"
fi

# 2. Проверка API
echo "2. Проверка API..."
API_RESPONSE=$(curl -s "https://$DOMAIN/api/products?limit=1")
if echo "$API_RESPONSE" | grep -q "products"; then
    echo "✓ API работает"
else
    echo "✗ Ошибка API"
    echo "$API_RESPONSE"
fi

# 3. Проверка SSL
echo "3. Проверка SSL..."
SSL_CHECK=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -checkend 86400)
if [ $? -eq 0 ]; then
    echo "✓ SSL сертификат действителен"
else
    echo "✗ Проблема с SSL сертификатом"
fi

# 4. Проверка производительности
echo "4. Проверка производительности..."
START_TIME=$(date +%s%N)
curl -s -o /dev/null "https://$DOMAIN/api/products?limit=1"
END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME)/1000000))
if [ $DURATION -lt 2000 ]; then
    echo "✓ Время ответа: ${DURATION}ms (норма)"
else
    echo "⚠ Время ответа: ${DURATION}ms (медленно)"
fi

echo "=== Тестирование завершено ==="
```

## 8. Мониторинг после развертывания

### Настройка мониторинга uptime
```bash
# Простой мониторинг с cron
crontab -e
# Добавьте:
*/5 * * * * curl -f https://ваш-домен.ru/api/health >/dev/null 2>&1 || echo "Сайт недоступен" | mail -s "Alert" ваш-email@example.com
```

### Добавление health-check эндпоинта
Добавьте в `server/index.js`:

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## 9. Чеклист для ручной проверки

- [ ] Сайт открывается в браузере
- [ ] HTTPS работает (зеленый замок)
- [ ] Карточки запчастей загружаются
- [ ] Поиск работает
- [ ] Фильтры работают
- [ ] Пагинация работает
- [ ] Изображения загружаются
- [ ] Адаптивный дизайн на мобильных
- [ ] Консоль браузера без ошибок
- [ ] Логи сервера без критических ошибок

## 10. Долгосрочное тестирование

### Проверка стабильности
```bash
# Стресс-тест (легкий)
for i in {1..100}; do
  curl -s -o /dev/null "https://ваш-домен.ru/api/products?limit=1"
done
```

### Проверка памяти
```bash
# Мониторинг использования памяти
pm2 monit
# Или
watch -n 5 'pm2 show partsauto-server | grep memory'
```

## Устранение проблем

Если тесты не проходят:

1. **Сайт недоступен**: проверьте DNS, фаервол, запущен ли сервер
2. **API не работает**: проверьте логи приложения, доступность XML URL
3. **Медленная загрузка**: увеличьте кэширование, оптимизируйте запросы
4. **Ошибки SSL**: обновите сертификат, проверьте настройки Nginx