import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import styles from './NewsPage.module.css'

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
      <Helmet>
        <title>Новости о нас - Разбор Выкуп</title>
        <meta name="description" content="Новости компании Разбор Выкуп" />
      </Helmet>

      <div className={styles.newsPage}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Новости о нас</h1>
          
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