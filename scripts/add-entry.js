#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// TARGET CONTENT LENGTH: Keep article summaries concise - approximately 150-250 words for standard articles.

// --- Feed configuration ---
const FEED_CONFIG = {
  candidate: { file: 'data/candidate-news.json', prefix: 'cn' },
  policy:    { file: 'data/policy-feed.json',    prefix: 'pf' },
  business:  { file: 'data/business-watch.json',  prefix: 'bw' }
};

const VALID_CATEGORIES = {
  candidate: ['elections', 'legislation', 'county-government', 'public-statement'],
  policy:    ['city-council', 'county-government', 'education', 'infrastructure', 'public-safety'],
  business:  ['donations', 'endorsements', 'social-stance', 'hiring-practices']
};

// --- Argument parsing ---
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = argv[i + 1];
      if (val !== undefined && !val.startsWith('--')) {
        args[key] = val;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

// --- Slug generation ---
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

// --- Validation ---
function validateEntry(entry, feedName) {
  const required = ['title', 'summary', 'source', 'sourceUrl', 'category', 'tags'];
  const missing = required.filter(f => !entry[f] || (Array.isArray(entry[f]) && entry[f].length === 0));
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  if (typeof entry.sourceUrl === 'string' && !entry.sourceUrl.match(/^https?:\/\//)) {
    return { valid: false, error: 'sourceUrl must start with http:// or https://' };
  }

  // Reject social media URLs
  const socialMediaDomains = ['nextdoor.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com'];
  if (typeof entry.sourceUrl === 'string') {
    for (const domain of socialMediaDomains) {
      if (entry.sourceUrl.toLowerCase().includes(domain)) {
        return { valid: false, error: `Social media URLs are not allowed. Found ${domain} in sourceUrl.` };
      }
    }
  }

  const validCats = VALID_CATEGORIES[feedName];
  if (validCats && !validCats.includes(entry.category)) {
    return { valid: false, error: `Invalid category "${entry.category}" for ${feedName} feed. Valid: ${validCats.join(', ')}` };
  }

  return { valid: true };
}

// --- Main logic (exported for testing) ---
function addEntry(args, options) {
  const rootDir = options && options.rootDir ? options.rootDir : path.resolve(__dirname, '..');
  const now = options && options.now ? options.now : new Date();

  // Validate feed
  if (!args.feed || !FEED_CONFIG[args.feed]) {
    const err = `--feed is required. Must be one of: ${Object.keys(FEED_CONFIG).join(', ')}`;
    return { success: false, error: err };
  }

  const feedName = args.feed;
  const config = FEED_CONFIG[feedName];

  // Parse tags
  const tags = args.tags ? args.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  // Build entry
  const dateStr = now.toISOString().slice(0, 19);
  const id = `${config.prefix}-${Date.now()}-${slugify(args.title || '')}`.slice(0, 80);

  const entry = {
    id: id,
    date: dateStr,
    title: args.title || '',
    summary: args.summary || '',
    source: args.source || '',
    sourceUrl: args.sourceUrl || '',
    category: args.category || '',
    tags: tags
  };

  if (args.relatedCandidate) {
    entry.relatedCandidate = args.relatedCandidate;
  }
  if (args.imageUrl) {
    entry.imageUrl = args.imageUrl;
  }

  // Validate
  const validation = validateEntry(entry, feedName);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Read existing data
  const filePath = path.join(rootDir, config.file);
  let data = [];
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(raw);
  }

  // Prepend
  data.unshift(entry);

  // Write
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  return { success: true, entry: entry, file: config.file };
}

// --- CLI execution ---
if (require.main === module) {
  const args = parseArgs(process.argv);
  const result = addEntry(args);

  if (!result.success) {
    console.error('Error:', result.error);
    process.exit(1);
  }

  console.log(`✓ Entry added to ${result.file}`);
  console.log(`  ID: ${result.entry.id}`);
  console.log(`  Title: ${result.entry.title}`);
  console.log(`  Date: ${result.entry.date}`);
}

module.exports = { addEntry, validateEntry, parseArgs, slugify, FEED_CONFIG, VALID_CATEGORIES };
