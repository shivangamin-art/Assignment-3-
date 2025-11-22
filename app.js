// app.js
// Main entry point for TaskTrackr


const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
require('dotenv').config();

const todoRoutes = require('./routes/todoRoutes');
const listRoutes = require('./routes/listRoutes');

const app = express();

// connection to MongoDB using the connection string from config/db
connectDB();

// configuring view engine (EJS) and serving static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware parsing form data, JSON, and handle HTTP method overrides
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// helper function to format a date to YYYY-MM-DD for comparison
function formatDate(date) {
  return date.toISOString().split("T")[0];
}


// HOME PAGE (My Day)

// displaying the tasks due on a selected date (defaults to today).

app.get("/", async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // determines which date to display
    let currentDate;
    if (req.query.date) {
      const [y, m, d] = req.query.date.split("-").map(Number);
      currentDate = new Date(y, m - 1, d);
    } else {
      currentDate = today;
    }

    const currentDateStr = formatDate(currentDate);
    const showCompleted = req.query.showCompleted === "true";

    const Todo = require("./models/Todo");
    const List = require("./models/List");

    // fetching all todos and populating list details
    let todos = await Todo.find().populate("list");

    // filtering todos based on the selected date
    let todosToday = todos.filter((todo) => {
      if (!todo.dueDate) return false;
      return formatDate(todo.dueDate) === currentDateStr;
    });

    // hide completed tasks
    if (!showCompleted) {
      todosToday = todosToday.filter((todo) => !todo.completed);
    }

    // sorting by completion status first, then by priority (High > Medium > Low)
    todosToday.sort((a, b) => {
      const order = { High: 3, Medium: 2, Low: 1 };
      if (a.completed !== b.completed) return a.completed - b.completed;
      return (order[b.priority] || 0) - (order[a.priority] || 0);
    });

    // fetching all lists for the sidebar
    const lists = await List.find().sort({ name: 1 });

    // calculating previous and next day for navigation
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);

    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);

    res.render("index", {
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
    res.status(500).send("Server Error");
  }
});


// IMPORTANT VIEW
// Redirects to the todos route with a filter for important tasks only.

app.get("/important", (req, res) => {
  res.redirect("/todos?important=true");
});

// routes for todos and lists are mounted at /todos and /lists

app.use('/todos', todoRoutes);
app.use('/lists', listRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});


// starting server and listening on specified PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
