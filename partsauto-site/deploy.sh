#!/usr/bin/env bash
# Быстрый деплой razbor-vykup: один tar.gz вместо россыпи scp-файлов.
# Деплоит ТОЛЬКО собранный фронт (dist/) и server/index.js.
# НЕ трогает на сервере: server/data/*.json, public/uploads/, server/.env
set -e

HOST="root@razbor-vykup.ru"
REMOTE_DIR="/var/www/razbor-vykup"
PM2_PROC="razbor-vykup"
ARCHIVE="/tmp/razbor-deploy.tar.gz"

echo "→ Сборка фронтенда (vite build)..."
npm run build

echo "→ Упаковка (dist + server/index.js)..."
# Пути относительные от корня проекта — совпадают со структурой на сервере
tar -czf "$ARCHIVE" dist server/index.js

echo "→ Отправка архива на сервер..."
scp "$ARCHIVE" "$HOST:/tmp/"

echo "→ Распаковка и перезапуск PM2..."
ssh "$HOST" "tar -xzf $ARCHIVE -C $REMOTE_DIR && rm -f $ARCHIVE && pm2 restart $PM2_PROC"

rm -f "$ARCHIVE"
echo "✓ Деплой завершён"

# Примечание: если менялся package.json (новые npm-зависимости сервера),
# их нужно доустановить отдельно:
#   scp package.json package-lock.json $HOST:$REMOTE_DIR/
#   ssh $HOST "cd $REMOTE_DIR && npm install --omit=dev && pm2 restart $PM2_PROC"
#
# Если меняешь XML_URL/XML_ENCODING — правь .env на сервере и рестартуй с --update-env:
#   ssh $HOST "pm2 restart $PM2_PROC --update-env"
