// server.js
// Simple Express server that serves the contact form and saves
// submissions to MongoDB using the official MongoDB Node.js driver.

require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection settings (put these in a .env file, see .env.example)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'contact_form_db';
const COLLECTION_NAME = 'messages';

let db;

async function connectToMongo() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB database: ${DB_NAME}`);
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Very basic email format check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/contact -> saves a contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic server-side validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are all required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (name.length > 200 || message.length > 5000) {
      return res.status(400).json({ error: 'Input is too long.' });
    }

    const doc = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date()
    };

    await db.collection(COLLECTION_NAME).insertOne(doc);

    res.status(201).json({ success: true, message: 'Message received.' });
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Optional: view submissions (useful for testing; remove or protect in production)
app.get('/api/contact', async (req, res) => {
  try {
    const messages = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

connectToMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
