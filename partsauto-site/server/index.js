import express from 'express';
import cors from 'cors';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Создаём папку data, если её нет
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// === Функции для машин в разборе ===
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

// === Функции для новостей ===
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
app.use(express.static(path.join(__dirname, '../')));

const XML_URL = process.env.XML_URL || 'https://ycf.partsauto.market/partsauto-feeds/avito_feeds/cb9901e562a4f410bd4f9bf80c21d094.xml';

let cachedProducts = [];
let lastFetch = null;
const CACHE_DURATION = process.env.CACHE_DURATION ? parseInt(process.env.CACHE_DURATION) : 5 * 60 * 1000; // 5 минут

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  trimValues: true,
});

async function fetchAndParseXML() {
  console.log('Загрузка XML...');
  const response = await fetch(XML_URL);
  const xmlText = await response.text();
  
  const result = parser.parse(xmlText);
  
  const ads = result.Ads?.Ad || [];
  console.log(`Найдено объявлений: ${ads.length}`);
  
  const products = ads.map(ad => {
    // Получаем изображения
    let images = [];
    if (ad.Images && ad.Images.Image) {
      const imageData = ad.Images.Image;
      if (Array.isArray(imageData)) {
        images = imageData.map(img => {
          if (typeof img === 'object') {
            // Атрибут url имеет префикс @_ из-за настроек парсера
            return img['@_url'] || img.url || '';
          } else if (typeof img === 'string' && img.trim()) {
            return img.trim();
          }
          return '';
        }).filter(url => url && url.trim() !== '');
      } else if (typeof imageData === 'object') {
        const url = imageData['@_url'] || imageData.url || '';
        if (url.trim()) {
          images = [url.trim()];
        }
      } else if (typeof imageData === 'string' && imageData.trim()) {
        images = [imageData.trim()];
      }
    }
    
    // Гарантируем, что images - это массив строк
    if (!Array.isArray(images)) {
      images = [];
    }

    // Цена
    let price = '';
    if (ad.Price) {
      if (typeof ad.Price === 'object') {
        price = ad.Price.Value || '';
      } else {
        price = ad.Price;
      }
    }

    return {
      id: ad.Id || '',
      title: ad.Title || '',
      description: ad.Description || '',
      price: price,
      brand: ad.Brand || '',
      condition: ad.Condition || '',
      originality: ad.Originality || '',
      originalVendor: ad.OriginalVendor || '',
      carMake: ad.Make || '',
      carModel: ad.Model || '',
      generation: ad.Generation || '',
      category: ad.SparePartType || ad.Category || '',
      installationLocation: ad.InstallationLocation || '',
      address: ad.Address || '',
      phone: ad.ContactPhone || '',
      dateStart: ad.DateBegin || '',
      dateEnd: ad.DateEnd || '',
      images: images.filter(img => img),
    };
  });

  return products;
}

app.get('/api/products', async (req, res) => {
  try {
    const now = Date.now();
    if (!lastFetch || (now - lastFetch) > CACHE_DURATION || cachedProducts.length === 0) {
      cachedProducts = await fetchAndParseXML();
      lastFetch = now;
      console.log(`Загружено ${cachedProducts.length} товаров`);
    }

    // Фильтрация на сервере
    let results = cachedProducts;
    const { search, brand, category, priceMin, priceMax, page, limit } = req.query;

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

    const minPrice = priceMin ? parseFloat(priceMin) : null;
    const maxPrice = priceMax ? parseFloat(priceMax) : null;
    if (minPrice !== null) results = results.filter(p => (parseFloat(p.price) || 0) >= minPrice);
    if (maxPrice !== null) results = results.filter(p => (parseFloat(p.price) || 0) <= maxPrice);

    // Пагинация на сервере
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const total = results.length;
    const start = (pageNum - 1) * limitNum;
    const items = results.slice(start, start + limitNum);

    res.json({
      products: items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Ошибка загрузки:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
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

// === Эндпоинты для машин в разборе ===
app.get('/api/cars', (req, res) => {
  res.json({ success: true, data: getCarsList() });
});

app.post('/api/cars', express.json(), (req, res) => {
  const { title, date, link, imageUrl } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Не указан заголовок' });
  
  const cars = getCarsList();
  const newCard = {
    id: Date.now(),
    title,
    date: date || new Date().toLocaleDateString('ru-RU'),
    link: link || '#',
    imageUrl: imageUrl || null,
    createdAt: new Date().toISOString()
  };
  cars.unshift(newCard);
  saveCarsList(cars);
  res.json({ success: true, data: newCard });
});

app.delete('/api/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cars = getCarsList();
  const filtered = cars.filter(car => car.id !== id);
  if (cars.length === filtered.length) return res.status(404).json({ success: false, error: 'Не найдено' });
  saveCarsList(filtered);
  res.json({ success: true });
});

// === Эндпоинты для новостей ===
app.get('/api/news', (req, res) => {
  res.json({ success: true, data: getNewsList() });
});

app.get('/api/news/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const news = getNewsList()
  const item = news.find(n => n.id === id)
  
  if (!item) {
    return res.status(404).json({ success: false, error: 'Новость не найдена' })
  }
  
  res.json({ success: true, data: item })
})

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

// Загрузка изображения для машины
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

// Настройка хранилища для изображений новостей
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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

// Загрузка изображения для новости
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

// Раздача статических файлов из папки dist (для продакшена)
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback - для всех не-API запросов отдаём index.html
app.use((req, res, next) => {
  // Пропускаем API запросы и статические файлы
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  // Отдаём index.html для всех остальных маршрутов (React Router)
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Обработка ошибок (404 для API)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});