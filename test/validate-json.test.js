const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateEntries } = require('./validate-json.js');

describe('validateEntries', () => {
    it('accepts valid entries', () => {
        const entries = [{
            id: '1', date: '2025-11-04', title: 'Test',
            summary: 'A test entry', source: 'Local News',
            sourceUrl: 'https://example.com', category: 'policy',
            tags: ['tax', 'budget'],
        }];
        const result = validateEntries(entries);
        assert.equal(result.valid, true);
        assert.equal(result.errors.length, 0);
    });

    it('rejects entries missing required fields', () => {
        const entries = [{ id: '1', date: '2025-01-01' }];
        const result = validateEntries(entries);
        assert.equal(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('title')));
    });

    it('rejects non-array data', () => {
        const result = validateEntries({ id: '1' });
        assert.equal(result.valid, false);
        assert.ok(result.errors[0].includes('array'));
    });

    it('rejects invalid dates', () => {
        const entries = [{
            id: '1', date: 'not-a-date', title: 'T',
            summary: 'S', source: 'Src', sourceUrl: 'http://x.com', category: 'c',
        }];
        const result = validateEntries(entries);
        assert.equal(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('invalid date')));
    });

    it('rejects wrong types', () => {
        const entries = [{
            id: 123, date: '2025-01-01', title: 'T',
            summary: 'S', source: 'Src', sourceUrl: 'http://x.com', category: 'c',
        }];
        const result = validateEntries(entries);
        assert.equal(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('string')));
    });

    it('rejects unknown schema', () => {
        const result = validateEntries([], 'nonexistent');
        assert.equal(result.valid, false);
    });
});
