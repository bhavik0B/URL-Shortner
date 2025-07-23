const express = require('express');
const urlRoute = require('./routes/url');
const { connectDB } = require('./connect');
const app = express();
const path = require('path');
const URL = require('./models/url'); // Uncomment if you need to use the URL model directly
const PORT = 8001; 
const session = require('express-session');

console.log("Starting server...");
app.use(express.json());
app.use('/', urlRoute);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'shorturl_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

app.get('/', (req, res) => {
    res.render('index', { recent: req.session.recent || [] });
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', async (req, res) => {
    const url = req.body.url;
    if (!url) return res.render('index', { error: 'URL is required', recent: req.session.recent || [] });
    const shortid = require('shortid');
    const shortId = shortid();
    await URL.create({ shortId: shortId, redirectURL: url, visitHistory: [] });
    // Store recent URLs in session
    if (!req.session.recent) req.session.recent = [];
    req.session.recent.unshift({ shortId, shortUrl: `${req.protocol}://${req.get('host')}/${shortId}` });
    req.session.recent = req.session.recent.slice(0, 5); // Keep only last 5
    res.render('result', { shortUrl: `${req.protocol}://${req.get('host')}/${shortId}`, shortId, recent: req.session.recent });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        { 
            shortId: shortId 
        },
        { 
            $push: { 
                visitHistory: {
                    timestamp: Date.now()
                }
            }, 
        },
    );
    res.redirect(entry.redirectURL )
});
connectDB('mongodb://localhost:27017/short-url').then(() => console.log('Connected to MongoDB'))
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});     
