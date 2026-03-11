const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. DEFINISIKAN FUNGSI TERLEBIH DAHULU
let cachedDb = null;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedDb) return { client: cachedClient, db: cachedDb };

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(); // atau client.db('nama_database')
  
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// 2. BARU SETELAH ITU TAMBAHKAN ENDPOINT
app.get('/api/test-db', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    const portfolioCount = await db.collection('portfolio').countDocuments();
    res.json({
      success: true,
      message: 'Koneksi database berhasil',
      portfolio_count: portfolioCount,
    });
  } catch (error) {
    console.error('❌ Error koneksi:', error);
    res.status(500).json({
      success: false,
      message: 'Koneksi database gagal',
      error: error.message,
    });
  }
});

// Endpoint lain (portfolio, testimonials, dll) di sini...

module.exports = app;