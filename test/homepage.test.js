const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const indexPath = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

describe('Homepage (index.html)', () => {

    it('links css/shared.css via link tag', () => {
        assert.match(indexHtml, /<link[^>]+href="css\/shared\.css"/);
    });

    it('does not have a large inline style block duplicating shared.css variables', () => {
        // The old index had 300+ lines of inline CSS with all the shared variables.
        // We still allow some page-specific inline styles (hero, calendar, etc.)
        // but the base reset/nav/footer/cards should come from shared.css.
        // Check that the inline style does NOT contain the nav .nav-links rule (shared.css handles that)
        const styleBlocks = indexHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
        const totalInlineCSS = styleBlocks.join('');
        // Should not contain the full nav styling (that's in shared.css)
        assert.ok(!totalInlineCSS.includes('nav .nav-links a {'), 'nav link styles should be in shared.css, not inline');
    });

    it('loads js/utils.js', () => {
        assert.match(indexHtml, /<script\s+src="js\/utils\.js"/);
    });

    it('loads js/feed-renderer.js', () => {
        assert.match(indexHtml, /<script\s+src="js\/feed-renderer\.js"/);
    });

    it('loads js/layout.js', () => {
        assert.match(indexHtml, /<script\s+src="js\/layout\.js"/);
    });

    it('has site-nav placeholder for layout.js', () => {
        assert.match(indexHtml, /id="site-nav"/);
    });

    it('has site-footer placeholder for layout.js', () => {
        assert.match(indexHtml, /id="site-footer"/);
    });

    it('has feed-candidates container', () => {
        assert.match(indexHtml, /id="feed-candidates"/);
    });

    it('has feed-policy container', () => {
        assert.match(indexHtml, /id="feed-policy"/);
    });

    it('has feed-business container', () => {
        assert.match(indexHtml, /id="feed-business"/);
    });

    it('fetches data/candidate-news.json', () => {
        assert.match(indexHtml, /candidate-news\.json/);
    });

    it('fetches data/policy-feed.json', () => {
        assert.match(indexHtml, /policy-feed\.json/);
    });

    it('fetches data/business-watch.json', () => {
        assert.match(indexHtml, /business-watch\.json/);
    });

    it('links to /feeds/candidates.html', () => {
        assert.match(indexHtml, /\/feeds\/candidates\.html/);
    });

    it('links to /feeds/policy.html', () => {
        assert.match(indexHtml, /\/feeds\/policy\.html/);
    });

    it('links to /feeds/business.html', () => {
        assert.match(indexHtml, /\/feeds\/business\.html/);
    });

    it('has hero section with branding', () => {
        assert.match(indexHtml, /class="hero"/);
        assert.match(indexHtml, /Comal County GOP Watch<\/h1>/);
    });

    it('has alert banner container', () => {
        assert.match(indexHtml, /id="alert-banner"/);
    });

    it('has election calendar container', () => {
        assert.match(indexHtml, /id="election-calendar"/);
    });

    it('has officials grid container that reads from JSON', () => {
        assert.match(indexHtml, /id="officials-grid"/);
        assert.match(indexHtml, /data\/officials\.json/);
    });

    it('renders Candidate & Official News section heading', () => {
        assert.match(indexHtml, /Candidate.*Official News/);
    });

    it('renders Public Policy section heading', () => {
        assert.match(indexHtml, /Public Policy/);
    });

    it('renders Business Watch section heading', () => {
        assert.match(indexHtml, /Business Watch/);
    });

    it('has no horizontal scroll issues (viewport meta tag set)', () => {
        assert.match(indexHtml, /width=device-width/);
    });

    it('uses renderFeedPreview for feed sections', () => {
        assert.match(indexHtml, /renderFeedPreview/);
    });

    it('uses fetchFeed for loading data', () => {
        assert.match(indexHtml, /fetchFeed/);
    });
});
