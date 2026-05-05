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

const XML_URL = process.env.XML_URL || 'https://ycf.partsauto.market/partsauto-feeds/drom_feeds/cb9901e562a4f410bd4f9bf80c21d094.xml';

let cachedProducts = [];
let lastFetch = null;
const CACHE_DURATION = process.env.CACHE_DURATION ? parseInt(process.env.CACHE_DURATION) : 5 * 60 * 1000;

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
   const offers = result.offers?.offer || [];
   console.log(`Найдено объявлений: ${offers.length}`);
   
   const products = offers.map(offer => {
     // Парсинг изображений из строки, разделённой запятыми
     let images = [];
     if (offer.picture) {
       const pictureStr = typeof offer.picture === 'string' ? offer.picture : '';
       if (pictureStr.trim()) {
         images = pictureStr
           .split(',')
           .map(url => url.trim())
           .filter(url => url && url.length > 0);
       }
     }

     // Парсинг модели автомобиля (может быть "Daewoo Matiz, I")
     let carMake = offer.brandcars || 'Разное';
     let carModel = offer.modelcars || '';
     let generation = '';
     
     // Если в modelcars есть поколение, извлекаем его
     if (carModel && typeof carModel === 'string') {
       const modelParts = carModel.split(',').map(p => p.trim());
       if (modelParts.length > 1) {
         carModel = modelParts[0];
         generation = modelParts.slice(1).join(', ');
       }
     } else if (carModel && typeof carModel !== 'string') {
       carModel = String(carModel);
     }

     // Определяем категорию по расположению детали
     let category = '';
     if (offer.lr || offer.fr) {
       const parts = [];
       if (offer.lr) parts.push(offer.lr);
       if (offer.fr) parts.push(offer.fr);
       category = parts.join(' ');
     }

     // Преобразуем цену 0 в пустую строку для отображения "Цена по запросу"
     let price = offer.price || '';
     if (price === '0' || price === 0) {
       price = '';
     }

     return {
       id: offer['@_id'] || '',
       title: offer.name || '',
       description: offer.description || '',
       price: price,
       brand: carMake,
       condition: offer.condition || 'Б/у',
       originality: '',
       originalVendor: '',
       carMake: carMake,
       carModel: carModel,
       generation: generation,
       category: category,
       installationLocation: `${offer.lr || ''} ${offer.fr || ''}`.trim(),
       address: '',
       phone: '',
       dateStart: '',
       dateEnd: '',
       images: images,
       year: offer.year || '',
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
    const { search, brand, category, carModel, generation, priceMin, priceMax, page, limit } = req.query;

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
  
  cars[index] = {
    ...cars[index],
    title: title || cars[index].title,
    description: description !== undefined ? description : cars[index].description,
    images: images !== undefined ? images : cars[index].images || [],
    updatedAt: new Date().toISOString()
  };
  
  saveCarsList(cars);
  res.json({ success: true, data: cars[index] });
});

app.delete('/api/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cars = getCarsList();
  const filtered = cars.filter(car => car.id !== id);
  if (cars.length === filtered.length) return res.status(404).json({ success: false, error: 'Не найдено' });
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

// ===== СТАТИКА И FALLBACK (В КОНЦЕ!) =====
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback - для всех остальных запросов отдаём index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});