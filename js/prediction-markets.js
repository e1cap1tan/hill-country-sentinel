/**
 * Prediction Markets Integration
 * Fetches odds from Polymarket's public Gamma API
 * Caches in sessionStorage to minimize API calls
 */

const PredictionMarkets = (function() {
    const GAMMA_API = 'https://gamma-api.polymarket.com';
    const CACHE_KEY = 'sentinel_polymarket_cache';
    const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

    // Known market slugs we track
    const TRACKED_MARKETS = {
        'texas-senate': {
            slug: 'texas-senate-election-winner',
            label: 'Texas Senate 2026',
            url: 'https://polymarket.com/event/texas-senate-election-winner'
        }
    };

    function getCached() {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const cached = JSON.parse(raw);
            if (Date.now() - cached.timestamp > CACHE_TTL) {
                sessionStorage.removeItem(CACHE_KEY);
                return null;
            }
            return cached.data;
        } catch (e) {
            return null;
        }
    }

    function setCache(data) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        } catch (e) {
            // sessionStorage full or unavailable
        }
    }

    async function fetchMarketOdds(marketKey) {
        const cached = getCached();
        if (cached && cached[marketKey]) {
            return cached[marketKey];
        }

        const market = TRACKED_MARKETS[marketKey];
        if (!market) return null;

        try {
            const res = await fetch(`${GAMMA_API}/events?slug=${market.slug}&closed=false`);
            if (!res.ok) return null;
            const events = await res.json();
            if (!events.length) return null;

            const event = events[0];
            const result = {
                title: event.title,
                url: market.url,
                volume: event.volume,
                liquidity: event.liquidity,
                outcomes: [],
                partyOdds: {},
                lastUpdated: new Date().toISOString()
            };

            // Parse markets for party-level odds
            for (const m of event.markets || []) {
                const question = m.question || '';
                const outcomes = JSON.parse(m.outcomes || '[]');
                const prices = JSON.parse(m.outcomePrices || '[]');
                const groupTitle = (m.groupItemTitle || '').toLowerCase();

                // Look for party-level markets
                if (groupTitle === 'republican' || groupTitle === 'democrat') {
                    const yesPrice = parseFloat(prices[0]) * 100;
                    result.partyOdds[groupTitle] = Math.round(yesPrice * 10) / 10;
                }

                // Collect all candidate/party outcomes
                if (outcomes.length && prices.length) {
                    result.outcomes.push({
                        question: question,
                        label: m.groupItemTitle || question,
                        yesOdds: Math.round(parseFloat(prices[0]) * 1000) / 10,
                        volume: parseFloat(m.volume || 0)
                    });
                }
            }

            // Cache result
            const allCached = getCached() || {};
            allCached[marketKey] = result;
            setCache(allCached);

            return result;
        } catch (e) {
            console.warn('Polymarket fetch failed:', e);
            return null;
        }
    }

    function renderOddsWidget(containerId, marketKey) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div class="pm-loading">Loading market data...</div>';

        fetchMarketOdds(marketKey).then(data => {
            if (!data || !data.partyOdds.republican) {
                container.innerHTML = '<div class="pm-unavailable">Market data unavailable</div>';
                return;
            }

            const repOdds = data.partyOdds.republican || 0;
            const demOdds = data.partyOdds.democrat || 0;

            container.innerHTML = `
                <div class="pm-widget">
                    <div class="pm-header">
                        <span class="pm-title">Prediction Market Odds</span>
                        <a href="${data.url}" target="_blank" rel="noopener" class="pm-source">Polymarket ↗</a>
                    </div>
                    <div class="pm-bar-container">
                        <div class="pm-bar">
                            <div class="pm-bar-r" style="width: ${repOdds}%">
                                <span class="pm-bar-label">R ${repOdds}%</span>
                            </div>
                            <div class="pm-bar-d" style="width: ${demOdds}%">
                                <span class="pm-bar-label">D ${demOdds}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="pm-meta">
                        Volume: $${(data.volume / 1000).toFixed(0)}K traded
                    </div>
                </div>
            `;
        });
    }

    return {
        fetchMarketOdds,
        renderOddsWidget,
        TRACKED_MARKETS
    };
})();
