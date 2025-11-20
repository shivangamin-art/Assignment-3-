// app.js
// Main entry point for TaskTrackr

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connecting to MongoDB
connectDB();

// Viewing engine & static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing form data & JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allowing PUT and DELETE from forms
app.use(methodOverride('_method'));

// Routes
app.get('/', (req, res) => {
  res.render('index'); // home page
});

const todoRoutes = require('./routes/todoRoutes');
app.use('/todos', todoRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Starting server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
