/**
 * JSON Schema Validator for Hill Country Sentinel data files.
 *
 * Usage: node test/validate-json.js <json-file> [schema-name]
 *
 * Schema names: feed-entry (default)
 *
 * Exit code 0 = valid, 1 = invalid
 */

const fs = require('node:fs');
const path = require('node:path');

const SCHEMAS = {
    'feed-entry': {
        required: ['id', 'date', 'title', 'summary', 'source', 'sourceUrl', 'category'],
        optional: ['tags', 'relatedCandidate', 'imageUrl'],
        types: {
            id: 'string',
            date: 'string',
            title: 'string',
            summary: 'string',
            source: 'string',
            sourceUrl: 'string',
            category: 'string',
            tags: 'object', // array
            relatedCandidate: 'string',
            imageUrl: 'string',
        },
    },
};

/**
 * Validate an array of entries against a schema shape.
 * @param {Array} entries - Array of objects to validate
 * @param {string} schemaName - Name of the schema to use
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateEntries(entries, schemaName = 'feed-entry') {
    const schema = SCHEMAS[schemaName];
    if (!schema) {
        return { valid: false, errors: [`Unknown schema: ${schemaName}`] };
    }

    if (!Array.isArray(entries)) {
        return { valid: false, errors: ['Data must be an array'] };
    }

    const errors = [];

    entries.forEach((entry, i) => {
        // Check required fields
        for (const field of schema.required) {
            if (!(field in entry)) {
                errors.push(`Entry ${i}: missing required field "${field}"`);
            } else if (typeof entry[field] !== schema.types[field]) {
                errors.push(`Entry ${i}: "${field}" should be ${schema.types[field]}, got ${typeof entry[field]}`);
            }
        }

        // Check types of optional fields if present
        for (const field of schema.optional) {
            if (field in entry && entry[field] !== null && typeof entry[field] !== schema.types[field]) {
                errors.push(`Entry ${i}: "${field}" should be ${schema.types[field]}, got ${typeof entry[field]}`);
            }
        }

        // Validate date format (YYYY-MM-DD or ISO)
        if (entry.date && isNaN(new Date(entry.date).getTime())) {
            errors.push(`Entry ${i}: invalid date "${entry.date}"`);
        }
    });

    return { valid: errors.length === 0, errors };
}

// CLI mode
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node test/validate-json.js <json-file> [schema-name]');
        process.exit(1);
    }

    const filePath = path.resolve(args[0]);
    const schemaName = args[1] || 'feed-entry';

    let data;
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        data = JSON.parse(raw);
    } catch (err) {
        console.error(`Error reading ${filePath}: ${err.message}`);
        process.exit(1);
    }

    const result = validateEntries(data, schemaName);
    if (result.valid) {
        console.log(`✓ ${filePath} is valid (${data.length} entries)`);
        process.exit(0);
    } else {
        console.error(`✗ ${filePath} has ${result.errors.length} error(s):`);
        result.errors.forEach(e => console.error(`  - ${e}`));
        process.exit(1);
    }
}

module.exports = { validateEntries, SCHEMAS };
