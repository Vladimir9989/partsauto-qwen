import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl,
  ogImage,
  ogType = 'website',
  noindex = false
}) => {
  const siteTitle = 'Разбор Выкуп'
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const defaultDescription = 'Автозапчасти б/у. Выкуп авто в любом состоянии. Деньги сразу. Работаем в Екатеринбурге и Реже.'
  const siteUrl = 'https://razbor-vykup.ru'
  const imageUrl = ogImage || `${siteUrl}/logo-white.png`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl || `${siteUrl}${window.location.pathname}`} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || window.location.href} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="ru_RU" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#f97316" />
      <link rel="icon" href="/favicon.ico" />
    </Helmet>
  )
}

export default SEO
