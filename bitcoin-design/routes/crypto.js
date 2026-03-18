import { Router } from 'express';

const router = Router();

const CMC_KEY  = process.env.CMC_KEY  || '';
const CMC_BASE = process.env.CMC_BASE || 'https://pro-api.coinmarketcap.com';

const CMC_HEADERS = {
    'X-CMC_PRO_API_KEY': CMC_KEY,
    'Accept': 'application/json',
};

// Simple in-memory cache: key → { data, cachedAt }
const cache = new Map();

function getCache(key) {
    return cache.get(key)?.data ?? null;
}

function setCache(key, data) {
    cache.set(key, { data, cachedAt: Date.now() });
}

// GET /api/prices — latest quotes for BTC, ETH, SOL, ADA
router.get('/prices', async (req, res) => {
    const cacheKey = 'prices';
    try {
        const url = `${CMC_BASE}/v1/cryptocurrency/quotes/latest?id=1,1027,5426,2010&convert=USD`;
        const response = await fetch(url, { headers: CMC_HEADERS });
        if (!response.ok) throw new Error(`CMC responded ${response.status}`);
        const json = await response.json();
        setCache(cacheKey, json);
        res.json(json);
    } catch (err) {
        console.error('[/api/prices]', err.message);
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);
        res.status(502).json({ error: err.message });
    }
});

// GET /api/history — price history via CoinGecko (free, no key required)
// Query params: coin (bitcoin|ethereum|solana|cardano), days (1|7|30|90)
router.get('/history', async (req, res) => {
    const coin = req.query.coin || 'bitcoin';
    const days = req.query.days || '7';
    const cacheKey = `history:${coin}:${days}`;
    const cached = getCache(cacheKey);
    if (cached?.exp > Date.now()) {
        res.json(cached)
        return
    }
    try {
        const params = new URLSearchParams({ vs_currency: 'usd', days });
        const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?${params}`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`CoinGecko responded ${response.status}`);
        const json = await response.json();
        const result = { prices: json.prices, exp: Date.now() + 10 * 60 * 1000 };
        setCache(cacheKey, result);
        res.json(result);
    } catch (err) {
        console.error('[/api/history]', err.message);
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);
        res.status(502).json({ error: err.message });
    }
});

export default router;
