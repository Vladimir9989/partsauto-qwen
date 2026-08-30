import express from 'express';
import cors from 'cors';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Переменные окружения для Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Настройка хранилища для изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/cars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только изображения!'));
  }
});

// Пути к файлам данных
const CARS_DATA_FILE = path.join(__dirname, 'data', 'cars.json');
const NEWS_DATA_FILE = path.join(__dirname, 'data', 'news.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

function getCarsList() {
  try {
    if (fs.existsSync(CARS_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(CARS_DATA_FILE, 'utf8'));
    }
  } catch (error) { console.error('Ошибка чтения cars.json:', error); }
  return [];
}

function saveCarsList(cars) {
  try {
    fs.writeFileSync(CARS_DATA_FILE, JSON.stringify(cars, null, 2), 'utf8');
    return true;
  } catch (error) { console.error('Ошибка сохранения cars.json:', error); return false; }
}

function getNewsList() {
  try {
    if (fs.existsSync(NEWS_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(NEWS_DATA_FILE, 'utf8'));
    }
  } catch (error) { console.error('Ошибка чтения news.json:', error); }
  return [];
}

function saveNewsList(news) {
  try {
    fs.writeFileSync(NEWS_DATA_FILE, JSON.stringify(news, null, 2), 'utf8');
    return true;
  } catch (error) { console.error('Ошибка сохранения news.json:', error); return false; }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Настройка Nodemailer для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER || 'antoinette.dibbert96@ethereal.email',
    pass: process.env.SMTP_PASS || 'qgFc4F8DzdYax1dumh'
  }
});

// Проверка подключения к SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('Ошибка подключения к SMTP:', error);
  } else {
    console.log('SMTP сервер готов к отправке писем');
  }
});

const XML_URL = process.env.XML_URL || 'https://ycf.partsauto.market/partsauto-feeds/avito_feeds/cb9901e562a4f410bd4f9bf80c21d094.xml';
const XML_ENCODING = process.env.XML_ENCODING || 'utf-8';

let cachedProducts = [];
let lastFetch = null;
const CACHE_DURATION = process.env.CACHE_DURATION ? parseInt(process.env.CACHE_DURATION) : 5 * 60 * 1000;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  trimValues: true,
  isArray: (name) => ['Ad', 'Image', 'CompatibleCar'].includes(name),
});

// ===== ПОДКАТЕГОРИИ ЗАПЧАСТЕЙ =====
// В Avito-фиде родной тег подкатегории есть только у части категорий
// (Кузов, Двигатель, Трансмиссия). Для остальных подкатегория определяется
// по ключевым словам в названии товара: правила перебираются по порядку,
// первое совпадение побеждает, без совпадений — «Прочее».
const NATIVE_SUBCATEGORY_TAGS = [
  'BodySparePartType',
  'TransmissionSparePartType',
  'EngineSparePartType',
  'TechnicSparePartType',
];

const OTHER_SUBCATEGORY = 'Прочее';

const SUBCATEGORY_RULES = {
  'Электрооборудование': [
    { name: 'Стеклоподъёмники', kw: ['стеклоподъ'] },
    { name: 'Блоки управления', kw: ['блок управления', 'блок комфорта', 'блок abs', 'блок srs', 'электронный блок', 'блок розжига', 'блок предохранителей', 'блок '] },
    { name: 'Щитки приборов', kw: ['щиток приборов', 'панель приборов', 'приборная панель', 'спидометр'] },
    { name: 'Моторчики и вентиляторы', kw: ['моторчик', 'мотор отопителя', 'мотор охлаждения', 'мотор печки', 'вентилятор'] },
    { name: 'Проводка', kw: ['проводка', 'жгут'] },
    { name: 'Генераторы и стартеры', kw: ['генератор', 'стартер'] },
    { name: 'Катушки зажигания', kw: ['катушка'] },
    { name: 'Замки и активаторы', kw: ['замок зажигания', 'активатор', 'центральный замок'] },
    { name: 'Датчики', kw: ['датчик', 'лямбда', 'указатель уровня'] },
    { name: 'Реле', kw: ['реле'] },
    { name: 'Звуковые сигналы', kw: ['звуковой сигнал', 'клаксон'] },
    { name: 'Трапеции и дворники', kw: ['трапеция', 'дворник'] },
    { name: 'Омыватели', kw: ['омывател'] },
    { name: 'Аудио и мультимедиа', kw: ['магнитол', 'динамик', 'антенн'] },
    { name: 'Кнопки и переключатели', kw: ['кнопк', 'переключател', 'подрулево'] },
  ],
  'Стекла': [
    { name: 'Стёкла дверей', kw: ['стекло двер'] },
    { name: 'Форточки', kw: ['форточка', 'форточки'] },
    { name: 'Лобовое стекло', kw: ['лобовое'] },
    { name: 'Заднее стекло', kw: ['заднее стекло', 'стекло заднее'] },
    { name: 'Стёкла кузова', kw: ['стекло кузова', 'кузовные стекла', 'собачника', 'глухое'] },
    { name: 'Дворники', kw: ['дворник'] },
    { name: 'Люки', kw: ['люк'] },
  ],
  'Автосвет': [
    { name: 'Противотуманные фары', kw: ['противотуман', 'птф'] },
    { name: 'Фары', kw: ['фара', 'фары'] },
    { name: 'Фонари', kw: ['фонар', 'стоп-сигнал', 'стоп сигнал'] },
    { name: 'Поворотники', kw: ['поворотник', 'указатель поворота'] },
    { name: 'Плафоны и подсветка', kw: ['плафон', 'подсветк'] },
  ],
  'Тормозная система': [
    { name: 'Блоки ABS', kw: ['abs', 'абс'] },
    { name: 'Суппорты', kw: ['суппорт'] },
    { name: 'Тормозные диски', kw: ['диск'] },
    { name: 'Вакуумные усилители', kw: ['вакуум', 'усилитель тормозов'] },
    { name: 'Стояночный тормоз', kw: ['стояночн', 'ручник'] },
    { name: 'Тормозные цилиндры', kw: ['цилиндр'] },
    { name: 'Тросы', kw: ['трос'] },
    { name: 'Колодки', kw: ['колодк'] },
    { name: 'Барабаны', kw: ['барабан'] },
  ],
  'Рулевое управление': [
    { name: 'Рулевые рейки', kw: ['рейка', 'рейки'] },
    { name: 'Рулевые колонки', kw: ['колонка', 'колонки'] },
    { name: 'Рули', kw: ['руль'] },
    { name: 'ГУР и ЭУР', kw: [' гур', ' эур', 'эгур', 'гидроусилител', 'электроусилител'] },
    { name: 'Тяги и наконечники', kw: ['тяга', 'тяги', 'наконечник'] },
    { name: 'Карданчики рулевые', kw: ['кардан'] },
  ],
  'Салон': [
    { name: 'Сиденья', kw: ['сиден', 'кресл'] },
    { name: 'Обшивки', kw: ['обшивк'] },
    { name: 'Центральная консоль', kw: ['консоль'] },
    { name: 'Торпедо', kw: ['торпед', 'панель салона'] },
    { name: 'Ремни безопасности', kw: ['ремень', 'ремни'] },
    { name: 'Подушки безопасности', kw: ['подушка безопасности', 'airbag', 'аирбаг'] },
    { name: 'Педали', kw: ['педаль'] },
    { name: 'Козырьки', kw: ['козыр'] },
    { name: 'Ковры', kw: ['ковер', 'ковёр', 'коврик'] },
    { name: 'Отопитель', kw: ['отопител', 'печк'] },
    { name: 'Ручки', kw: ['ручка', 'ручки'] },
    { name: 'Полки', kw: ['полка'] },
    { name: 'Уплотнители', kw: ['уплотнител'] },
    { name: 'Кулисы КПП', kw: ['кулиса'] },
  ],
  'Подвеска': [
    { name: 'Амортизаторы и стойки', kw: ['амортизатор', 'стойк'] },
    { name: 'Рычаги', kw: ['рычаг'] },
    { name: 'Пружины', kw: ['пружин'] },
    { name: 'Поворотные кулаки', kw: ['кулак'] },
    { name: 'Ступицы', kw: ['ступиц'] },
    { name: 'Стабилизаторы', kw: ['стабилизатор'] },
    { name: 'Подрамники', kw: ['подрамник'] },
    { name: 'Балки', kw: ['балка'] },
    { name: 'Сайлентблоки и шаровые', kw: ['сайлент', 'шаров'] },
  ],
  'Система охлаждения': [
    { name: 'Кондиционер', kw: ['кондиционер', 'компрессор'] },
    { name: 'Радиаторы', kw: ['радиатор'] },
    { name: 'Расширительные бачки', kw: ['бачок'] },
    { name: 'Вентиляторы', kw: ['вентилятор', 'крыльчат'] },
    { name: 'Термостаты', kw: ['термостат'] },
    { name: 'Помпы', kw: ['помпа', 'насос'] },
    { name: 'Отопитель', kw: ['отопител', 'печк'] },
  ],
  'Топливная и выхлопная системы': [
    { name: 'Бензобаки', kw: ['бензобак', 'топливный бак', 'бак '] },
    { name: 'Дроссельные заслонки', kw: ['дроссель'] },
    { name: 'Выхлопная система', kw: ['глушител', 'выхлоп', 'резонатор', 'катализатор', 'коллектор'] },
    { name: 'Топливные насосы', kw: ['насос'] },
    { name: 'Форсунки и рампы', kw: ['форсунк', 'рампа', 'рейка топливная', 'топливная рейка'] },
    { name: 'Абсорберы', kw: ['абсорбер', 'адсорбер'] },
    { name: 'Трубки и магистрали', kw: ['трубк', 'магистрал'] },
    { name: 'Горловины', kw: ['горловин'] },
    { name: 'Фильтры', kw: ['фильтр'] },
  ],
};

function deriveSubcategory(category, title) {
  const rules = SUBCATEGORY_RULES[category];
  if (!rules) return '';
  const t = ' ' + String(title).toLowerCase() + ' ';
  for (const rule of rules) {
    if (rule.kw.some(k => t.includes(k))) return rule.name;
  }
  return OTHER_SUBCATEGORY;
}

async function fetchAndParseXML() {
  console.log('Загрузка XML...');
  const response = await fetch(XML_URL);
  const enc = XML_ENCODING.toLowerCase().replace(/[-_]/g, '');
  let xmlText;
  if (enc === 'utf8') {
    xmlText = await response.text();
  } else {
    const buffer = await response.arrayBuffer();
    xmlText = new TextDecoder(XML_ENCODING).decode(buffer);
  }
  const result = parser.parse(xmlText);
  const ads = result.Ads?.Ad || [];
  console.log(`Найдено объявлений: ${ads.length}`);

  const products = ads.map(ad => {
    // Изображения из <Images><Image url="..."/></Images>
    const images = [];
    if (ad.Images) {
      const imageList = Array.isArray(ad.Images.Image) ? ad.Images.Image
                      : ad.Images.Image ? [ad.Images.Image] : [];
      imageList.forEach(img => {
        if (img && img['@_url']) images.push(img['@_url']);
      });
    }

    // Марка и модель
    const carMake = ad.Make || ad.Brand || 'Разное';
    let carModel = ad.Model ? String(ad.Model) : '';

    // Поколение: берём тег <Generation>, если нет — пробуем извлечь из <Model>
    // (для фидов CRM, где поколение вшито в название модели через запятую)
    let generation = ad.Generation ? String(ad.Generation) : '';
    if (!generation && carModel) {
      const modelParts = carModel.split(',').map(p => p.trim());
      if (modelParts.length > 1) {
        carModel = modelParts[0];
        generation = modelParts.slice(1).join(', ');
      }
    }

    // SparePartType → category (основной фильтр)
    const category = ad.SparePartType ? String(ad.SparePartType) : '';

    // Подкатегория: родной тег фида, иначе — по ключевым словам из названия
    let subcategory = '';
    for (const nativeTag of NATIVE_SUBCATEGORY_TAGS) {
      if (ad[nativeTag]) { subcategory = String(ad[nativeTag]); break; }
    }
    if (!subcategory) {
      subcategory = deriveSubcategory(category, ad.Title || '');
    }

    // Цена: 0 и 0.00 → «Цена по запросу»
    let price = (ad.Price !== undefined && ad.Price !== null) ? String(ad.Price) : '';
    if (price === '0' || price === '0.0' || price === '0.00') price = '';

    return {
      id: ad.Id ? String(ad.Id) : '',
      title: ad.Title ? String(ad.Title) : '',
      description: ad.Description ? String(ad.Description) : '',
      price,
      brand: carMake,
      condition: ad.Condition || 'Б/у',
      originality: '',
      originalVendor: ad.OriginalVendor || ad.OEM || '',
      carMake,
      carModel,
      generation,
      category,
      subcategory,
      installationLocation: '',
      address: '',
      phone: '',
      dateStart: '',
      dateEnd: '',
      images,
      year: '',
    };
  });

  return products;
}

// ===== ВСЕ API МАРШРУТЫ =====
app.get('/api/products', async (req, res) => {
  try {
    const now = Date.now();
    if (!lastFetch || (now - lastFetch) > CACHE_DURATION || cachedProducts.length === 0) {
      cachedProducts = await fetchAndParseXML();
      lastFetch = now;
      console.log(`Загружено ${cachedProducts.length} товаров`);
    }

    let results = cachedProducts;
    const { search, brand, category, subcategory, carModel, generation, priceMin, priceMax, page, limit } = req.query;

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(p => {
        const titleMatch = p.title && typeof p.title === 'string' && p.title.toLowerCase().includes(s);
        const modelMatch = p.carModel && typeof p.carModel === 'string' && p.carModel.toLowerCase().includes(s);
        const makeMatch = p.carMake && typeof p.carMake === 'string' && p.carMake.toLowerCase().includes(s);
        const descMatch = p.description && typeof p.description === 'string' && p.description.toLowerCase().includes(s);
        return titleMatch || modelMatch || makeMatch || descMatch;
      });
    }
    if (brand) results = results.filter(p => p.brand === brand);
    if (category) results = results.filter(p => p.category === category);
    if (subcategory) results = results.filter(p => p.subcategory === subcategory);
    if (carModel) results = results.filter(p => p.carModel === carModel);
    if (generation) results = results.filter(p => p.generation === generation);

    const minPrice = priceMin ? parseFloat(priceMin) : null;
    const maxPrice = priceMax ? parseFloat(priceMax) : null;
    if (minPrice !== null) results = results.filter(p => (parseFloat(p.price) || 0) >= minPrice);
    if (maxPrice !== null) results = results.filter(p => (parseFloat(p.price) || 0) <= maxPrice);

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const total = results.length;
    const start = (pageNum - 1) * limitNum;
    const items = results.slice(start, start + limitNum);

    res.json({ products: items, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('Ошибка загрузки:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const now = Date.now();
    if (!lastFetch || (now - lastFetch) > CACHE_DURATION || cachedProducts.length === 0) {
      cachedProducts = await fetchAndParseXML();
      lastFetch = now;
    }
    const seen = new Set();
    const subMap = {};
    cachedProducts.forEach(p => {
      if (!p.category) return;
      seen.add(p.category);
      if (p.subcategory) {
        (subMap[p.category] = subMap[p.category] || new Set()).add(p.subcategory);
      }
    });
    // «Прочее» всегда в конце списка; категории, где кроме «Прочего» ничего нет, — без подкатегорий
    const subcategories = {};
    for (const [cat, subs] of Object.entries(subMap)) {
      const sorted = [...subs].filter(s => s !== OTHER_SUBCATEGORY).sort();
      if (sorted.length === 0) continue;
      if (subs.has(OTHER_SUBCATEGORY)) sorted.push(OTHER_SUBCATEGORY);
      subcategories[cat] = sorted;
    }
    res.json({ categories: [...seen].sort(), subcategories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cachedProducts: cachedProducts.length,
    lastFetch: lastFetch ? new Date(lastFetch).toISOString() : null
  });
});

app.get('/api/cars', (req, res) => {
  res.json({ success: true, data: getCarsList() });
});

app.post('/api/cars', express.json(), (req, res) => {
  const { title, date, link, images, description } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Не указан заголовок' });
  
  const cars = getCarsList();
  const newCard = {
    id: Date.now(),
    title,
    date: date || new Date().toLocaleDateString('ru-RU'),
    link: link || '#',
    images: images || [],
    description: description || '',
    createdAt: new Date().toISOString()
  };
  cars.unshift(newCard);
  saveCarsList(cars);
  res.json({ success: true, data: newCard });
});

app.put('/api/cars/:id', express.json(), (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, images } = req.body;
  const cars = getCarsList();
  const index = cars.findIndex(car => car.id === id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Карточка не найдена' });
  }
  
  const oldImages = cars[index].images || [];
  const newImages = images !== undefined ? images : oldImages;
  
  // Удаляем физические файлы, которые были удалены из массива images
  if (images !== undefined) {
    const uploadsDir = path.join(__dirname, '../public/uploads/cars');
    const removedImages = oldImages.filter(img => !newImages.includes(img));
    
    removedImages.forEach(imageUrl => {
      try {
        // Проверяем, что это локальный путь (начинается с /uploads/cars/)
        if (imageUrl && imageUrl.startsWith('/uploads/cars/')) {
          // Извлекаем имя файла из пути /uploads/cars/filename.jpg
          const filename = imageUrl.replace('/uploads/cars/', '');
          const filePath = path.join(uploadsDir, filename);
          
          // Удаляем файл, если он существует
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Файл удалён: ${filePath}`);
          } else {
            console.log(`Файл не найден для удаления: ${filePath}`);
          }
        }
      } catch (error) {
        console.error(`Ошибка при удалении файла ${imageUrl}:`, error.message);
        // Продолжаем удаление других файлов даже при ошибке
      }
    });
  }
  
  cars[index] = {
    ...cars[index],
    title: title || cars[index].title,
    description: description !== undefined ? description : cars[index].description,
    images: newImages,
    updatedAt: new Date().toISOString()
  };
  
  saveCarsList(cars);
  res.json({ success: true, data: cars[index] });
});

app.delete('/api/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cars = getCarsList();
  const carIndex = cars.findIndex(car => car.id === id);
  
  if (carIndex === -1) {
    return res.status(404).json({ success: false, error: 'Карточка не найдена' });
  }
  
  const car = cars[carIndex];
  
  // Удаляем физические файлы изображений
  if (car.images && Array.isArray(car.images)) {
    const uploadsDir = path.join(__dirname, '../public/uploads/cars');
    
    car.images.forEach(imageUrl => {
      try {
        // Проверяем, что это локальный путь (начинается с /uploads/cars/)
        if (imageUrl && imageUrl.startsWith('/uploads/cars/')) {
          // Извлекаем имя файла из пути /uploads/cars/filename.jpg
          const filename = imageUrl.replace('/uploads/cars/', '');
          const filePath = path.join(uploadsDir, filename);
          
          // Удаляем файл, если он существует
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Файл удалён: ${filePath}`);
          } else {
            console.log(`Файл не найден для удаления: ${filePath}`);
          }
        }
      } catch (error) {
        console.error(`Ошибка при удалении файла ${imageUrl}:`, error.message);
        // Продолжаем удаление других файлов даже при ошибке
      }
    });
  }
  
  // Удаляем запись из cars.json
  const filtered = cars.filter(car => car.id !== id);
  saveCarsList(filtered);
  res.json({ success: true });
});

app.get('/api/news', (req, res) => {
  res.json({ success: true, data: getNewsList() });
});

app.get('/api/news/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const news = getNewsList();
  const item = news.find(n => n.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Новость не найдена' });
  res.json({ success: true, data: item });
});

app.post('/api/news', express.json(), (req, res) => {
  const { title, date, content, imageUrl, link } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Не указан заголовок' });
  
  const news = getNewsList();
  const newNews = {
    id: Date.now(),
    title,
    date: date || new Date().toLocaleDateString('ru-RU'),
    content: content || '',
    imageUrl: imageUrl || null,
    link: link || `/news/${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  news.unshift(newNews);
  saveNewsList(news);
  res.json({ success: true, data: newNews });
});

app.delete('/api/news/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const news = getNewsList();
  const filtered = news.filter(item => item.id !== id);
  if (news.length === filtered.length) return res.status(404).json({ success: false, error: 'Не найдено' });
  saveNewsList(filtered);
  res.json({ success: true });
});

app.put('/api/news/:id', express.json(), (req, res) => {
  const id = parseInt(req.params.id);
  const news = getNewsList();
  const index = news.findIndex(item => item.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Не найдено' });
  
  news[index] = { ...news[index], ...req.body, updatedAt: new Date().toISOString() };
  saveNewsList(news);
  res.json({ success: true, data: news[index] });
});

app.post('/api/upload-car-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Файл не загружен' });
    }
    const imageUrl = `/uploads/cars/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ success: false, error: 'Ошибка загрузки файла' });
  }
});

// Эндпоинт для загрузки нескольких изображений машины
app.post('/api/upload-car-images', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Файлы не загружены' });
    }
    const imageUrls = req.files.map(file => `/uploads/cars/${file.filename}`);
    res.json({ success: true, imageUrls });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ success: false, error: 'Ошибка загрузки файлов' });
  }
});

const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/news');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadNewsImage = multer({
  storage: newsStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только изображения!'));
  }
});

app.post('/api/upload-news-image', uploadNewsImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Файл не загружен' });
    }
    const imageUrl = `/uploads/news/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ success: false, error: 'Ошибка загрузки файла' });
  }
});

// ===== ФУНКЦИЯ ДЛЯ ОТПРАВКИ УВЕДОМЛЕНИЯ В TELEGRAM =====
async function sendTelegramNotification(orderData) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram не настроен (отсутствуют TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID)');
    return;
  }

  try {
    const { name, phone, email, items, totalPrice, deliveryType, pickupPoint, city, comment, timestamp } = orderData;

    // Формируем список товаров с ценами
    let itemsList = '';
    let hasRequestPrice = false;
    
    items.forEach((item, index) => {
      const price = item.price || '0';
      const priceDisplay = price === '0' || price === 0 ? '❓ По запросу' : `${price} ₽`;
      itemsList += `${index + 1}. ${item.title || 'Без названия'} — ${priceDisplay}\n`;
      
      if (price === '0' || price === 0) {
        hasRequestPrice = true;
      }
    });

    // Формируем сообщение БЕЗ Markdown форматирования (обычный текст с эмодзи)
    let message = `🛒 НОВЫЙ ЗАКАЗ\n\n`;
    message += `👤 Клиент: ${name}\n`;
    message += `📱 Телефон: ${phone}\n`;
    
    if (email && email.trim() !== '') {
      message += `📧 Email: ${email}\n`;
    }
    
    message += `\n🚚 Доставка: ${deliveryType}\n`;
    
    if (pickupPoint) {
      message += `📍 Пункт самовывоза: ${pickupPoint}\n`;
    }
    
    if (city) {
      message += `🏙️ Город: ${city}\n`;
    }
    
    if (comment) {
      message += `💬 Комментарий: ${comment}\n`;
    }
    
    message += `\n📦 Товары:\n${itemsList}`;
    
    // Формируем итоговую сумму
    let totalDisplay = '';
    if (hasRequestPrice && items.every(item => !item.price || item.price === '0' || item.price === 0)) {
      totalDisplay = '❓ По запросу';
    } else if (hasRequestPrice) {
      totalDisplay = `${totalPrice} ₽ (+ товары по запросу)`;
      message += `\n⚠️ ВНИМАНИЕ: В заказе есть товары с ценой по запросу!\n`;
    } else {
      totalDisplay = `${totalPrice} ₽`;
    }
    
    message += `\n💰 Итого: ${totalDisplay}\n`;
    message += `\n🕐 Время заказа: ${new Date(timestamp).toLocaleString('ru-RU')}`;

    // Отправляем сообщение через Telegram Bot API с повторными попытками
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const maxRetries = 3;
    const retryDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Ошибка Telegram API (попытка ${attempt}/${maxRetries}):`, errorData);
          return false; // Ошибка API — не повторяем
        }

        console.log('Уведомление успешно отправлено в Telegram');
        return true;
      } catch (error) {
        console.error(`Сетевая ошибка Telegram (попытка ${attempt}/${maxRetries}):`, error.message);
        if (attempt < maxRetries) {
          console.log(`Ожидание ${retryDelay}ms перед повторной попыткой...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    console.error('Не удалось отправить в Telegram после 3 попыток');
    return false;
  } catch (error) {
    console.error('Ошибка при отправке уведомления в Telegram:', error);
    return false;
  }
}

// ===== ЭНДПОИНТ ДЛЯ ОТПРАВКИ EMAIL ЗАКАЗА =====
app.post('/api/send-order-email', (req, res) => {
  const { name, phone, email, items, totalPrice, deliveryType, pickupPoint, city, comment, timestamp } = req.body;

  // Валидация обязательных полей
  if (!name || !phone || !items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Отсутствуют обязательные поля' });
  }
  
  // totalPrice может быть 0, если все товары "по запросу"
  if (totalPrice === undefined || totalPrice === null) {
    return res.status(400).json({ success: false, error: 'Ошибка расчёта суммы заказа' });
  }

  // Сразу отвечаем клиенту
  res.json({ success: true, message: 'Заказ принят в обработку' });

  // Отправляем письма в фоне (не ждём)
  (async () => {
    try {
      // Формирование HTML письма для менеджера
      const itemsHtml = items.map(item => {
        const price = item.price || '0';
        const priceDisplay = price === '0' || price === 0
          ? 'Менеджер уточнит стоимость и с вами свяжутся'
          : `${price} ₽`;
        return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title || 'Без названия'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${priceDisplay}</td>
        </tr>
      `;
      }).join('');

      // Проверяем наличие товаров с ценой "по запросу"
      const hasRequestPrice = items.some(item => !item.price || item.price === '0' || item.price === 0);
      const hasFixedPrice = items.some(item => item.price && item.price !== '0' && item.price !== 0);
      
      // Формируем отображение итоговой суммы
      let totalPriceDisplay = '';
      let managerWarning = '';
      let clientWarning = '';
      
      if (hasRequestPrice && !hasFixedPrice) {
        // Все товары с ценой "по запросу"
        totalPriceDisplay = 'Цена по запросу';
      } else if (hasRequestPrice && hasFixedPrice) {
        // Есть товары и с ценой, и без цены
        totalPriceDisplay = `${totalPrice} ₽`;
        managerWarning = '<p style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 4px; font-size: 12px; color: #856404; border: 1px solid #ffeaa7;"><strong>⚠️ Внимание!</strong> В заказе есть товары с ценой по запросу</p>';
        clientWarning = '<p style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 4px; font-size: 12px; color: #856404; border: 1px solid #ffeaa7;"><strong>⚠️ Внимание!</strong> В заказе есть товары с ценой "по запросу". Менеджер уточнит их стоимость при обработке заказа.</p>';
      } else {
        // Все товары с фиксированной ценой
        totalPriceDisplay = `${totalPrice} ₽`;
      }

      const managerEmailHtml = `
        <h2>Новый заказ от ${name}</h2>
        <p><strong>Дата:</strong> ${new Date(timestamp).toLocaleString('ru-RU')}</p>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email || 'не указан'}</p>
        <p><strong>Тип доставки:</strong> ${deliveryType}</p>
        ${pickupPoint ? `<p><strong>Пункт самовывоза:</strong> ${pickupPoint}</p>` : ''}
        ${city ? `<p><strong>Город доставки:</strong> ${city}</p>` : ''}
        ${comment ? `<p><strong>Комментарий:</strong> ${comment}</p>` : ''}
        
        <h3>Товары:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Товар</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Цена</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        ${managerWarning}
        
        <h3 style="margin-top: 20px;">Итого: <span style="color: #d9534f;">${totalPriceDisplay}</span></h3>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          С уважением,<br>
          Команда Разбор выкуп
        </p>
      `;

      // Формирование письма для клиента
      const clientEmailHtml = `
        <h2>Спасибо за ваш заказ!</h2>
        <p>Здравствуйте, ${name}!</p>
        <p>Ваш заказ успешно принят. Менеджер свяжется с вами в ближайшее время по номеру <strong>${phone}</strong>.</p>
        
        <h3>Детали заказа:</h3>
        <p><strong>Тип доставки:</strong> ${deliveryType}</p>
        ${pickupPoint ? `<p><strong>Пункт самовывоза:</strong> ${pickupPoint}</p>` : ''}
        ${city ? `<p><strong>Город доставки:</strong> ${city}</p>` : ''}
        
        <h3>Товары:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Товар</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Цена</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        ${clientWarning}
        
        <h3 style="margin-top: 20px;">Итого: <span style="color: #d9534f;">${totalPriceDisplay}</span></h3>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          С уважением,<br>
          Команда Разбор выкуп
        </p>
      `;

      // Email менеджеру
      const managerEmail = process.env.MANAGER_EMAIL || 'antoinette.dibbert96@ethereal.email';
      
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'antoinette.dibbert96@ethereal.email',
        to: managerEmail,
        subject: `Новый заказ от ${name}`,
        html: managerEmailHtml
      });

      // Email клиенту — ТОЛЬКО если email указан и корректный
      if (email && email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_USER || 'antoinette.dibbert96@ethereal.email',
            to: email,
            subject: 'Ваш заказ принят — Разбор выкуп',
            html: clientEmailHtml
          });
          console.log(`Письмо клиенту отправлено на ${email}`);
        } catch (clientError) {
          console.error('Ошибка отправки письма клиенту:', clientError);
          // Не прерываем выполнение, менеджер уже получил уведомление
        }
      } else {
        console.log(`Email клиента не указан или некорректен, письмо не отправлено`);
      }

      console.log(`Заказ от ${name} успешно отправлен на email`);

      // Отправляем уведомление в Telegram (не ждём результат, чтобы не влиять на основной ответ)
      try {
        await sendTelegramNotification(req.body);
      } catch (telegramError) {
        console.error('Ошибка отправки уведомления в Telegram:', telegramError);
        // Ошибка Telegram не влияет на основной ответ клиенту
      }
    } catch (error) {
      console.error('Ошибка отправки писем:', error);
    }
  })();
});

// ===== SITEMAP.XML (динамический, включает актуальные новости) =====
const SITE_URL = 'https://razbor-vykup.ru';

app.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/catalog', changefreq: 'daily', priority: '0.9' },
    { loc: '/car-buyback', changefreq: 'monthly', priority: '0.8' },
    { loc: '/delivery', changefreq: 'monthly', priority: '0.7' },
    { loc: '/warranty', changefreq: 'monthly', priority: '0.7' },
    { loc: '/news', changefreq: 'weekly', priority: '0.6' },
  ];

  const news = getNewsList();
  const newsPages = news.map((item) => ({
    loc: item.link || `/news/${item.id}`,
    lastmod: (item.updatedAt || item.createdAt || '').split('T')[0] || today,
    changefreq: 'monthly',
    priority: '0.5',
  }));

  const urls = [
    ...staticPages.map((p) => ({ ...p, lastmod: today })),
    ...newsPages,
  ];

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
});

// ===== СТАТИКА И FALLBACK (В КОНЦЕ!) =====
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback - для всех остальных запросов отдаём index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});