const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
    sortEntriesByDate,
    escapeHtml,
    formatCategory,
    renderFeedCard,
    renderFeedList,
    renderFeedPreview
} = require('../js/feed-renderer.js');

// Mock data
const mockEntries = [
    {
        id: 'cn-001',
        date: '2026-02-05T12:00:00',
        title: 'Oldest Entry',
        summary: 'This is the oldest entry.',
        source: 'Herald-Zeitung',
        sourceUrl: 'https://herald-zeitung.com',
        category: 'county-government',
        tags: ['county-judge', 'vacancy']
    },
    {
        id: 'cn-002',
        date: '2026-02-10T12:00:00',
        title: 'Newest Entry',
        summary: 'This is the newest entry.',
        source: 'Texas Tribune',
        sourceUrl: 'https://texastribune.org',
        category: 'elections',
        tags: ['mayor']
    },
    {
        id: 'cn-003',
        date: '2026-02-08T12:00:00',
        title: 'Middle Entry',
        summary: 'This is the middle entry.',
        source: 'Local News',
        sourceUrl: 'https://localnews.com',
        category: 'legislation',
        tags: ['state-legislature', 'transportation']
    }
];

describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
        assert.equal(escapeHtml('<script>alert("xss")</script>'),
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });
    it('returns empty string for falsy input', () => {
        assert.equal(escapeHtml(null), '');
        assert.equal(escapeHtml(''), '');
    });
});

describe('formatCategory', () => {
    it('formats category slug to display label', () => {
        assert.equal(formatCategory('county-government'), 'County Government');
        assert.equal(formatCategory('elections'), 'Elections');
    });
    it('returns empty string for falsy input', () => {
        assert.equal(formatCategory(''), '');
        assert.equal(formatCategory(null), '');
    });
});

describe('sortEntriesByDate', () => {
    it('sorts entries newest-first', () => {
        const sorted = sortEntriesByDate(mockEntries);
        assert.equal(sorted[0].id, 'cn-002'); // Feb 10
        assert.equal(sorted[1].id, 'cn-003'); // Feb 8
        assert.equal(sorted[2].id, 'cn-001'); // Feb 5
    });
    it('does not mutate original array', () => {
        const original = [...mockEntries];
        sortEntriesByDate(mockEntries);
        assert.deepEqual(mockEntries, original);
    });
});

describe('renderFeedCard', () => {
    it('produces HTML with date, title, summary, source link, and category badge', () => {
        const html = renderFeedCard(mockEntries[0]);
        assert.ok(html.includes('feed-entry'), 'has feed-entry class');
        assert.ok(html.includes('entry-date'), 'has date element');
        assert.ok(html.includes('Oldest Entry'), 'has title');
        assert.ok(html.includes('This is the oldest entry.'), 'has summary');
        assert.ok(html.includes('href="https://herald-zeitung.com"'), 'has source link');
        assert.ok(html.includes('County Government'), 'has category badge');
        assert.ok(html.includes('category-badge'), 'has category-badge class');
    });
    it('renders tags', () => {
        const html = renderFeedCard(mockEntries[0]);
        assert.ok(html.includes('county-judge'), 'has tag');
        assert.ok(html.includes('vacancy'), 'has tag');
    });
    it('includes data-id attribute', () => {
        const html = renderFeedCard(mockEntries[0]);
        assert.ok(html.includes('data-id="cn-001"'));
    });
    it('handles entry with missing optional fields', () => {
        const minimal = { id: 'x', date: '2026-01-01T12:00:00', title: 'Test', summary: 'Sum' };
        const html = renderFeedCard(minimal);
        assert.ok(html.includes('Test'));
        assert.ok(html.includes('Sum'));
    });
});

describe('renderFeedList', () => {
    it('renders all entries sorted newest-first', () => {
        const html = renderFeedList(mockEntries, null);
        const newestIdx = html.indexOf('Newest Entry');
        const middleIdx = html.indexOf('Middle Entry');
        const oldestIdx = html.indexOf('Oldest Entry');
        assert.ok(newestIdx < middleIdx, 'newest before middle');
        assert.ok(middleIdx < oldestIdx, 'middle before oldest');
    });
    it('renders all 3 entries', () => {
        const html = renderFeedList(mockEntries, null);
        assert.equal((html.match(/class="feed-entry"/g) || []).length, 3);
    });
    it('sets innerHTML on container element', () => {
        const container = { innerHTML: '' };
        renderFeedList(mockEntries, container);
        assert.ok(container.innerHTML.includes('feed-entry'));
    });
});

describe('renderFeedPreview', () => {
    it('limits entries to the specified count', () => {
        const html = renderFeedPreview(mockEntries, null, 2);
        assert.equal((html.match(/class="feed-entry"/g) || []).length, 2);
    });
    it('defaults to 3 items when no limit given', () => {
        const html = renderFeedPreview(mockEntries, null);
        assert.equal((html.match(/class="feed-entry"/g) || []).length, 3);
    });
    it('includes View All link', () => {
        const html = renderFeedPreview(mockEntries, null, 2, '/feeds/candidates.html');
        assert.ok(html.includes('class="view-all"'), 'has view-all class');
        assert.ok(html.includes('href="/feeds/candidates.html"'), 'has correct URL');
        assert.ok(html.includes('View All'), 'has View All text');
    });
    it('renders entries newest-first', () => {
        const html = renderFeedPreview(mockEntries, null, 2);
        const newestIdx = html.indexOf('Newest Entry');
        const middleIdx = html.indexOf('Middle Entry');
        assert.ok(newestIdx < middleIdx, 'newest before middle');
        assert.ok(!html.includes('Oldest Entry'), 'oldest excluded by limit');
    });
    it('sets innerHTML on container element', () => {
        const container = { innerHTML: '' };
        renderFeedPreview(mockEntries, container, 2, '#');
        assert.ok(container.innerHTML.includes('view-all'));
    });
});
