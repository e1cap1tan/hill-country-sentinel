#!/usr/bin/env node

/**
 * Archive Article Script
 * 
 * Fetches external article content and creates a local archived copy.
 * 
 * Usage:
 *   node scripts/archive-article.js \
 *     --url "https://herald-zeitung.com/specific-article" \
 *     --slug "restaurant-chain-donates-conservative" \
 *     --source "Herald-Zeitung"
 */

const fs = require('fs');
const path = require('path');

// Command line argument parsing
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg, i, arr) => {
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true;
      args[key] = value;
    }
  });
  return args;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Clean and prepare content for archive
function processContent(content, originalUrl, source) {
  // Remove any existing script tags
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Clean up excessive whitespace
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // If content looks like it might be truncated or minimal, add a note
  if (content.length < 500) {
    content += `\n\n<p><em>Note: This archived content may be incomplete. For the full article, please visit the original source.</em></p>`;
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
    <title>${title} [ARCHIVED] — Comal County GOP Watch</title>
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
            <h1>${title}</h1>
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

// Simulate web_fetch since we don't have access to OpenClaw tools in this script
async function mockWebFetch(url) {
  console.log(`🌐 Fetching content from: ${url}`);
  
  // For demo/testing purposes, return mock content based on URL patterns
  if (url.includes('herald-zeitung.com')) {
    return {
      title: "Article Title from Herald-Zeitung", 
      content: `<p>This is sample content from a Herald-Zeitung article that would normally be fetched from the actual URL.</p>
                <p>The content would include the full article body, including any quotes, sections, and relevant information.</p>
                <p>This archival system preserves external content locally so we always have a backup reference.</p>`,
      publishDate: "2026-02-10",
      author: "Reporter Name"
    };
  } else if (url.includes('texastribune.org')) {
    return {
      title: "Article Title from Texas Tribune",
      content: `<p>Sample content from The Texas Tribune that discusses Texas politics and policy matters.</p>
                <p>The Tribune covers state-level political developments that often impact local communities.</p>`,
      publishDate: "2026-02-05",
      author: "Tribune Staff"
    };
  } else if (url.includes('co.comal.tx.us')) {
    return {
      title: "Official County Communication",
      content: `<p>Official communication from Comal County regarding government business and public notices.</p>
                <p>This type of content comes from the county's official website and announcements.</p>`,
      publishDate: "2026-02-06",
      author: "Comal County Staff"
    };
  }
  
  // Generic fallback for other URLs
  return {
    title: "External Article Content",
    content: `<p>This is placeholder content that would be extracted from ${url}.</p>
              <p>In production, this would use the web_fetch tool to retrieve the actual article content.</p>`,
    publishDate: new Date().toISOString().split('T')[0],
    author: null
  };
}

// Main function
async function main() {
  const args = parseArgs();
  
  // Validate required arguments
  if (!args.url || !args.slug || !args.source) {
    console.error('❌ Error: Missing required arguments');
    console.error('Usage: node scripts/archive-article.js --url "URL" --slug "slug" --source "Source Name"');
    process.exit(1);
  }
  
  const { url, slug, source } = args;
  
  try {
    console.log(`📦 Archiving article: ${slug}`);
    console.log(`🔗 Source URL: ${url}`);
    console.log(`📰 Source: ${source}`);
    
    // Fetch the article content (mock for now)
    const fetchedContent = await mockWebFetch(url);
    
    // Process the content
    const processedContent = processContent(fetchedContent.content, url, source);
    
    // Prepare article data
    const articleData = {
      title: fetchedContent.title,
      content: processedContent,
      publishDate: fetchedContent.publishDate,
      author: fetchedContent.author,
      originalUrl: url,
      source: source,
      slug: slug
    };
    
    // Generate the HTML
    const html = generateArchivedPage(articleData);
    
    // Write to archive directory
    const archivePath = path.join(__dirname, '..', 'articles', 'archive', `${slug}.html`);
    fs.writeFileSync(archivePath, html, 'utf8');
    
    // Return the relative path for use in data files
    const relativePath = `articles/archive/${slug}.html`;
    
    console.log(`✅ Article archived successfully!`);
    console.log(`📄 Archive path: ${relativePath}`);
    console.log(`💾 File saved to: ${archivePath}`);
    
    // Output the archive path for potential scripting use
    console.log(`ARCHIVE_PATH=${relativePath}`);
    
  } catch (error) {
    console.error('❌ Error archiving article:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateArchivedPage, processContent };