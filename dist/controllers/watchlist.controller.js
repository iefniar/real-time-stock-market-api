import { getUser } from '../lib/auth-utils.js';
import { addToWatchlist, removeFromWatchlist, getWatchlistWithData, getWatchlistSymbols, toggleNewsViaEmail } from '../services/watchlist.service.js';
export async function addStock(req, res) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    const { symbol, company } = req.body;
    const result = await addToWatchlist(user.id, symbol, company);
    res.json(result);
}
export async function removeStock(req, res) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    const result = await removeFromWatchlist(user.id, req.params.symbol);
    res.json(result);
}
export async function getWatchlist(req, res) {
    if (!req.user) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    const symbols = await getWatchlistSymbols(req.user.id);
    res.json(symbols);
}
export async function getWatchlistData(req, res) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    const watchlist = await getWatchlistWithData(user.id);
    res.json(watchlist);
}
export async function toggleNewsViaEmailController(req, res) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    const result = await toggleNewsViaEmail(user.id, req.params.symbol);
    res.json(result);
}
