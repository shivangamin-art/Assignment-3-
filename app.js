// app.js
// Main entry point for TaskTrackr

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');

// Routes
const todoRoutes = require('./routes/todoRoutes');
const listRoutes = require('./routes/listRoutes');
const authRoutes = require('./routes/authRoutes');

// Passport config
require('./config/passport')(passport);

const app = express();

// Connect to MongoDB
connectDB();

// View engine & static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Sessions (simple in-memory store is OK for this assignment)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'tasktrackrsecret',
    resave: false,
    saveUninitialized: false
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Make user available in all EJS views as "user"
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Helper
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// ================================
// HOME PAGE (My Day)
// ================================
app.get('/', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let currentDate;
    if (req.query.date) {
      const [y, m, d] = req.query.date.split('-').map(Number);
      currentDate = new Date(y, m - 1, d);
    } else {
      currentDate = today;
    }

    const currentDateStr = formatDate(currentDate);
    const showCompleted = req.query.showCompleted === 'true';

    const Todo = require('./models/Todo');
    const List = require('./models/List');

    let todos = await Todo.find().populate('list');

    let todosToday = todos.filter(todo => {
      if (!todo.dueDate) return false;
      return formatDate(todo.dueDate) === currentDateStr;
    });

    if (!showCompleted) {
      todosToday = todosToday.filter(todo => !todo.completed);
    }

    todosToday.sort((a, b) => {
      const order = { High: 3, Medium: 2, Low: 1 };
      if (a.completed !== b.completed) return a.completed - b.completed;
      return (order[b.priority] || 0) - (order[a.priority] || 0);
    });

    const lists = await List.find().sort({ name: 1 });

    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);

    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);

    res.render('index', {
      todosToday,
      lists,
      currentDate,
      currentDateStr,
      prevDateStr: formatDate(prev),
      nextDateStr: formatDate(next),
      todayDateStr: formatDate(today),
      showCompleted
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// IMPORTANT (reuses All Tasks page with important filter)
app.get('/important', (req, res) => {
  res.redirect('/todos?important=true');
});

// Routes
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);
app.use('/lists', listRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
