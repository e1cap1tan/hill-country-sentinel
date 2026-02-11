const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { addEntry, validateEntry, parseArgs, slugify, FEED_CONFIG, VALID_CATEGORIES } = require('../scripts/add-entry.js');

// Helper: create a temp directory with data/ subdirectory and seed JSON files
function createTempRoot() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'add-entry-test-'));
  fs.mkdirSync(path.join(tmpDir, 'data'));
  // Seed each feed with one entry
  for (const [name, config] of Object.entries(FEED_CONFIG)) {
    const seedEntry = {
      id: `${config.prefix}-seed`,
      date: '2026-01-01T12:00:00',
      title: 'Seed Entry',
      summary: 'Existing entry',
      source: 'Test',
      sourceUrl: 'https://example.com',
      category: VALID_CATEGORIES[name][0],
      tags: ['test']
    };
    fs.writeFileSync(path.join(tmpDir, config.file), JSON.stringify([seedEntry], null, 2) + '\n');
  }
  return tmpDir;
}

function cleanupTempRoot(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function makeArgs(overrides) {
  return {
    feed: 'candidate',
    title: 'Test Title',
    summary: 'Test summary of the entry.',
    source: 'Test Source',
    sourceUrl: 'https://example.com/article',
    category: 'elections',
    tags: 'test,2026-election',
    ...overrides
  };
}

const fixedDate = new Date('2026-02-11T15:00:00Z');

describe('slugify', () => {
  it('converts text to lowercase slug', () => {
    assert.equal(slugify('Hello World'), 'hello-world');
  });

  it('removes special characters', () => {
    assert.equal(slugify("Isaac's Bill #1234!"), 'isaac-s-bill-1234');
  });

  it('trims leading/trailing hyphens', () => {
    assert.equal(slugify('--hello--'), 'hello');
  });

  it('truncates to 60 chars', () => {
    const long = 'a'.repeat(100);
    assert.ok(slugify(long).length <= 60);
  });
});

describe('parseArgs', () => {
  it('parses key-value flags', () => {
    const result = parseArgs(['node', 'script', '--feed', 'candidate', '--title', 'Hello']);
    assert.equal(result.feed, 'candidate');
    assert.equal(result.title, 'Hello');
  });

  it('handles boolean flags', () => {
    const result = parseArgs(['node', 'script', '--verbose']);
    assert.equal(result.verbose, true);
  });

  it('handles quoted values with spaces', () => {
    const result = parseArgs(['node', 'script', '--title', 'My Great Title']);
    assert.equal(result.title, 'My Great Title');
  });
});

describe('validateEntry', () => {
  it('returns valid for a complete entry', () => {
    const entry = {
      title: 'Test', summary: 'Test', source: 'Test',
      sourceUrl: 'https://example.com', category: 'elections', tags: ['test']
    };
    assert.deepEqual(validateEntry(entry, 'candidate'), { valid: true });
  });

  it('reports missing required fields', () => {
    const entry = { title: 'Test', summary: '', source: '', sourceUrl: '', category: '', tags: [] };
    const result = validateEntry(entry, 'candidate');
    assert.equal(result.valid, false);
    assert.ok(result.error.includes('Missing required fields'));
  });

  it('rejects invalid sourceUrl', () => {
    const entry = {
      title: 'Test', summary: 'Test', source: 'Test',
      sourceUrl: 'not-a-url', category: 'elections', tags: ['test']
    };
    const result = validateEntry(entry, 'candidate');
    assert.equal(result.valid, false);
    assert.ok(result.error.includes('sourceUrl'));
  });

  it('rejects invalid category for feed', () => {
    const entry = {
      title: 'Test', summary: 'Test', source: 'Test',
      sourceUrl: 'https://example.com', category: 'donations', tags: ['test']
    };
    const result = validateEntry(entry, 'candidate');
    assert.equal(result.valid, false);
    assert.ok(result.error.includes('Invalid category'));
  });
});

describe('addEntry', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempRoot();
  });

  afterEach(() => {
    cleanupTempRoot(tmpDir);
  });

  it('adds entry to candidate feed', () => {
    const result = addEntry(makeArgs(), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.success, true);
    assert.equal(result.file, 'data/candidate-news.json');
    assert.ok(result.entry.id.startsWith('cn-'));
  });

  it('adds entry to policy feed', () => {
    const result = addEntry(makeArgs({ feed: 'policy', category: 'city-council' }), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.success, true);
    assert.equal(result.file, 'data/policy-feed.json');
    assert.ok(result.entry.id.startsWith('pf-'));
  });

  it('adds entry to business feed', () => {
    const result = addEntry(makeArgs({ feed: 'business', category: 'donations' }), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.success, true);
    assert.equal(result.file, 'data/business-watch.json');
    assert.ok(result.entry.id.startsWith('bw-'));
  });

  it('prepends entry (newest first)', () => {
    addEntry(makeArgs(), { rootDir: tmpDir, now: fixedDate });
    const data = JSON.parse(fs.readFileSync(path.join(tmpDir, 'data/candidate-news.json'), 'utf-8'));
    assert.equal(data.length, 2);
    assert.equal(data[0].title, 'Test Title');
    assert.equal(data[1].id, 'cn-seed');
  });

  it('sets auto-generated id with prefix and slug', () => {
    const result = addEntry(makeArgs({ title: 'My Great Title' }), { rootDir: tmpDir, now: fixedDate });
    assert.ok(result.entry.id.startsWith('cn-'));
    assert.ok(result.entry.id.includes('my-great-title'));
  });

  it('sets date to current ISO datetime', () => {
    const result = addEntry(makeArgs(), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.entry.date, '2026-02-11T15:00:00');
  });

  it('parses comma-separated tags', () => {
    const result = addEntry(makeArgs({ tags: 'one,two,three' }), { rootDir: tmpDir, now: fixedDate });
    assert.deepEqual(result.entry.tags, ['one', 'two', 'three']);
  });

  it('includes relatedCandidate when provided', () => {
    const result = addEntry(makeArgs({ relatedCandidate: 'carrie-isaac' }), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.entry.relatedCandidate, 'carrie-isaac');
  });

  it('omits relatedCandidate when not provided', () => {
    const result = addEntry(makeArgs(), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.entry.relatedCandidate, undefined);
  });

  it('includes imageUrl when provided', () => {
    const result = addEntry(makeArgs({ imageUrl: 'https://example.com/img.jpg' }), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.entry.imageUrl, 'https://example.com/img.jpg');
  });

  it('fails with missing feed', () => {
    const result = addEntry({}, { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.success, false);
    assert.ok(result.error.includes('--feed'));
  });

  it('fails with invalid feed name', () => {
    const result = addEntry({ feed: 'invalid' }, { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.success, false);
  });

  it('fails with missing title', () => {
    const result = addEntry(makeArgs({ title: '' }), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.success, false);
    assert.ok(result.error.includes('title'));
  });

  it('fails with invalid category for feed', () => {
    const result = addEntry(makeArgs({ category: 'donations' }), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.success, false);
    assert.ok(result.error.includes('Invalid category'));
  });

  it('creates data file if it does not exist', () => {
    // Remove the seed file
    fs.unlinkSync(path.join(tmpDir, 'data/candidate-news.json'));
    const result = addEntry(makeArgs(), { rootDir: tmpDir, now: fixedDate });
    assert.equal(result.success, true);
    const data = JSON.parse(fs.readFileSync(path.join(tmpDir, 'data/candidate-news.json'), 'utf-8'));
    assert.equal(data.length, 1);
  });

  it('writes valid JSON to file', () => {
    addEntry(makeArgs(), { rootDir: tmpDir, now: fixedDate });
    const raw = fs.readFileSync(path.join(tmpDir, 'data/candidate-news.json'), 'utf-8');
    assert.doesNotThrow(() => JSON.parse(raw));
  });
});

describe('CLI execution', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempRoot();
  });

  afterEach(() => {
    cleanupTempRoot(tmpDir);
  });

  it('runs successfully via command line', async () => {
    const { execSync } = require('child_process');
    const script = path.join(__dirname, '..', 'scripts', 'add-entry.js');
    const env = { ...process.env };
    const cmd = `node ${script} --feed candidate --title "CLI Test Entry" --summary "Testing CLI" --source "Test" --sourceUrl "https://example.com" --category "elections" --tags "test"`;

    // Run in tmpDir context — we need to override rootDir, but CLI uses __dirname
    // So we copy the script to tmpDir/scripts/ and run from tmpDir
    fs.mkdirSync(path.join(tmpDir, 'scripts'), { recursive: true });
    fs.copyFileSync(script, path.join(tmpDir, 'scripts', 'add-entry.js'));

    const output = execSync(
      `node scripts/add-entry.js --feed candidate --title "CLI Test Entry" --summary "Testing CLI" --source "Test" --sourceUrl "https://example.com" --category "elections" --tags "test"`,
      { cwd: tmpDir, encoding: 'utf-8' }
    );

    assert.ok(output.includes('Entry added'));
    const data = JSON.parse(fs.readFileSync(path.join(tmpDir, 'data/candidate-news.json'), 'utf-8'));
    assert.equal(data[0].title, 'CLI Test Entry');
  });

  it('exits with error for missing required fields', () => {
    const { execSync } = require('child_process');
    const script = path.join(__dirname, '..', 'scripts', 'add-entry.js');
    fs.mkdirSync(path.join(tmpDir, 'scripts'), { recursive: true });
    fs.copyFileSync(script, path.join(tmpDir, 'scripts', 'add-entry.js'));

    assert.throws(() => {
      execSync('node scripts/add-entry.js --feed candidate', { cwd: tmpDir, encoding: 'utf-8', stdio: 'pipe' });
    });
  });
});
