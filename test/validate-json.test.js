const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateEntries } = require('./validate-json.js');

const dataDir = path.join(__dirname, '..', 'data');

describe('feed data files validation', () => {
    const feedFiles = ['candidate-news.json', 'policy-feed.json', 'business-watch.json'];

    for (const file of feedFiles) {
        it(`${file} exists and has valid entries`, () => {
            const filePath = path.join(dataDir, file);
            assert.ok(fs.existsSync(filePath), `${file} should exist`);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            assert.ok(Array.isArray(data), `${file} should be an array`);
            assert.ok(data.length >= 3, `${file} should have at least 3 entries`);
            const result = validateEntries(data);
            assert.equal(result.valid, true, `${file} validation errors: ${result.errors.join(', ')}`);
        });

        it(`${file} entries have tags array`, () => {
            const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
            for (const entry of data) {
                assert.ok(Array.isArray(entry.tags), `Entry ${entry.id} should have tags array`);
                assert.ok(entry.tags.length > 0, `Entry ${entry.id} should have at least one tag`);
            }
        });
    }
});

describe('officials.json validation', () => {
    it('exists and has required structure', () => {
        const filePath = path.join(dataDir, 'officials.json');
        assert.ok(fs.existsSync(filePath), 'officials.json should exist');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        assert.ok(Array.isArray(data.mayoral_candidates), 'should have mayoral_candidates array');
        assert.ok(Array.isArray(data.current_officials), 'should have current_officials array');
        assert.ok(data.mayoral_candidates.length >= 5, 'should have all mayoral candidates');
        assert.ok(data.current_officials.length >= 14, 'should have all current officials');
    });

    it('officials have required fields', () => {
        const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'officials.json'), 'utf-8'));
        for (const official of data.current_officials) {
            assert.ok(official.title, `Official should have title`);
            assert.ok(official.name, `Official should have name`);
            assert.ok(official.slug, `Official ${official.name} should have slug`);
            assert.ok(official.group, `Official ${official.name} should have group`);
        }
    });

    it('candidates have required fields', () => {
        const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'officials.json'), 'utf-8'));
        for (const candidate of data.mayoral_candidates) {
            assert.ok(candidate.name, 'Candidate should have name');
            assert.ok(candidate.slug, `Candidate ${candidate.name} should have slug`);
            assert.ok(candidate.status, `Candidate ${candidate.name} should have status`);
            assert.equal(typeof candidate.incumbent, 'boolean', `Candidate ${candidate.name} should have boolean incumbent`);
        }
    });
});

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
