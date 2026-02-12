#!/usr/bin/env node

/**
 * Archive Article Script with Real Web Fetch
 * 
 * This version is designed to be called by the subagent with access to web_fetch tool.
 * It creates a local archived copy of external articles.
 * 
 * Usage:
 *   const { archiveArticle } = require('./scripts/archive-article-with-fetch.js');
 *   const result = await archiveArticle(url, slug, source, fetchFunction);
 */

const fs = require('fs');
const path = require('path');

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Extract basic metadata from fetched content
function extractMetadata(content, url) {
  const metadata = {
    title: null,
    author: null,
    publishDate: null
  };
  
  // Try to extract title from content
  const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i) || 
                     content.match(/<title[^>]*>(.*?)<\/title>/i) ||
                     content.match(/^#\s+(.+)/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
  }
  
  // Try to extract author
  const authorMatch = content.match(/[Bb]y\s+([A-Za-z\s]+)/);
  if (authorMatch) {
    metadata.author = authorMatch[1].trim();
  }
  
  // Try to extract date
  const dateMatch = content.match(/\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/) ||
                    content.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/);
  if (dateMatch) {
    const parsedDate = new Date(dateMatch[0]);
    if (!isNaN(parsedDate.getTime())) {
      metadata.publishDate = parsedDate.toISOString().split('T')[0];
    }
  }
  
  return metadata;
}

// Clean and prepare content for archive
function processContent(content, originalUrl, source) {
  // Remove any existing script tags
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Clean up excessive whitespace
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.trim();
  
  // If content looks like it might be truncated or minimal, add a note
  if (content.length < 500) {
    content += `\n\n<p><em>Note: This archived content may be incomplete. For the full article, please visit the original source.</em></p>`;
  }
  
  // Ensure content is wrapped in paragraphs if not already
  if (!content.includes('<p>') && !content.includes('<h')) {
    content = content.split('\n\n').map(para => para.trim() ? `<p>${para}</p>` : '').join('\n');
  }
  
  return content;
}

// Generate archived HTML page
function generateArchivedPage(articleData) {
  const { title, content, publishDate, author, originalUrl, source, slug } = articleData;
  
  // Format the publish date or use current date as fallback
  const dateString = publishDate || new Date().toISOString().split('T')[0];
  const formattedDate = formatDate(dateString);
  
  // Create the archive banner
  const archiveBanner = `
    <div class="archive-banner">
      <strong>📁 Archived Article</strong> — This is a backup copy of an article originally published by ${source}.
      <br>Original: <a href="${originalUrl}" target="_blank" rel="noopener">${originalUrl}</a>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Archived Article'} [ARCHIVED] — Comal County GOP Watch</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/shared.css?v=4">
    <style>
        .archive-banner {
            background: #fff4e6;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            font-size: 14px;
            line-height: 1.5;
        }
        .archive-banner strong {
            color: #b45309;
        }
        .archive-banner a {
            color: #0066cc;
            text-decoration: underline;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div id="site-nav"></div>

    <article class="article-container">
        ${archiveBanner}
        
        <header class="article-header">
            <h1>${title || 'Archived Article'}</h1>
            <div class="article-meta">
                <time datetime="${dateString}">${formattedDate}</time>
                ${author ? `<span class="article-author">By ${author}</span>` : ''}
                <span class="article-source">Originally published by ${source}</span>
            </div>
        </header>

        <div class="article-body">
            ${content}
        </div>

        <footer class="article-footer">
            <section class="article-sources">
                <h3>Archive Information</h3>
                <ul>
                    <li><a href="${originalUrl}" target="_blank" rel="noopener">Original Article (${source})</a></li>
                    <li>Archived: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                </ul>
            </section>
        </footer>
    </article>

    <div id="site-footer"></div>

    <script src="../../js/layout.js?v=4"></script>
</body>
</html>`;
}

// Main archive function that can be called by other scripts
async function archiveArticle(url, slug, source, fetchFunction) {
  try {
    console.log(`📦 Archiving article: ${slug}`);
    console.log(`🔗 Source URL: ${url}`);
    console.log(`📰 Source: ${source}`);
    
    // Fetch the article content using the provided fetch function
    const fetchedContent = await fetchFunction(url);
    
    // Extract metadata from content
    const metadata = extractMetadata(fetchedContent, url);
    
    // Process the content
    const processedContent = processContent(fetchedContent, url, source);
    
    // Prepare article data
    const articleData = {
      title: metadata.title || `Article from ${source}`,
      content: processedContent,
      publishDate: metadata.publishDate,
      author: metadata.author,
      originalUrl: url,
      source: source,
      slug: slug
    };
    
    // Generate the HTML
    const html = generateArchivedPage(articleData);
    
    // Determine the project root (assuming this script is in scripts/)
    const projectRoot = path.join(__dirname, '..');
    
    // Write to archive directory
    const archivePath = path.join(projectRoot, 'articles', 'archive', `${slug}.html`);
    fs.writeFileSync(archivePath, html, 'utf8');
    
    // Return the relative path for use in data files
    const relativePath = `articles/archive/${slug}.html`;
    
    console.log(`✅ Article archived successfully!`);
    console.log(`📄 Archive path: ${relativePath}`);
    console.log(`💾 File saved to: ${archivePath}`);
    
    return {
      success: true,
      archivePath: relativePath,
      title: articleData.title,
      filePath: archivePath
    };
    
  } catch (error) {
    console.error('❌ Error archiving article:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { archiveArticle, generateArchivedPage, processContent, extractMetadata };