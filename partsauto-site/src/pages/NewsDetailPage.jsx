import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import styles from './NewsDetailPage.module.css'

function NewsDetailPage() {
  const { id } = useParams()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNews(data.data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Ошибка загрузки новости:', err)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка...</div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Новость не найдена</h1>
          <Link to="/news" className={styles.backLink}>Вернуться к новостям</Link>
        </div>
      </div>
    )
  }

  // Извлекаем первую картинку из контента для мета-тега
  const imgMatch = news.content?.match(/<img[^>]+src="([^">]+)"/)
  const ogImage = imgMatch ? imgMatch[1] : null

  return (
    <>
      <Helmet>
        <title>{news.title} - Разбор Выкуп</title>
        <meta name="description" content={news.content?.replace(/<[^>]*>/g, '').substring(0, 200)} />
        {ogImage && <meta property="og:image" content={ogImage} />}
      </Helmet>

      <div className={styles.newsDetailPage}>
        <div className={styles.container}>
          <Link to="/news" className={styles.backLink}>← Назад к новостям</Link>
          
          <article className={styles.newsArticle}>
            <h1 className={styles.newsTitle}>{news.title}</h1>
            <time className={styles.newsDate}>{news.date}</time>
            
            <div 
              className={styles.newsContent}
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </article>
        </div>
      </div>
    </>
  )
}

export default NewsDetailPage
