const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { formatDate, truncateText, slugify } = require('../js/utils.js');

describe('formatDate', () => {
    it('formats a valid ISO date', () => {
        const result = formatDate('2025-11-04T12:00:00');
        assert.ok(result.includes('2025'));
        assert.ok(result.includes('November'));
        assert.ok(result.includes('4'));
    });

    it('returns empty string for invalid date', () => {
        assert.equal(formatDate('not-a-date'), '');
    });

    it('accepts custom format options', () => {
        const result = formatDate('2025-03-15T12:00:00', { month: 'short', day: 'numeric' });
        assert.ok(result.includes('Mar'));
        assert.ok(result.includes('15'));
    });

    it('handles full ISO datetime', () => {
        const result = formatDate('2025-07-04T12:00:00Z');
        assert.ok(result.includes('July'));
    });
});

describe('truncateText', () => {
    it('returns text unchanged if under max length', () => {
        assert.equal(truncateText('Hello world', 50), 'Hello world');
    });

    it('truncates long text with ellipsis', () => {
        const result = truncateText('The quick brown fox jumps over the lazy dog', 20);
        assert.ok(result.length <= 25); // 20 + ellipsis char + word boundary
        assert.ok(result.endsWith('…'));
    });

    it('breaks at word boundary', () => {
        const result = truncateText('Hello beautiful world', 14);
        assert.equal(result, 'Hello…');
    });

    it('returns empty string for null/undefined', () => {
        assert.equal(truncateText(null, 10), '');
        assert.equal(truncateText(undefined, 10), '');
    });

    it('returns empty string for non-string input', () => {
        assert.equal(truncateText(123, 10), '');
    });
});

describe('slugify', () => {
    it('converts name to lowercase slug', () => {
        assert.equal(slugify('John Smith'), 'john-smith');
    });

    it('removes special characters', () => {
        assert.equal(slugify("Rep. Sarah O'Brien"), 'rep-sarah-obrien');
    });

    it('collapses multiple spaces and hyphens', () => {
        assert.equal(slugify('Too   Many   Spaces'), 'too-many-spaces');
        assert.equal(slugify('already--slugged'), 'already-slugged');
    });

    it('trims leading/trailing hyphens', () => {
        assert.equal(slugify(' -Hello World- '), 'hello-world');
    });

    it('returns empty string for null/undefined', () => {
        assert.equal(slugify(null), '');
        assert.equal(slugify(undefined), '');
    });
});
