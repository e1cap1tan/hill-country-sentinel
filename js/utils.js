/**
 * Hill Country Sentinel — Utility Functions
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

/**
 * Auto-link candidate names in text content.
 * Finds candidate names and replaces them with links to their profile pages.
 * @param {string} text - Text content to process
 * @param {Array} candidateList - Array of candidate objects with name and slug
 * @param {string} [basePath=''] - Base path for links (e.g., '../' for subdirectories)
 * @returns {string} Text with candidate names linked
 */
function autoLinkCandidates(text, candidateList, basePath) {
    if (!text || typeof text !== 'string' || !candidateList || !candidateList.length) {
        return text;
    }

    basePath = basePath || '';
    let processedText = text;

    // Sort candidates by name length (descending) to match longer names first
    const sortedCandidates = [...candidateList].sort((a, b) => 
        (b.name || '').length - (a.name || '').length
    );

    // Process each candidate
    sortedCandidates.forEach(candidate => {
        if (!candidate.name || !candidate.slug) return;

        // Create variations of the name to match
        const nameVariations = [
            candidate.name,
            candidate.name.replace(/\s*\([^)]*\)/g, ''), // Remove parenthetical content like "(R)"
            candidate.name.replace(/\s*(Incumbent|incumbent)/g, ''), // Remove "Incumbent"
        ].filter(name => name && name.trim() && name.trim() !== candidate.name);

        // Add the original name back if it wasn't already there
        if (!nameVariations.includes(candidate.name)) {
            nameVariations.unshift(candidate.name);
        }

        nameVariations.forEach(nameVariation => {
            const trimmedName = nameVariation.trim();
            if (!trimmedName || trimmedName.length < 3) return; // Skip very short names

            // Create regex that matches the name but not when it's already inside an HTML tag
            // This regex looks for the name that isn't preceded by href=" or > (inside a link)
            const regex = new RegExp(
                `(?<!href=["'][^"']*|>[^<]*)\\b${escapeRegex(trimmedName)}\\b(?![^<]*<\\/a>)`,
                'gi'
            );

            // Replace with link only if not already linked
            const replacement = `<a href="${basePath}profiles/${candidate.slug}.html" class="auto-link candidate-link">${trimmedName}</a>`;
            
            // Only replace if the text isn't already inside a link
            processedText = processedText.replace(regex, (match) => {
                // Additional check: make sure we're not inside an existing link
                const beforeMatch = processedText.substring(0, processedText.indexOf(match));
                const openLinks = (beforeMatch.match(/<a\b[^>]*>/g) || []).length;
                const closeLinks = (beforeMatch.match(/<\/a>/g) || []).length;
                
                // If we're inside a link (more opens than closes), don't replace
                if (openLinks > closeLinks) {
                    return match;
                }
                
                return replacement;
            });
        });
    });

    return processedText;
}

/**
 * Escape special regex characters in a string.
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for use in regex
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Initialize auto-linking for a page.
 * Fetches candidate data and applies auto-linking to specified elements.
 * @param {string|Array} selectors - CSS selectors for elements to process
 * @param {string} [basePath=''] - Base path for profile links
 */
async function initAutoLinking(selectors, basePath) {
    try {
        basePath = basePath || '';
        
        // Detect base path if not provided
        if (!basePath && typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.match(/\/feeds\//i) || path.match(/\/profiles\//i) || path.match(/\/articles\//i)) {
                basePath = '../';
            }
        }

        // Fetch candidate data
        const response = await fetch(`${basePath}data/officials.json`);
        if (!response.ok) throw new Error('Failed to fetch officials data');
        
        const data = await response.json();
        
        // Combine all candidates and officials
        const allCandidates = [
            ...(data.current_officials || []),
            ...(data.mayoral_candidates || [])
        ];

        // Ensure selectors is an array
        const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

        // Process each selector
        selectorArray.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.innerHTML && !element.hasAttribute('data-auto-linked')) {
                    element.innerHTML = autoLinkCandidates(element.innerHTML, allCandidates, basePath);
                    element.setAttribute('data-auto-linked', 'true');
                }
            });
        });

    } catch (error) {
        console.warn('Auto-linking failed:', error);
    }
}

// Export for Node.js (tests), no-op in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        formatDate, 
        truncateText, 
        slugify, 
        autoLinkCandidates, 
        escapeRegex,
        initAutoLinking 
    };
}
