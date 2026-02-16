#!/usr/bin/env node

/**
 * Hill Country Sentinel — Thumbnail Scraper
 * 
 * Scrapes og:image meta tags from external source URLs and downloads them locally.
 * Processes all feed JSON files and updates entries with image paths.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Base directories
const PROJECT_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'images');
const THUMBS_DIR = path.join(IMAGES_DIR, 'thumbs');

// Feed files to process
const FEED_FILES = [
    'candidate-news.json',
    'policy-feed.json', 
    'business-watch.json'
];

/**
 * Ensure the thumbs directory exists
 */
function ensureThumbsDirectory() {
    if (!fs.existsSync(THUMBS_DIR)) {
        fs.mkdirSync(THUMBS_DIR, { recursive: true });
        console.log('Created thumbs directory:', THUMBS_DIR);
    }
}

/**
 * Extract og:image URL from HTML content
 * @param {string} html - HTML content
 * @returns {string|null} OG image URL or null if not found
 */
function extractOgImage(html) {
    // Look for og:image meta tag
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    
    if (ogImageMatch) {
        return ogImageMatch[1];
    }
    
    // Fallback: look for Twitter image
    const twitterImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                             html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i);
    
    if (twitterImageMatch) {
        return twitterImageMatch[1];
    }
    
    return null;
}

/**
 * Fetch HTML content from a URL using curl
 * @param {string} url - URL to fetch
 * @returns {Promise<string|null>} HTML content or null on error
 */
async function fetchHtml(url) {
    try {
        const { stdout, stderr } = await execAsync(`curl -L --max-time 30 --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" -s "${url}"`);
        
        if (stderr && stderr.includes('error')) {
            console.warn(`Failed to fetch ${url}: ${stderr}`);
            return null;
        }
        
        return stdout;
    } catch (error) {
        console.warn(`Error fetching ${url}:`, error.message);
        return null;
    }
}

/**
 * Download an image from URL to local path
 * @param {string} imageUrl - URL of image to download
 * @param {string} localPath - Local file path to save to
 * @returns {Promise<boolean>} Success status
 */
async function downloadImage(imageUrl, localPath) {
    try {
        // Use curl to download the image
        const { stdout, stderr } = await execAsync(`curl -L --max-time 30 --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" -o "${localPath}" "${imageUrl}"`);
        
        // Check if file was created and has size > 0
        if (fs.existsSync(localPath)) {
            const stats = fs.statSync(localPath);
            if (stats.size > 0) {
                console.log(`Downloaded: ${imageUrl} -> ${path.basename(localPath)} (${stats.size} bytes)`);
                return true;
            }
        }
        
        console.warn(`Failed to download image: ${imageUrl}`);
        return false;
    } catch (error) {
        console.warn(`Error downloading ${imageUrl}:`, error.message);
        return false;
    }
}

/**
 * Resize an image to 200x130 using sips
 * @param {string} imagePath - Path to image file
 * @returns {Promise<boolean>} Success status
 */
async function resizeImage(imagePath) {
    try {
        await execAsync(`sips -z 130 200 "${imagePath}"`);
        console.log(`Resized: ${path.basename(imagePath)} to 200x130`);
        return true;
    } catch (error) {
        console.warn(`Error resizing ${imagePath}:`, error.message);
        return false;
    }
}

/**
 * Generate a safe filename from entry ID and URL
 * @param {string} entryId - Entry ID
 * @param {string} imageUrl - Image URL
 * @returns {string} Safe filename
 */
function generateFilename(entryId, imageUrl) {
    try {
        // Extract extension from URL
        const urlPath = new URL(imageUrl).pathname;
        const ext = path.extname(urlPath) || '.jpg';
        
        // Create safe filename from entry ID
        const safeId = entryId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
        return `${safeId}${ext}`;
    } catch (error) {
        // Handle relative URLs or invalid URLs
        let ext = '.jpg';
        try {
            ext = path.extname(imageUrl) || '.jpg';
        } catch (e) {
            // Fallback
        }
        
        // Create safe filename from entry ID
        const safeId = entryId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
        return `${safeId}${ext}`;
    }
}

/**
 * Process a single feed file
 * @param {string} feedFile - Name of feed JSON file
 * @returns {Promise<number>} Number of images processed
 */
async function processFeedFile(feedFile) {
    const feedPath = path.join(DATA_DIR, feedFile);
    
    if (!fs.existsSync(feedPath)) {
        console.warn(`Feed file not found: ${feedFile}`);
        return 0;
    }
    
    console.log(`\nProcessing feed: ${feedFile}`);
    
    const feedData = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
    let processedCount = 0;
    let updatedEntries = false;
    
    for (const entry of feedData) {
        // Skip if entry already has an image or no sourceUrl
        if (entry.image || !entry.sourceUrl) {
            continue;
        }
        
        // Skip internal URLs
        if (entry.sourceUrl.includes('github.io/hill-country-sentinel') || 
            entry.sourceUrl.startsWith('/') || 
            entry.sourceUrl.startsWith('./') || 
            entry.sourceUrl.startsWith('../')) {
            continue;
        }
        
        console.log(`Scraping: ${entry.title} (${entry.sourceUrl})`);
        
        // Fetch HTML content
        const html = await fetchHtml(entry.sourceUrl);
        if (!html) continue;
        
        // Extract og:image URL
        const ogImageUrl = extractOgImage(html);
        if (!ogImageUrl) {
            console.log(`  No og:image found`);
            continue;
        }
        
        // Resolve relative URLs
        let fullImageUrl = ogImageUrl;
        if (ogImageUrl.startsWith('//')) {
            // Protocol-relative URL
            const sourceProtocol = entry.sourceUrl.startsWith('https:') ? 'https:' : 'http:';
            fullImageUrl = sourceProtocol + ogImageUrl;
        } else if (ogImageUrl.startsWith('/')) {
            // Root-relative URL
            const sourceUrl = new URL(entry.sourceUrl);
            fullImageUrl = sourceUrl.origin + ogImageUrl;
        } else if (!ogImageUrl.startsWith('http')) {
            // Relative URL
            const sourceUrl = new URL(entry.sourceUrl);
            fullImageUrl = new URL(ogImageUrl, sourceUrl).href;
        }
        
        // Generate local filename
        const filename = generateFilename(entry.id, fullImageUrl);
        const localPath = path.join(THUMBS_DIR, filename);
        
        // Skip if image already exists
        if (fs.existsSync(localPath)) {
            entry.image = `images/thumbs/${filename}`;
            updatedEntries = true;
            console.log(`  Using existing: ${filename}`);
            continue;
        }
        
        // Download image
        const downloadSuccess = await downloadImage(fullImageUrl, localPath);
        if (!downloadSuccess) continue;
        
        // Resize image
        const resizeSuccess = await resizeImage(localPath);
        if (!resizeSuccess) continue;
        
        // Update entry with image path
        entry.image = `images/thumbs/${filename}`;
        updatedEntries = true;
        processedCount++;
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save updated feed data
    if (updatedEntries) {
        fs.writeFileSync(feedPath, JSON.stringify(feedData, null, 2));
        console.log(`Updated ${feedFile} with image paths`);
    }
    
    return processedCount;
}

/**
 * Main execution function
 */
async function main() {
    console.log('Hill Country Sentinel — Thumbnail Scraper');
    console.log('==========================================');
    
    // Ensure thumbs directory exists
    ensureThumbsDirectory();
    
    let totalProcessed = 0;
    
    // Process each feed file
    for (const feedFile of FEED_FILES) {
        const count = await processFeedFile(feedFile);
        totalProcessed += count;
    }
    
    console.log(`\nScraping complete! Processed ${totalProcessed} images.`);
    
    if (totalProcessed > 0) {
        console.log('\nRun the following commands to commit changes:');
        console.log('cd /Users/fredassistant/.openclaw/workspace/projects/comal-gop-watch');
        console.log('git add data/ images/thumbs/');
        console.log('git commit -m "Add scraped thumbnail images"');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    extractOgImage,
    fetchHtml,
    downloadImage,
    resizeImage,
    processFeedFile
};