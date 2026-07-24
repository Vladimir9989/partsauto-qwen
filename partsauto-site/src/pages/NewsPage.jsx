import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import styles from './NewsPage.module.css'

const allKeywords = [
  "автозапчасти", "выкуп авто", "разборка", "Реж", "Екатеринбург", "б/у запчасти",
  "запчасти бу", "купить запчасти",
  "купить двигатель", "купить МКПП", "купить Акпп", "купить фару", "купить бампер",
  "купить рулевую рейку", "купить тормозной суппорт", "купить дверь", "купить стекло",
  "купить кузов", "купить капот", "купить крыло", "купить порог", "купить крышу", "купить стойку",
  "купить запчасти Daewoo Nexia", "купить запчасти Daewoo Matiz",
  "купить запчасти Chevrolet Aveo", "купить запчасти Chevrolet Lanos", "купить запчасти Chevrolet Lacetti",
  "купить запчасти Kia Rio", "купить запчасти Kia Spectra",
  "купить запчасти Renault Duster", "купить запчасти Renault Logan", "купить запчасти Renault Megan",
  "купить запчасти Skoda Octavia", "купить запчасти Volkswagen Polo",
  "купить запчасти Toyota Corolla",
  "купить запчасти Hyundai Accent", "купить запчасти Hyundai Solaris",
  "купить запчасти Nissan Almera Classic",
  "купить запчасти Mazda 3", "купить запчасти Mazda 6",
  "купить запчасти Citroen"
];

function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNews(data.data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Ошибка загрузки новостей:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка новостей...</div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Новости"
        description="Новости компании Разбор Выкуп. Обновления ассортимента, акции и важные объявления."
        keywords={allKeywords.join(", ")}
      />

      <div className={styles.newsPage}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Новости</h1>
          
          {news.length === 0 ? (
            <div className={styles.empty}>Новостей пока нет</div>
          ) : (
            <div className={styles.newsGrid}>
              {news.map(item => {
                // Извлекаем первую картинку из контента
                const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/)
                const previewImage = imgMatch ? imgMatch[1] : null
                
                return (
                  <Link to={`/news/${item.id}`} key={item.id} className={styles.newsCardLink}>
                    <article className={styles.newsCard}>
                      {previewImage && (
                        <div className={styles.newsImage}>
                          <img src={previewImage} alt={item.title} />
                        </div>
                      )}
                      <div className={styles.newsCardContent}>
                        <h2 className={styles.newsTitle}>{item.title}</h2>
                        <time className={styles.newsDate}>{item.date}</time>
                        <span className={styles.readMore}>Читать новость →</span>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default NewsPage