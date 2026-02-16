/**
 * Hill Country Sentinel — Feed Renderer Module
 *
 * Fetches JSON feed data and renders feed cards.
 * Works in browser (globals) and Node.js (CommonJS).
 */

/* global formatDate */

/**
 * Fetch a JSON feed from a URL.
 * @param {string} url - URL to the JSON feed file
 * @returns {Promise<Array>} Array of feed entries sorted newest-first
 */
async function fetchFeed(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }
    const entries = await response.json();
    return sortEntriesByDate(entries);
}

/**
 * Sort entries by date descending (newest first).
 * @param {Array} entries - Feed entries
 * @returns {Array} Sorted entries
 */
function sortEntriesByDate(entries) {
    return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Format a category slug into a display label.
 * @param {string} category - Category slug (e.g. "county-government")
 * @returns {string} Display label (e.g. "County Government")
 */
function formatCategory(category) {
    if (!category) return '';
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get fallback thumbnail image path based on entry category/type
 * @param {object} entry - Feed entry object  
 * @returns {string} Path to fallback icon
 */
function getFallbackThumbnail(entry) {
    // Detect base path for images (same logic as layout.js)
    const getBase = function() {
        if (typeof window === 'undefined') return '';
        var path = window.location.pathname;
        var isGitHubPages = window.location.hostname.includes('github.io');
        var baseProject = isGitHubPages ? '/hill-country-sentinel/' : '/';
        
        // If in articles/archive/ (two levels deep), go up two levels
        if (path.match(/\/articles\/archive\//i)) return '../../';
        // If in a subdirectory like /hill-country-sentinel/feeds/, go up one level
        if (path.match(/\/feeds\//i) || path.match(/\/profiles\//i) || path.match(/\/articles\//i)) {
            return isGitHubPages ? '../' : '../';
        }
        // If we're at the root level on GitHub Pages, include the project base
        return isGitHubPages && !path.includes('/hill-country-sentinel/') ? baseProject : '';
    };
    
    const base = getBase();
    
    // Check entry category or feed source
    if (entry.category === 'candidate-news' || 
        (entry.source && entry.source.toLowerCase().includes('candidate'))) {
        return base + 'images/icon-candidate.png';
    } else if (entry.category === 'policy-feed' || 
               (entry.source && entry.source.toLowerCase().includes('policy'))) {
        return base + 'images/icon-policy.png';
    } else if (entry.category === 'business-watch' || 
               (entry.source && entry.source.toLowerCase().includes('business'))) {
        return base + 'images/icon-business.png';
    } else {
        return base + 'images/icon-news.png';
    }
}

/**
 * Render a single feed card as an HTML string.
 * @param {object} entry - Feed entry object
 * @returns {string} HTML string for the feed card
 */
function renderFeedCard(entry) {
    const _formatDate = typeof formatDate === 'function' ? formatDate : function(d) {
        const date = new Date(d);
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const dateStr = _formatDate(entry.date);
    const categoryBadge = entry.category
        ? `<span class="tag category-badge">${escapeHtml(formatCategory(entry.category))}</span>`
        : '';

    const tags = (entry.tags && entry.tags.length > 0)
        ? entry.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')
        : '';

    const sourceName = escapeHtml(entry.source || 'Source');
    const sourceUrl = entry.sourceUrl ? escapeHtml(entry.sourceUrl) : '';

    // Determine thumbnail image - use entry.image if available, otherwise fallback
    const thumbnailSrc = entry.image ? escapeHtml(entry.image) : getFallbackThumbnail(entry);
    const thumbnailImage = `<div class="entry-thumbnail">
        <img src="${thumbnailSrc}" alt="${escapeHtml(entry.title || '')}" />
       </div>`;

    const cardInner = `${thumbnailImage}<div class="entry-content">
        <div class="entry-date">${escapeHtml(dateStr)}</div>
        <h3 class="entry-title">${escapeHtml(entry.title || '')}</h3>
        <p class="entry-summary">${escapeHtml(entry.summary || '')}</p>
        <div class="entry-meta">
            ${categoryBadge}${tags}
        </div>
        <div class="entry-source">Source: ${sourceName}</div>
    </div>`;

    if (sourceUrl) {
        // Check if this is an external URL
        const isExternal = sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://');
        const targetAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        
        return `<a href="${sourceUrl}"${targetAttrs} class="feed-entry-link"><article class="feed-entry" data-id="${escapeHtml(entry.id || '')}">
    ${cardInner}
</article></a>`;
    }

    return `<article class="feed-entry" data-id="${escapeHtml(entry.id || '')}">
    ${cardInner}
</article>`;
}

/**
 * Render a list of feed entries into a container element.
 * Entries are sorted newest-first.
 * @param {Array} entries - Feed entries
 * @param {HTMLElement|null} containerEl - DOM element to render into (if null, returns HTML string)
 * @returns {string} The rendered HTML
 */
function renderFeedList(entries, containerEl) {
    const sorted = sortEntriesByDate(entries);
    const html = sorted.map(entry => renderFeedCard(entry)).join('\n');
    if (containerEl && typeof containerEl === 'object' && 'innerHTML' in containerEl) {
        containerEl.innerHTML = html;
    }
    return html;
}

/**
 * Render a preview of feed entries (limited count) with a "View All" link.
 * @param {Array} entries - Feed entries
 * @param {HTMLElement|null} containerEl - DOM element to render into (if null, returns HTML string)
 * @param {number} [limit=3] - Maximum entries to show
 * @param {string} [viewAllUrl='#'] - URL for the "View All" link
 * @returns {string} The rendered HTML
 */
function renderFeedPreview(entries, containerEl, limit, viewAllUrl) {
    limit = limit || 3;
    viewAllUrl = viewAllUrl || '#';
    const sorted = sortEntriesByDate(entries);
    const limited = sorted.slice(0, limit);
    const cardsHtml = limited.map(entry => renderFeedCard(entry)).join('\n');
    const viewAllHtml = `<a href="${escapeHtml(viewAllUrl)}" class="view-all">View All →</a>`;
    const html = cardsHtml + '\n' + viewAllHtml;
    if (containerEl && typeof containerEl === 'object' && 'innerHTML' in containerEl) {
        containerEl.innerHTML = html;
    }
    return html;
}

/**
 * Render a candidate/official card with circular photo
 * @param {object} candidate - Candidate/official object with name, photo, status, etc.
 * @returns {string} HTML string for the candidate card
 */
function renderCandidateCard(candidate) {
    // Detect base path for images (same logic as layout.js)
    const getBase = function() {
        if (typeof window === 'undefined') return '';
        var path = window.location.pathname;
        var isGitHubPages = window.location.hostname.includes('github.io');
        var baseProject = isGitHubPages ? '/hill-country-sentinel/' : '/';
        
        // If in articles/archive/ (two levels deep), go up two levels
        if (path.match(/\/articles\/archive\//i)) return '../../';
        // If in a subdirectory like /hill-country-sentinel/feeds/, go up one level
        if (path.match(/\/feeds\//i) || path.match(/\/profiles\//i) || path.match(/\/articles\//i)) {
            return isGitHubPages ? '../' : '../';
        }
        // If we're at the root level on GitHub Pages, include the project base
        return isGitHubPages && !path.includes('/hill-country-sentinel/') ? baseProject : '';
    };
    
    const base = getBase();
    const photoSrc = candidate.photo 
        ? escapeHtml(candidate.photo) 
        : base + 'images/default-person.png';
    
    const incumbentClass = candidate.incumbent ? ' incumbent' : '';
    const incumbentBadge = candidate.incumbent 
        ? '<span class="badge incumbent">Incumbent</span>' 
        : '';
    
    const profileLink = candidate.slug 
        ? `<a href="${base}profiles/${escapeHtml(candidate.slug)}.html">${escapeHtml(candidate.name)}</a>`
        : escapeHtml(candidate.name);

    return `<div class="card candidate-card${incumbentClass}">
        <div class="avatar">
            <img src="${photoSrc}" alt="${escapeHtml(candidate.name)}" />
        </div>
        <div class="name">${profileLink}</div>
        <div class="status">${escapeHtml(candidate.status || '')}</div>
        ${incumbentBadge}
    </div>`;
}

/**
 * Render a list of candidates into a grid
 * @param {Array} candidates - Array of candidate objects
 * @param {HTMLElement|null} containerEl - DOM element to render into (if null, returns HTML string)
 * @returns {string} The rendered HTML
 */
function renderCandidateGrid(candidates, containerEl) {
    const html = `<div class="cards-grid candidate-grid">
        ${candidates.map(candidate => renderCandidateCard(candidate)).join('\n        ')}
    </div>`;
    
    if (containerEl && typeof containerEl === 'object' && 'innerHTML' in containerEl) {
        containerEl.innerHTML = html;
    }
    return html;
}

// Export for Node.js (tests), no-op in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchFeed,
        sortEntriesByDate,
        escapeHtml,
        formatCategory,
        renderFeedCard,
        renderFeedList,
        renderFeedPreview,
        getFallbackThumbnail,
        renderCandidateCard,
        renderCandidateGrid
    };
}
