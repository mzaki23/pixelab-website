const express = require('express');
const app = express();

app.get('/api/portfolio', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint untuk tes koneksi database
app.get('/api/test-db', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Coba lakukan ping ke database
    await db.command({ ping: 1 });
    
    // (Opsional) Coba hitung jumlah dokumen di koleksi portfolio
    const portfolioCount = await db.collection('portfolio').countDocuments();
    
    res.json({
      success: true,
      message: 'Database connection successful',
      mongodb_uri_set: !!process.env.MONGODB_URI,
      portfolio_count: portfolioCount
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      mongodb_uri_set: !!process.env.MONGODB_URI
    });
  }
});

module.exports = app;