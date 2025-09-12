import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Prescripto',
  description = 'Book appointments with trusted doctors, browse medicines, and manage your health with Prescripto.',
  keywords = 'doctors, appointments, medicines, healthcare, prescriptions, medical, health',
  canonicalUrl,
  ogType = 'website',
  ogImage = '/favicon.svg',
  twitterCard = 'summary_large_image',
  twitterSite = '@prescripto',
  author = 'Prescripto',
  publishedTime,
  modifiedTime,
  children
}) => {
  // Build the full canonical URL
  const siteUrl = 'https://krishsatasiya-prescriptosystem.onrender.com';
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const fullOgImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      
      {/* Canonical Link */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={fullOgImageUrl} />
      <meta property="og:site_name" content="Prescripto" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph tags */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImageUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#4285f4" />
      <link rel="alternate" type="application/rss+xml" title={`${title} RSS Feed`} href={`${siteUrl}/rss.xml`} />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="content-language" content="en" />
      
      {/* Structured Data for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Prescripto",
          "url": siteUrl,
          "logo": `${siteUrl}/logo.png`,
          "sameAs": [
            "https://www.facebook.com/satasiyakrish1",
            "https://www.twitter.com/satasiyakrish1",
            "https://www.linkedin.com/company/satasiyakrish1",
            "https://www.instagram.com/satasiyakrish1"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "krishsatasiya44@gmail.com",
            "contactType": "customer service"
          }
        })}
      </script>
      
      {/* Additional elements passed as children */}
      {children}
    </Helmet>
  );
};

export default SEO;