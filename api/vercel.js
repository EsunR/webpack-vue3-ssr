const app = require('express')();

app.get('/', (req, res) => {
    res.send('Hello from Vercel!');
});

module.exports = app;
