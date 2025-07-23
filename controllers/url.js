const shortid = require('shortid');
const URL = require('../models/url');
async function handleCreateShortUrl(req, res) {
    console.log("📦 Incoming body:", req.body); // ✅ Add this
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: 'url is required' });
    const shortId = shortid();
    await URL.create({ shortId: shortId, redirectURL: body.url, visitHistory: [] });
    return res.json({ id: shortId });
}

async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });
    if (!result) return res.status(404).send('Short URL not found');
    res.render('analytics', {
        shortId,
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
    });
}
module.exports = {
    handleCreateShortUrl,
    handleGetAnalytics,
}