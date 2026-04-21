// Утилиты для форматирования данных

/**
 * Форматирует цену в рублях
 * @param {number|string} price - Цена товара
 * @returns {string} Отформатированная цена
 */
export const formatPrice = (price) => {
  if (!price) return 'Цена не указана'
  return `${parseInt(price).toLocaleString('ru-RU')} ₽`
}

/**
 * Получает URL изображения из объекта или строки
 * @param {object|string} img - Объект изображения или URL
 * @returns {string} URL изображения
 */
export const getImageUrl = (img) => {
  if (!img) return ''
  if (typeof img === 'object') {
    return img['@_url'] || img.url || ''
  }
  return img
}
