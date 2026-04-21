import { useState, useEffect } from 'react'
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
        <title>Новости о нас - PartsAuto</title>
        <meta name="description" content="Новости компании PartsAuto" />
      </Helmet>

      <div className={styles.newsPage}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Новости о нас</h1>
          
          {news.length === 0 ? (
            <div className={styles.empty}>Новостей пока нет</div>
          ) : (
            <div className={styles.newsGrid}>
              {news.map(item => (
                <article key={item.id} className={styles.newsCard}>
                  <div className={styles.newsHeader}>
                    <h2 className={styles.newsTitle}>{item.title}</h2>
                    <time className={styles.newsDate}>{item.date}</time>
                  </div>
                  {item.content && (
                    <div className={styles.newsContent}>
                      {item.content.split('\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default NewsPage