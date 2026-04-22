# Руководство по деплою обновлений на сервер

## Структура проекта на сервере

```
/root/partsauto-qwen/partsauto-site/  - основной проект
├── server/                           - серверный код (Node.js)
│   └── index.js                      - главный файл сервера
├── src/                              - исходники React
├── dist/                             - собранный фронтенд
├── public/                           
│   └── uploads/                      - загруженные изображения
├── package.json                      - зависимости
└── ecosystem.config.js               - конфиг PM2

/var/www/partsauto/                   - Nginx раздает статику отсюда
└── dist/                             - симлинк на /root/.../dist
```

---

## Способы деплоя

### 1. Обновление только серверного кода (API)

Когда изменили только `server/index.js`:

```bash
# С вашего компьютера
scp partsauto-site\server\index.js root@217.198.13.45:/root/partsauto-qwen/partsauto-site/server/

# На сервере
ssh root@217.198.13.45 "pm2 restart partsauto-api"
```

---

### 2. Обновление фронтенда (React)

Когда изменили компоненты, стили, страницы:

```bash
# На вашем компьютере
cd d:\РАБОТА\Вова\partsauto-qwen\partsauto-site
npm run build

# Загрузите dist на сервер
scp -r dist root@217.198.13.45:/root/partsauto-qwen/partsauto-site/

# Nginx автоматически начнет раздавать новые файлы
```

---

### 3. Полный деплой (сервер + фронтенд)

Когда изменили и сервер, и фронтенд:

```bash
# На вашем компьютере
cd d:\РАБОТА\Вова\partsauto-qwen\partsauto-site

# Соберите фронтенд
npm run build

# Загрузите файлы
scp server\index.js root@217.198.13.45:/root/partsauto-qwen/partsauto-site/server/
scp -r dist root@217.198.13.45:/root/partsauto-qwen/partsauto-site/

# Перезапустите сервер
ssh root@217.198.13.45 "pm2 restart partsauto-api"
```

---

### 4. Обновление зависимостей

Когда добавили новые npm пакеты:

```bash
# Загрузите package.json
scp partsauto-site\package.json root@217.198.13.45:/root/partsauto-qwen/partsauto-site/

# На сервере установите зависимости
ssh root@217.198.13.45 "cd /root/partsauto-qwen/partsauto-site && npm install && pm2 restart partsauto-api"
```

---

## Автоматический деплой через скрипт

Создайте файл `deploy.bat` в корне проекта:

```batch
@echo off
echo ========================================
echo Деплой на сервер
echo ========================================

set SERVER=root@217.198.13.45
set REMOTE=/root/partsauto-qwen/partsauto-site

echo [1/4] Сборка фронтенда...
cd partsauto-site
call npm run build
if errorlevel 1 exit /b 1

echo [2/4] Загрузка server/index.js...
scp server\index.js %SERVER%:%REMOTE%/server/

echo [3/4] Загрузка dist...
scp -r dist %SERVER%:%REMOTE%/

echo [4/4] Перезапуск PM2...
ssh %SERVER% "pm2 restart partsauto-api && pm2 logs partsauto-api --lines 10"

echo.
echo ========================================
echo Деплой завершен!
echo ========================================
pause
```

Затем просто запускайте `deploy.bat` для деплоя.

---

## Проверка после деплоя

### 1. Проверьте статус PM2:

```bash
ssh root@217.198.13.45 "pm2 list"
```

Должно быть `status: online`

### 2. Проверьте логи:

```bash
ssh root@217.198.13.45 "pm2 logs partsauto-api --lines 30"
```

Не должно быть ошибок.

### 3. Проверьте API:

```bash
curl https://parts-auto-test.ru/api/health
```

Должен вернуть JSON со статусом.

### 4. Проверьте сайт в браузере:

```
https://parts-auto-test.ru
```

---

## Откат к предыдущей версии

Если что-то пошло не так:

```bash
# На сервере
ssh root@217.198.13.45

# Восстановите из резервной копии (если создавали)
cp /root/partsauto-backup-YYYYMMDD/server/index.js /root/partsauto-qwen/partsauto-site/server/

# Перезапустите
pm2 restart partsauto-api
```

---

## Настройка Git для автоматического деплоя

### На сервере:

```bash
cd /root/partsauto-qwen
git init
git remote add origin https://github.com/ваш-репозиторий.git
```

### Затем для деплоя:

```bash
ssh root@217.198.13.45 "cd /root/partsauto-qwen && git pull && cd partsauto-site && npm install && npm run build && pm2 restart partsauto-api"
```

---

## Мониторинг

### Просмотр логов в реальном времени:

```bash
ssh root@217.198.13.45 "pm2 logs partsauto-api"
```

### Просмотр использования ресурсов:

```bash
ssh root@217.198.13.45 "pm2 monit"
```

### Просмотр логов Nginx:

```bash
ssh root@217.198.13.45 "tail -f /var/log/nginx/partsauto_error.log"
```

---

## Частые проблемы

### API не работает после деплоя

```bash
# Проверьте логи
ssh root@217.198.13.45 "pm2 logs partsauto-api --err --lines 50"

# Перезапустите
ssh root@217.198.13.45 "pm2 restart partsauto-api"
```

### Изображения не отображаются

```bash
# Проверьте права
ssh root@217.198.13.45 "ls -la /root/partsauto-qwen/partsauto-site/public/uploads/cars/"

# Дайте права
ssh root@217.198.13.45 "chmod -R 755 /root/partsauto-qwen/partsauto-site/public/uploads"
```

### Старая версия фронтенда

```bash
# Очистите кэш браузера (Ctrl+Shift+R)
# Или проверьте, что dist обновился на сервере
ssh root@217.198.13.45 "ls -la /root/partsauto-qwen/partsauto-site/dist/"
```

---

## Резервное копирование

Перед важными обновлениями:

```bash
ssh root@217.198.13.45 "tar -czf /root/partsauto-backup-$(date +%Y%m%d_%H%M%S).tar.gz /root/partsauto-qwen/partsauto-site"
```

Восстановление:

```bash
ssh root@217.198.13.45 "tar -xzf /root/partsauto-backup-YYYYMMDD_HHMMSS.tar.gz -C /"
```
