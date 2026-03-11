const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi database dengan caching
let cachedDb = null;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return { client: cachedClient, db: cachedDb };
  }

  console.log('Connecting to MongoDB...');
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(); // gunakan database dari connection string

  cachedClient = client;
  cachedDb = db;
  console.log('MongoDB connected successfully');
  return { client, db };
}

// ============= PORTFOLIO ROUTES =============

// Get all portfolio items
app.get('/api/portfolio', async (req, res) => {
  console.log('GET /api/portfolio');
  try {
    const { db } = await connectToDatabase();
    const portfolio = await db.collection('portfolio').find({}).toArray();
    res.json({ success: true, data: portfolio });
  } catch (error) {
    console.error('Error in GET /api/portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single portfolio item
app.get('/api/portfolio/:id', async (req, res) => {
  console.log(`GET /api/portfolio/${req.params.id}`);
  try {
    const { db } = await connectToDatabase();
    const portfolio = await db.collection('portfolio').findOne({
      _id: new ObjectId(req.params.id)
    });
    if (!portfolio) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }
    res.json({ success: true, data: portfolio });
  } catch (error) {
    console.error('Error in GET /api/portfolio/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create portfolio item
app.post('/api/portfolio', async (req, res) => {
  console.log('POST /api/portfolio');
  try {
    const { db } = await connectToDatabase();
    const { title, category, image, client, date, location, description } = req.body;
    // Validasi sederhana
    if (!title || !category || !image) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const newPortfolio = {
      title,
      category,
      image,
      client: client || '',
      date: date || '',
      location: location || '',
      description: description || '',
      createdAt: new Date()
    };
    const result = await db.collection('portfolio').insertOne(newPortfolio);
    res.json({ success: true, data: { _id: result.insertedId, ...newPortfolio } });
  } catch (error) {
    console.error('Error in POST /api/portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update portfolio item
app.put('/api/portfolio/:id', async (req, res) => {
  console.log(`PUT /api/portfolio/${req.params.id}`);
  try {
    const { db } = await connectToDatabase();
    const { title, category, image, client, date, location, description } = req.body;
    const result = await db.collection('portfolio').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          title,
          category,
          image,
          client,
          date,
          location,
          description,
          updatedAt: new Date()
        }
      }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }
    res.json({ success: true, message: 'Portfolio updated' });
  } catch (error) {
    console.error('Error in PUT /api/portfolio/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete portfolio item
app.delete('/api/portfolio/:id', async (req, res) => {
  console.log(`DELETE /api/portfolio/${req.params.id}`);
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('portfolio').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }
    res.json({ success: true, message: 'Portfolio deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/portfolio/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= TESTIMONIALS ROUTES =============

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
  console.log('GET /api/testimonials');
  try {
    const { db } = await connectToDatabase();
    const testimonials = await db.collection('testimonials').find({}).toArray();
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error in GET /api/testimonials:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create testimonial
app.post('/api/testimonials', async (req, res) => {
  console.log('POST /api/testimonials');
  try {
    const { db } = await connectToDatabase();
    const { text, author, company } = req.body;
    if (!text || !author || !company) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const newTestimonial = {
      text,
      author,
      company,
      createdAt: new Date()
    };
    const result = await db.collection('testimonials').insertOne(newTestimonial);
    res.json({ success: true, data: { _id: result.insertedId, ...newTestimonial } });
  } catch (error) {
    console.error('Error in POST /api/testimonials:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update testimonial
app.put('/api/testimonials/:id', async (req, res) => {
  console.log(`PUT /api/testimonials/${req.params.id}`);
  try {
    const { db } = await connectToDatabase();
    const { text, author, company } = req.body;
    const result = await db.collection('testimonials').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          text,
          author,
          company,
          updatedAt: new Date()
        }
      }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial updated' });
  } catch (error) {
    console.error('Error in PUT /api/testimonials/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete testimonial
app.delete('/api/testimonials/:id', async (req, res) => {
  console.log(`DELETE /api/testimonials/${req.params.id}`);
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('testimonials').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/testimonials/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= MESSAGES ROUTES =============

// Get all messages
app.get('/api/messages', async (req, res) => {
  console.log('GET /api/messages');
  try {
    const { db } = await connectToDatabase();
    const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create message (from contact form)
app.post('/api/messages', async (req, res) => {
  console.log('POST /api/messages');
  try {
    const { db } = await connectToDatabase();
    const { name, email, service, message } = req.body;
    if (!name || !email || !service || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const newMessage = {
      name,
      email,
      service,
      message,
      createdAt: new Date()
    };
    const result = await db.collection('messages').insertOne(newMessage);
    res.json({ success: true, data: { _id: result.insertedId, ...newMessage } });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete message
app.delete('/api/messages/:id', async (req, res) => {
  console.log(`DELETE /api/messages/${req.params.id}`);
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('messages').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/messages/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= ADMIN AUTH =============

// Simple login (in production, use JWT and password hashing)
app.post('/api/auth/login', async (req, res) => {
  console.log('POST /api/auth/login');
  try {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      res.json({
        success: true,
        message: 'Login successful',
        token: 'simple-token-' + Date.now()
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= TEST DATABASE ENDPOINT =============
app.get('/api/test-db', async (req, res) => {
  console.log('GET /api/test-db');
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    const portfolioCount = await db.collection('portfolio').countDocuments();
    res.json({
      success: true,
      message: 'Database connection successful',
      portfolio_count: portfolioCount,
      mongodb_uri_set: !!process.env.MONGODB_URI
    });
  } catch (error) {
    console.error('Error in GET /api/test-db:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      mongodb_uri_set: !!process.env.MONGODB_URI
    });
  }
});

// ============= HEALTH CHECK =============
app.get('/api/health', (req, res) => {
  console.log('GET /api/health');
  res.json({ success: true, message: 'API is running' });
});

// Handle 404 - endpoint not found
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

module.exports = app;