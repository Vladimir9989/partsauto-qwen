@echo off
chcp 65001 >nul
echo ========================================
echo Деплой на сервер parts-auto-test.ru
echo ========================================
echo.

set SERVER=root@217.198.13.45
set REMOTE=/root/partsauto-qwen/partsauto-site

echo [1/4] Сборка фронтенда...
cd partsauto-site
call npm run build
if errorlevel 1 (
    echo ОШИБКА: Не удалось собрать фронтенд
    cd ..
    pause
    exit /b 1
)
cd ..

echo [2/4] Загрузка server/index.js...
scp partsauto-site\server\index.js %SERVER%:%REMOTE%/server/
if errorlevel 1 (
    echo ОШИБКА: Не удалось загрузить server/index.js
    pause
    exit /b 1
)

echo [3/4] Загрузка dist...
scp -r partsauto-site\dist %SERVER%:%REMOTE%/
if errorlevel 1 (
    echo ОШИБКА: Не удалось загрузить dist
    pause
    exit /b 1
)

echo [4/4] Перезапуск PM2...
ssh %SERVER% "pm2 restart partsauto-api"
if errorlevel 1 (
    echo ОШИБКА: Не удалось перезапустить PM2
    pause
    exit /b 1
)

echo.
echo Проверка логов...
ssh %SERVER% "pm2 logs partsauto-api --lines 10 --nostream"

echo.
echo ========================================
echo ✓ Деплой завершен успешно!
echo ========================================
echo.
echo Проверьте сайт: https://parts-auto-test.ru
echo.
pause
