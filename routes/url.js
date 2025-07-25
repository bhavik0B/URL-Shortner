const express = require('express');
const { handleCreateShortUrl, handleGetAnalytics } = require('../controllers/url');
const router = express.Router();

router.post('/api/shorten', handleCreateShortUrl);

router.get('/analytics/:shortId', handleGetAnalytics)

module.exports = router;

