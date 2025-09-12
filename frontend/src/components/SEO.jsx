import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Sanjivani – AI-Powered Herbal Remedy Finder',
  description = 'Sanjivani is an AI-powered herbal remedy finder that helps you discover natural solutions for your health. By simply entering your symptoms, Sanjivani instantly suggests the best herbal and Ayurvedic remedies tailored to your needs. Combining the wisdom of traditional herbal medicine with modern AI technology, Sanjivani makes it easy to find safe, effective, and natural treatments for common health concerns. Whether you are looking for Ayurveda-based remedies, home herbal solutions, or natural symptom checkers, Sanjivani is your go-to platform for smarter, healthier living.',
  keywords = 'Sanjivni, herbal remedies, Ayurveda, ayurvedic, natural remedies, symptom checker, herbal medicine, AI health, home remedies, herbal remedy finder, natural treatments',
  canonicalUrl,
  ogType = 'website',
  ogImage = '/favicon.svg',
  twitterCard = 'summary_large_image',
  twitterSite = '@sanjivni',
  author = 'Sanjivni',
  publishedTime,
  modifiedTime,
  children
}) => {
  // Build the full canonical URL
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sanjivni.example.com';
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
      <meta property="og:site_name" content="Sanjivni" />
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
          "name": "Sanjivni",
          "url": siteUrl,
          "logo": `${siteUrl}/favicon.svg`,
          "sameAs": [
            "https://www.facebook.com/",
            "https://www.twitter.com/",
            "https://www.linkedin.com/company/",
            "https://www.instagram.com/"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "sanjivni@gmail.com",
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