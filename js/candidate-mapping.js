/* ══════════════════════════════════════════
   Hill Country Sentinel — Candidate Mapping
   Maps candidate names to their profile pages
   ══════════════════════════════════════════ */

(function () {
    'use strict';

    // Mapping of candidate names (as they appear in text) to their profile file
    window.CANDIDATE_PROFILES = {
        // Current candidates with profiles
        'Angela Allen': 'angela-allen.html',
        'April Ryan': 'april-ryan.html',
        'Bradley Porter': 'bradley-porter.html',
        'Carrie Isaac': 'carrie-isaac.html',
        'Donna Campbell': 'donna-campbell.html',
        'D. Lee Edwards': 'd-lee-edwards.html',
        'Doug Leecock': 'doug-leecock.html',
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

    // Function to get the base path based on current page location
    function getBasePath() {
        if (typeof window === 'undefined') return '';
        var path = window.location.pathname;
        // If in articles/archive/ (two levels deep), go up two levels
        if (path.match(/\/articles\/archive\//i)) return '../../profiles/';
        // If in a subdirectory like /feeds/, /profiles/, /articles/, go up one level
        if (path.match(/\/feeds\//i) || path.match(/\/profiles\//i) || path.match(/\/articles\//i)) return '../profiles/';
        return 'profiles/';
    }

    // Function to auto-link candidate names in text content
    function autoLinkCandidateNames() {
        var basePath = getBasePath();
        var candidates = Object.keys(window.CANDIDATE_PROFILES);
        
        // Find all text nodes that might contain candidate names
        var walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            function(node) {
                // Skip text nodes that are already inside links
                var parent = node.parentNode;
                while (parent) {
                    if (parent.tagName === 'A') return NodeFilter.FILTER_REJECT;
                    if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
                    parent = parent.parentNode;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        );

        var textNodes = [];
        var node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        // Process each text node
        textNodes.forEach(function(textNode) {
            var text = textNode.textContent;
            var hasChanges = false;
            var newHTML = text;

            // Replace each candidate name with a link
            candidates.forEach(function(candidateName) {
                var profileFile = window.CANDIDATE_PROFILES[candidateName];
                var regex = new RegExp('\\b' + candidateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
                if (regex.test(newHTML)) {
                    var linkHTML = '<a href="' + basePath + profileFile + '" class="candidate-auto-link">' + candidateName + '</a>';
                    newHTML = newHTML.replace(regex, linkHTML);
                    hasChanges = true;
                }
            });

            // If we made changes, replace the text node with HTML
            if (hasChanges) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML;
                
                // Replace the text node with the new elements
                var parent = textNode.parentNode;
                while (tempDiv.firstChild) {
                    parent.insertBefore(tempDiv.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        });
    }

    // Auto-init on DOMContentLoaded in browser
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autoLinkCandidateNames);
        } else {
            autoLinkCandidateNames();
        }
    }

    // Export for Node.js testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { 
            CANDIDATE_PROFILES: window.CANDIDATE_PROFILES, 
            autoLinkCandidateNames: autoLinkCandidateNames 
        };
    }
})();