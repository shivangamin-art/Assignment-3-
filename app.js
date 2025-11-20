// app.js
// Main entry point for TaskTrackr

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
require('dotenv').config();

const todoRoutes = require('./routes/todoRoutes');
const listRoutes = require('./routes/listRoutes');

// bring in models so home page and views can query tasks/lists
const Todo = require('./models/Todo');
const List = require('./models/List');

const app = express();

// Connect to MongoDB
connectDB();

// View engine & static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data & JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow PUT and DELETE from forms
app.use(methodOverride('_method'));

// Helper to format date as YYYY-MM-DD
function formatDate(d) {
  return d.toISOString().substring(0, 10);
}

// ===================== HOME = MY DAY ===================== //
app.get('/', async (req, res) => {
  try {
    // If user passes ?date=YYYY-MM-DD use that, otherwise today
    const dateParam = req.query.date;
    let currentDate = dateParam ? new Date(dateParam) : new Date();

    // Normalize to start of day
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Tasks due on this day
    const todosToday = await Todo.find({
      dueDate: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('list')
      .sort({ completed: 1, priority: -1 });

    // All lists for sidebar
    const lists = await List.find().sort({ name: 1 });

    // Dates for navigation
    const dayOnly = new Date(startOfDay);
    const prev = new Date(dayOnly);
    prev.setDate(prev.getDate() - 1);

    const next = new Date(dayOnly);
    next.setDate(next.getDate() + 1);

    const currentDateStr = formatDate(dayOnly);
    const prevDateStr = formatDate(prev);
    const nextDateStr = formatDate(next);

    res.render('index', {
      todosToday,
      currentDate,
      currentDateStr,
      prevDateStr,
      nextDateStr,
      lists
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ===================== IMPORTANT VIEW ===================== //
// Shows all tasks marked as important
app.get('/important', async (req, res) => {
  try {
    const importantTodos = await Todo.find({ important: true })
      .populate('list')
      .sort({ completed: 1, dueDate: 1 });

    const lists = await List.find().sort({ name: 1 });

    res.render('important', {
      importantTodos,
      lists
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ===================== PLANNED VIEW (WEEK) ===================== //
// Shows tasks planned for the next 7 days
app.get('/planned', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfRange = new Date(today);
    endOfRange.setDate(endOfRange.getDate() + 7);
    endOfRange.setHours(23, 59, 59, 999);

    const plannedTodos = await Todo.find({
      dueDate: { $gte: today, $lte: endOfRange }
    })
      .populate('list')
      .sort({ dueDate: 1, completed: 1 });

    const lists = await List.find().sort({ name: 1 });

    res.render('planned', {
      plannedTodos,
      today,
      endOfRange,
      lists
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Routes for todos and lists
app.use('/todos', todoRoutes);
app.use('/lists', listRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
