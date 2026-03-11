// api/index.js - Vercel Serverless Function
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = client.db('pixelab');
    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

// ============= PORTFOLIO ROUTES =============

// Get all portfolio items
app.get('/api/portfolio', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const portfolio = await db.collection('portfolio').find({}).toArray();
        res.json({ success: true, data: portfolio });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single portfolio item
app.get('/api/portfolio/:id', async (req, res) => {
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create portfolio item
app.post('/api/portfolio', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const { title, category, image, client, date, location, description } = req.body;
        
        const newPortfolio = {
            title,
            category,
            image,
            client,
            date,
            location,
            description,
            createdAt: new Date()
        };
        
        const result = await db.collection('portfolio').insertOne(newPortfolio);
        res.json({ success: true, data: { _id: result.insertedId, ...newPortfolio } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update portfolio item
app.put('/api/portfolio/:id', async (req, res) => {
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete portfolio item
app.delete('/api/portfolio/:id', async (req, res) => {
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============= TESTIMONIALS ROUTES =============

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const testimonials = await db.collection('testimonials').find({}).toArray();
        res.json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create testimonial
app.post('/api/testimonials', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const { text, author, company } = req.body;
        
        const newTestimonial = {
            text,
            author,
            company,
            createdAt: new Date()
        };
        
        const result = await db.collection('testimonials').insertOne(newTestimonial);
        res.json({ success: true, data: { _id: result.insertedId, ...newTestimonial } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update testimonial
app.put('/api/testimonials/:id', async (req, res) => {
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete testimonial
app.delete('/api/testimonials/:id', async (req, res) => {
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============= MESSAGES ROUTES =============

// Get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create message (from contact form)
app.post('/api/messages', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const { name, email, service, message } = req.body;
        
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete message
app.delete('/api/messages/:id', async (req, res) => {
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============= ADMIN AUTH =============

// Simple login (in production, use JWT and password hashing)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Simple auth - in production, use bcrypt and JWT
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            res.json({ 
                success: true, 
                message: 'Login successful',
                token: 'simple-token-' + Date.now() // In production, use proper JWT
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API is running' });
});

module.exports = app;