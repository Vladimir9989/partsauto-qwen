# Миграция с XML-фида Авито на XML-фид Дрома

## Описание

Успешно адаптирован парсер XML для работы с фидом Дрома вместо Авито. Все функции фильтрации, поиска и пагинации сохранены и работают корректно.

## Изменённые файлы

### 1. `.env.example`
**Изменение:** Обновлена ссылка на XML-фид
```
# Было:
XML_URL=https://ycf.partsauto.market/partsauto-feeds/avito_feeds/cb9901e562a4f410bd4f9bf80c21d094.xml

# Стало:
XML_URL=https://ycf.partsauto.market/partsauto-feeds/drom_feeds/cb9901e562a4f410bd4f9bf80c21d094.xml
```

### 2. `.env`
**Изменение:** Добавлена новая ссылка на фид Дрома и стандартные переменные окружения
```
XML_URL=https://ycf.partsauto.market/partsauto-feeds/drom_feeds/cb9901e562a4f410bd4f9bf80c21d094.xml
PORT=3001
NODE_ENV=production
CACHE_DURATION=300000
```

### 3. `server/index.js` - функция `fetchAndParseXML()`

#### Основные изменения:

**Структура XML Дрома:**
```xml
<offers dateUpdated="2026-04-27 16:46:50" adCount="11069">
  <offer id="2abd55c6-4d1a-450c-a6ed-868d3d9bc8e6">
    <name>Стеклоподъемник задней левой двери Daewoo Matiz</name>
    <description>...</description>
    <price>0</price>
    <currencyId>RUR</currencyId>
    <condition>Б/у</condition>
    <brandcars>Daewoo</brandcars>
    <modelcars>Matiz, I</modelcars>
    <year>2000</year>
    <lr>лево</lr>
    <fr>задний</fr>
    <picture>https://url1.jpg, https://url2.jpg</picture>
  </offer>
</offers>
```

**Парсинг изображений:**
- Дром передаёт изображения в виде строки, разделённой запятыми
- Реализована функция разбора строки на массив URL:
```javascript
if (offer.picture) {
  const pictureStr = typeof offer.picture === 'string' ? offer.picture : '';
  if (pictureStr.trim()) {
    images = pictureStr
      .split(',')
      .map(url => url.trim())
      .filter(url => url && url.length > 0);
  }
}
```

**Парсинг модели и поколения:**
- Дром передаёт модель и поколение в одном поле: `modelcars="Matiz, I"`
- Реализована функция разбора на отдельные поля:
```javascript
if (carModel && typeof carModel === 'string') {
  const modelParts = carModel.split(',').map(p => p.trim());
  if (modelParts.length > 1) {
    carModel = modelParts[0];
    generation = modelParts.slice(1).join(', ');
  }
}
```

**Определение категории:**
- Категория определяется по расположению детали (левое/правое, переднее/заднее):
```javascript
let category = '';
if (offer.lr || offer.fr) {
  const parts = [];
  if (offer.lr) parts.push(offer.lr);
  if (offer.fr) parts.push(offer.fr);
  category = parts.join(' ');
}
```

**Обработка цены:**
- Товары с ценой 0 преобразуются в пустую строку для отображения "Цена по запросу":
```javascript
// Преобразуем цену 0 в пустую строку для отображения "Цена по запросу"
let price = offer.price || '';
if (price === '0' || price === 0) {
  price = '';
}
```

## Маппирование полей

| Дром | Авито | Поле в API |
|------|-------|-----------|
| `@_id` | `Id` | `id` |
| `name` | `Title` | `title` |
| `description` | `Description` | `description` |
| `price` | `Price` | `price` |
| `brandcars` | `Brand` | `brand`, `carMake` |
| `modelcars` | `Model` | `carModel`, `generation` |
| `condition` | `Condition` | `condition` |
| `year` | - | `year` |
| `lr` + `fr` | `InstallationLocation` | `category`, `installationLocation` |
| `picture` | `Images.Image` | `images` |

## Функциональность

### Поддерживаемые фильтры
✅ **Поиск** - по названию, описанию, марке и модели автомобиля
✅ **Фильтр по марке** - `brand`
✅ **Фильтр по модели** - `carModel`
✅ **Фильтр по поколению** - `generation`
✅ **Фильтр по категории** - `category`
✅ **Фильтр по цене** - `priceMin`, `priceMax`
✅ **Пагинация** - `page`, `limit`

### Примеры запросов

**Получить все товары:**
```bash
curl "http://localhost:3001/api/products?limit=20&page=1"
```

**Фильтр по марке и модели:**
```bash
curl "http://localhost:3001/api/products?brand=Daewoo&carModel=Matiz&limit=20"
```

**Фильтр по цене:**
```bash
curl "http://localhost:3001/api/products?priceMin=100&priceMax=5000&limit=20"
```

**Комбинированный фильтр:**
```bash
curl "http://localhost:3001/api/products?brand=Toyota&priceMin=1000&priceMax=10000&limit=20&page=1"
```

## Результаты тестирования

✅ **Загрузка XML:** 11069 товаров успешно загружены
✅ **Парсинг полей:** Все поля корректно извлекаются
✅ **Изображения:** Строки с запятыми правильно разбиваются на массив URL
✅ **Фильтрация по марке/модели:** Работает корректно (243 товара для Daewoo Matiz)
✅ **Фильтрация по цене:** Работает корректно (8212 товаров в диапазоне 100-5000 ₽)
✅ **Кэширование:** Данные кэшируются на 5 минут
✅ **Отображение цены:** Товары с ценой 0 отображаются как "Цена по запросу"

## Кэширование

- **Время кэша:** 5 минут (300000 мс)
- **Переменная окружения:** `CACHE_DURATION`
- **Поведение:** При первом запросе загружается XML, затем используется кэш до истечения времени

## Обработка цены в UI

На клиентской стороне реализована логика отображения цены:

**ProductCard.jsx** (строки 154-158):
```javascript
<div className={styles.priceContainer}>
  {product.price ? (
    <span className={styles.priceBadge}>{formatPrice(product.price)}</span>
  ) : (
    <span className={styles.priceRequest}>Цена по запросу</span>
  )}
</div>
```

**ProductModal.jsx** (строки 137-141):
```javascript
<div className="price-section mb-4">
  {product.price ? (
    <h2 className="price-large text-primary">{formatPrice(product.price)}</h2>
  ) : (
    <h4 className="text-muted">Цена по запросу</h4>
  )}
</div>
```

## Примечания

1. **Цена "по запросу":** Товары с ценой 0 преобразуются в пустую строку на сервере, что приводит к отображению "Цена по запросу" в UI
2. **Условие:** По умолчанию "Б/у" (используется из фида)
3. **Оригинальность:** Поле не заполняется (отсутствует в фиде Дрома)
4. **Адрес и телефон:** Поля не заполняются (отсутствуют в фиде Дрома)

## Развёртывание

1. Убедитесь, что в `.env` установлена правильная ссылка на фид Дрома
2. Перезагрузите сервер: `node server/index.js`
3. Проверьте эндпоинт `/api/health` для статуса кэша
