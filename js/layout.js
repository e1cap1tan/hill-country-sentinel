/* ══════════════════════════════════════════
   Hill Country Sentinel — Layout Components
   Shared nav and footer injected into all pages
   ══════════════════════════════════════════ */

(function () {
    'use strict';

    // Detect base path for GitHub Pages deployment
    function getBase() {
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
    }

    var NAV_LINKS = [
        { label: 'Home', href: 'index.html' },
        { label: 'News', href: 'feeds/news.html' },
        { label: 'Races', href: 'feeds/candidates.html' },
        { label: 'Business Watch', href: 'feeds/business.html' },
        { label: 'Find My Officials', href: 'find-my-officials.html' }
    ];

    function renderNav() {
        var base = getBase();
        var linksHtml = NAV_LINKS.map(function (link) {
            return '<li><a href="' + base + link.href + '">' + link.label + '</a></li>';
        }).join('\n            ');

        return '<nav class="sticky-header">\n' +
            '  <div class="nav-inner">\n' +
            '    <div class="header-left">\n' +
            '      <img src="' + base + 'images/courthouse-header.png" alt="Comal County Courthouse" class="courthouse-icon">\n' +
            '      <a href="' + base + 'index.html" class="site-title">Hill Country Sentinel</a>\n' +
            '    </div>\n' +
            '    <ul class="nav-links" id="nav-links">\n' +
            '        ' + linksHtml + '\n' +
            '    </ul>\n' +
            '    <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">&#9776;</button>\n' +
            '  </div>\n' +
            '</nav>\n' +
            renderBreadcrumbs();
    }

    function renderBreadcrumbs() {
        var base = getBase();
        var path = window.location.pathname;
        var breadcrumbs = [];

        // Always start with Home
        breadcrumbs.push({ label: 'Home', href: base + 'index.html' });

        // Detect current page and build breadcrumbs
        if (path.includes('/feeds/news.html')) {
            breadcrumbs.push({ label: 'News', href: null });
        } else if (path.includes('/feeds/candidates.html')) {
            breadcrumbs.push({ label: 'Races', href: null });
        } else if (path.includes('/feeds/business.html')) {
            breadcrumbs.push({ label: 'Business Watch', href: null });
        } else if (path.includes('/find-my-officials.html') || path.includes('find-my-officials')) {
            breadcrumbs.push({ label: 'Find My Officials', href: null });
        } else if (path.includes('/articles/')) {
            // For article pages, check for category meta tag
            var categoryMeta = document.querySelector('meta[name="article-category"]');
            var category = categoryMeta ? categoryMeta.getAttribute('content') : 'News';
            var articleTitle = document.querySelector('h1') ? document.querySelector('h1').textContent : 'Article';
            
            // Add category breadcrumb
            if (category === 'candidate-news') {
                breadcrumbs.push({ label: 'News', href: base + 'feeds/news.html' });
                breadcrumbs.push({ label: 'Races', href: base + 'feeds/candidates.html' });
            } else if (category === 'policy-feed') {
                breadcrumbs.push({ label: 'News', href: base + 'feeds/news.html' });
                breadcrumbs.push({ label: 'Policy', href: null });
            } else if (category === 'business-watch') {
                breadcrumbs.push({ label: 'Business Watch', href: base + 'feeds/business.html' });
            } else {
                breadcrumbs.push({ label: 'News', href: base + 'feeds/news.html' });
            }
            
            // Add article title (truncated)
            if (articleTitle.length > 50) {
                articleTitle = articleTitle.substring(0, 50) + '...';
            }
            breadcrumbs.push({ label: articleTitle, href: null });
        }

        // Don't render breadcrumbs on homepage
        if (breadcrumbs.length <= 1) return '';

        var breadcrumbsHtml = breadcrumbs.map(function(crumb, index) {
            if (crumb.href) {
                return '<a href="' + crumb.href + '">' + crumb.label + '</a>';
            } else {
                return '<span>' + crumb.label + '</span>';
            }
        }).join(' › ');

        return '<div class="breadcrumbs">\n' +
               '  <div class="breadcrumbs-inner">' + breadcrumbsHtml + '</div>\n' +
               '</div>';
    }

    function renderFooter() {
        var year = new Date().getFullYear();
        return '<footer>\n' +
            '  <div class="footer-brand">Hill Country Sentinel</div>\n' +
            '  <p>&copy; ' + year + ' Hill Country Sentinel. Independent political intelligence.</p>\n' +
            '  <p style="margin-top: 8px; font-size: 12px;">Last updated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>\n' +
            '</footer>';
    }

    function initMobileMenu() {
        var btn = document.getElementById('mobile-menu-btn');
        var links = document.getElementById('nav-links');
        if (btn && links) {
            btn.addEventListener('click', function () {
                links.classList.toggle('open');
            });
        }
    }

    // Candidate name to profile mapping (only includes existing profiles)
    var CANDIDATE_PROFILES = {
        'Angela Allen': 'angela-allen.html',
        'April Ryan': 'april-ryan.html',
        'Bradley Porter': 'bradley-porter.html',
        'Carrie Isaac': 'carrie-isaac.html',
        'Donna Campbell': 'donna-campbell.html',
        'Doug Leecock': 'doug-leecock.html',
        'D. Lee Edwards': 'd-lee-edwards.html',
        'Jen Crownover': 'jen-crownover.html',
        'Jonathon Frazier': 'jonathon-frazier.html',
        'Kevin Webb': 'kevin-webb.html',
        'Lawrence Spradley': 'lawrence-spradley.html',
        'Mary Ann Labowski': 'mary-ann-labowski.html',
        'Michael Capizzi': 'michael-capizzi.html',
        'Michael French': 'michael-french.html',
        'Neal Linnartz': 'neal-linnartz.html',
        'Scott Haag': 'scott-haag.html',
        'Toni Carter': 'toni-carter.html'
    };

    function autoLinkCandidateNames() {
        var base = getBase();
        var profileBase = base + 'profiles/';
        
        // Function to escape regex special characters
        function escapeRegex(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // Sort names by length (longest first) to match full names before partial matches
        var sortedNames = Object.keys(CANDIDATE_PROFILES).sort(function(a, b) {
            return b.length - a.length;
        });
        
        // Find all text nodes in the document (excluding nav and footer)
        var walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip nav, footer, and already linked text
                    var parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    if (parent.tagName === 'A' || 
                        parent.closest('nav') || 
                        parent.closest('footer') ||
                        parent.closest('#site-nav') ||
                        parent.closest('#site-footer')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        
        var textNodes = [];
        var node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        // Process each text node
        textNodes.forEach(function(textNode) {
            var originalText = textNode.textContent;
            var modifiedText = originalText;
            var hasChanges = false;
            
            sortedNames.forEach(function(candidateName) {
                var profileFile = CANDIDATE_PROFILES[candidateName];
                var regex = new RegExp('\\b' + escapeRegex(candidateName) + '\\b', 'gi');
                var matches = modifiedText.match(regex);
                
                if (matches) {
                    // Only link if not already part of a link
                    modifiedText = modifiedText.replace(regex, function(match) {
                        hasChanges = true;
                        return '<a href="' + profileBase + profileFile + '" class="auto-candidate-link">' + match + '</a>';
                    });
                }
            });
            
            // Replace the text node with new HTML if changes were made
            if (hasChanges) {
                var wrapper = document.createElement('span');
                wrapper.innerHTML = modifiedText;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        });
    }

    function initLayout() {
        var navEl = document.getElementById('site-nav');
        var footerEl = document.getElementById('site-footer');
        if (navEl) { navEl.innerHTML = renderNav(); }
        if (footerEl) { footerEl.innerHTML = renderFooter(); }
        initMobileMenu();
        
        // Auto-link candidate names after a short delay
        setTimeout(autoLinkCandidateNames, 100);
    }

    // Auto-init on DOMContentLoaded in browser
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLayout);
        } else {
            initLayout();
        }
    }

    // Export for Node.js testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { renderNav: renderNav, renderFooter: renderFooter, NAV_LINKS: NAV_LINKS, initLayout: initLayout };
    }
})();
