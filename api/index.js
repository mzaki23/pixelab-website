const express = require('express');
const app = express();

app.get('/api/portfolio', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;