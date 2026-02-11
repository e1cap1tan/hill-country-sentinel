/**
 * Comal County GOP Watch — Utility Functions
 */

/**
 * Format a date string into a readable format.
 * @param {string} dateStr - ISO date string or parseable date
 * @param {object} [options] - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
function formatDate(dateStr, options) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const defaults = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options || defaults);
}

/**
 * Truncate text to a maximum length, appending ellipsis if truncated.
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    // Find last space before maxLength to avoid cutting words
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

/**
 * Convert a name/title into a URL-friendly slug.
 * @param {string} name - Name or title to slugify
 * @returns {string} URL-friendly slug
 */
function slugify(name) {
    if (!name || typeof name !== 'string') return '';
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Export for Node.js (tests), no-op in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatDate, truncateText, slugify };
}
