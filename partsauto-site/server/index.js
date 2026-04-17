import express from 'express';
import cors from 'cors';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// SPA fallback
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
