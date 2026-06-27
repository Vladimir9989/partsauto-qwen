# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Что это за проект

**Разбор Выкуп** — сайт автосалона-разборки из Режа. Две функции: каталог б/у автозапчастей и витрина автомобилей на выкуп. Стек: React 18 + Vite (фронтенд) + Express 5 (бэкенд). TypeScript отсутствует.

## Команды

### Разработка (нужно запустить оба процесса одновременно)

```bash
npm run server   # Express API на порту 3001
npm run dev      # Vite dev-сервер на порту 5176 (проксирует /api → localhost:3001)
```

### Сборка и деплой

```bash
npm run build    # Vite build → dist/
npm run deploy   # build + scp dist/* на сервер 217.198.13.45:/var/www/partsauto/
npm start        # запуск Express в продакшене (обслуживает dist/ как статику)
```

В продакшене Express управляется PM2 через `ecosystem.config.js` (процесс `partsauto-server`, порт 3001, 1 экземпляр).

**Важно:** `npm run deploy` копирует только `dist/*` (фронтенд). Серверный код `server/index.js` деплоится отдельно:
```bash
scp server/index.js root@217.198.13.45:/var/www/partsauto/server/index.js
ssh root@217.198.13.45 "pm2 restart partsauto-server"
```

## Архитектура

### Два режима работы

**Разработка:** Vite (`:5176`) + Express (`:3001`) работают раздельно. Vite проксирует `/api/*` на Express через `vite.config.js`.

**Продакшен:** только Express (`:3001`) — отдаёт статику из `dist/` и API. SPA-фоллбэк на `dist/index.html` подключён последним маршрутом.

### Источники данных

| Данные | Хранение |
|--------|----------|
| Запчасти (товары) | Avito XML-фид, кэш в памяти 5 мин (`CACHE_DURATION`) |
| Автомобили на витрине | `server/data/cars.json` (плоский JSON) |
| Новости | `server/data/news.json` (плоский JSON) |
| Корзина | `localStorage` через Zustand persist (`partsauto-cart`) |

Фид запчастей — формат **Avito XML** (`<Ads>/<Ad>`). Ключевые поля: `<Title>`, `<Make>`, `<Model>`, `<Generation>`, `<SparePartType>` (категория для фильтра), `<Price>`, `<Images>/<Image url="...">`.

Текущий фид (partsauto.market): `https://ycf.partsauto.market/partsauto-feeds/avito_feeds/cb9901e562a4f410bd4f9bf80c21d094.xml`

URL задаётся через `XML_URL` в `.env`. При `price = 0` товар отображается как «Цена по запросу».

**Переход на CRM-фид:** поменять `XML_URL` в `.env`. Если фид в windows-1251 — установить `XML_ENCODING=windows-1251`, по умолчанию `utf-8`. После перехода проверить фильтр по поколению (в нашем CRM поколение вшито в строку `<Model>`, не в отдельный тег).

### API эндпоинты (все в `server/index.js`)

```
GET  /api/products          # товары из XML с фильтрацией и пагинацией
GET  /api/categories        # уникальные SparePartType из кэша (для фильтра)
GET  /api/health            # состояние сервера и кэша
GET/POST/PUT/DELETE /api/cars/:id   # карточки автомобилей
GET/POST/PUT/DELETE /api/news/:id   # новости
POST /api/upload-car-image          # загрузка одного фото машины
POST /api/upload-car-images         # загрузка нескольких фото (до 10)
POST /api/upload-news-image         # загрузка фото новости
POST /api/send-order-email          # отправка заказа (email + Telegram)
```

Загруженные изображения сохраняются в `public/uploads/cars/` и `public/uploads/news/` и отдаются Express как статика.

### Фронтенд-маршруты

```
/              MainPage
/catalog       CatalogPage — товары из XML с фильтрами и пагинацией
/cart          CartPage
/news          NewsPage
/news/:id      NewsDetailPage
/car-buyback   CarBuybackPage
/delivery      DeliveryPage
/warranty      WarrantyPage
/admin         AdminPage — защищена паролем
```

### Глобальное состояние

- **Корзина** — Zustand store (`src/store/useCartStore.js`), persisted в localStorage. Поддерживает товары с ценой «по запросу» (флаг `hasRequestPrice`).
- **Тема** — React Context (`src/context/ThemeContext.jsx`), dark/light. Применяется через `data-theme` на `<html>`. Дефолт — тёмная. При смене темы меняет цвет кнопки виджета доставки (dostavka.sbl.su) через DOM.

### Стилизация

CSS Modules (`.module.css`) для каждого компонента/страницы. Глобальные CSS-переменные (`--bg-primary`, `--text-primary`, `--border-color` и др.) в `src/index.css` — именно через них работает переключение темы. Bootstrap Icons подключены через CDN в `index.html`.

### Внешние интеграции

- **Яндекс.Метрика** (ID: 109135098) — подключена в `index.html`
- **Виджет доставки** dostavka.sbl.su — загружается в `ThemeContext.jsx` один раз при монтировании
- **Email** — Nodemailer через SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` в `.env`)
- **Telegram** — уведомления о заказах (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` в `.env`)

### Важные особенности

- Пароль админки захардкожен в `src/pages/AdminPage.jsx` как `ADMIN_PASSWORD = 'admin123'`
- Редактор новостей в админке — TipTap (не react-quill, хотя quill тоже в зависимостях)
- `CatalogPage` синхронизирует фильтры бренд/модель/поколение с URL query params; фильтр категории в URL не сохраняется
- При удалении карточки автомобиля физические файлы изображений удаляются с диска (`server/index.js`)
- `dist/` в `.gitignore` — перед деплоем нужно собирать
- Файл `src/config.js` содержит настройки пагинации и debounce

## Деплой: что куда попадает

### Что деплоит `npm run deploy`

Команда выполняет `vite build`, затем `scp -r dist/* root@217.198.13.45:/var/www/partsauto/`.

**Попадает на сервер:** только собранный фронтенд — HTML, JS, CSS, картинки из `src/assets/`.

**НЕ попадает на сервер:**
- `server/index.js` — деплоится отдельно через scp (см. выше)
- `server/data/news.json` — новости хранятся на сервере и управляются только через админку
- `server/data/cars.json` — то же самое для автомобилей
- `public/uploads/` — загруженные через админку изображения хранятся на сервере отдельно

### Управление данными (новости и автомобили)

Данные живут **только на сервере**. Локальные `server/data/*.json` — только для разработки.

| Действие | Способ |
|----------|--------|
| Создать/редактировать новость | Админка на продакшен-сайте |
| Создать/редактировать авто | Админка на продакшен-сайте |
| Добавить данные программно | `PUT /api/news/:id` или `PUT /api/cars/:id` |

Если данные изменены локально и нужно синхронизировать с сервером — использовать API напрямую (`PUT` принимает любые поля через spread).

### Загрузка изображений на сервер

`npm run deploy` **не загружает** картинки из `public/uploads/` на продакшен. Единственный надёжный способ добавить изображение — через API:

```bash
# Загрузить фото новости
curl -X POST https://razbor-vykup.ru/api/upload-news-image -F "image=@/path/to/file.jpg"
# → вернёт { "imageUrl": "/uploads/news/timestamp-random.jpg" }

# Загрузить фото автомобиля
curl -X POST https://razbor-vykup.ru/api/upload-car-image -F "image=@/path/to/file.jpg"
```

Возвращённый `imageUrl` использовать в контенте новости или в поле `images` карточки авто. API не требует авторизации.

## Переменные окружения (`.env`)

```
PORT=3001
XML_URL=<url avito xml-фида с запчастями>
XML_ENCODING=utf-8          # кодировка фида; windows-1251 для cp1251-фидов
CACHE_DURATION=300000       # мс, время кэша товаров
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MANAGER_EMAIL=              # куда приходят письма о заказах
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```
