import { getNews, searchStocks, getStocksDetails } from '../services/finnhub.service.js';
import { getWatchlistSymbols } from '../services/watchlist.service.js';
export async function getMarketNews(req, res) {
    try {
        const symbols = req.query.symbols?.toString().split(',');
        const news = await getNews(symbols);
        res.json(news);
    }
    catch {
        res.status(500).json({
            error: 'Failed to get news'
        });
    }
}
export async function searchStock(req, res) {
    try {
        const query = req.query.q?.toString();
        let watchlistSymbols = [];
        if (req.user) {
            watchlistSymbols = await getWatchlistSymbols(req.user.id);
        }
        const stocks = await searchStocks(query, watchlistSymbols);
        res.json(stocks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Search failed'
        });
    }
}
export async function getStockDetails(req, res) {
    try {
        const stock = await getStocksDetails(req.params.symbol);
        res.json(stock);
    }
    catch {
        res.status(500).json({
            error: 'Failed to fetch stock details'
        });
    }
}
