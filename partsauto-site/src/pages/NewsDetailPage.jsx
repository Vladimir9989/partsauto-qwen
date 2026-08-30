import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/SEO'
import NewsQuiz from '../components/NewsQuiz'
import styles from './NewsDetailPage.module.css'

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

  const imgMatch = news.content?.match(/<img[^>]+src="([^">]+)"/)
  const ogImage = imgMatch ? imgMatch[1] : null
  const autoDescription = news.content?.replace(/<[^>]*>/g, '').substring(0, 200)
  const description = news.metaDescription || autoDescription

  const siteUrl = 'https://razbor-vykup.ru'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: description,
    datePublished: news.createdAt,
    dateModified: news.updatedAt || news.createdAt,
    author: { '@type': 'Organization', name: 'Разбор Выкуп', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'Разбор Выкуп', url: siteUrl },
    ...(ogImage ? { image: `${siteUrl}${ogImage}` } : {}),
  }

  return (
    <>
      <SEO
        title={news.title}
        description={description}
        keywords={allKeywords.join(", ")}
        ogImage={ogImage}
        ogType="article"
      />
      <Helmet>
        {news.createdAt && <meta property="article:published_time" content={news.createdAt} />}
        <meta property="article:modified_time" content={news.updatedAt || news.createdAt} />
        <meta property="article:author" content="Разбор Выкуп" />
        <meta property="article:section" content="Автозапчасти" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
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

            {news.quiz && <NewsQuiz questions={news.quiz} />}
          </article>
        </div>
      </div>
    </>
  )
}

export default NewsDetailPage
