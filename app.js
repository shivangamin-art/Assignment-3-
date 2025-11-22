// app.js
// Main entry point for TaskTrackr

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const connectDB = require("./config/db");
require("dotenv").config();

const todoRoutes = require("./routes/todoRoutes");
const listRoutes = require("./routes/listRoutes");
const Todo = require("./models/Todo");
const List = require("./models/List");

const app = express();

// Connect to MongoDB
connectDB();

// View engine & static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse form data & JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow PUT/DELETE from forms
app.use(methodOverride("_method"));

// ================================
// Helper: Format date as YYYY-MM-DD
// ================================
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ================================
// HOME PAGE — MY DAY
// ================================
app.get("/", async (req, res) => {
  try {
    // Real local "today"
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Selected date from query OR today
    let currentDate;
    if (req.query.date) {
      const [y, m, d] = req.query.date.split("-").map(Number);
      currentDate = new Date(y, m - 1, d);
    } else {
      currentDate = today;
    }

    const currentDateStr = formatDate(currentDate);

    // Get all todos (avoid timezone issues)
    let todos = await Todo.find().populate("list");

    // Filter by formatted date string
    const todosToday = todos
      .filter((todo) => {
        if (!todo.dueDate) return false;
        return formatDate(todo.dueDate) === currentDateStr;
      })
      .sort((a, b) => {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        if (a.completed !== b.completed) {
          return a.completed - b.completed; // incomplete first
        }
        return (
          (priorityOrder[b.priority] || 0) -
          (priorityOrder[a.priority] || 0)
        );
      });

    // All lists for sidebar
    const lists = await List.find().sort({ name: 1 });

    // Navigation dates
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ================================
// IMPORTANT TASKS PAGE
// ================================
app.get("/important", async (req, res) => {
  try {
    const importantTodos = await Todo.find({ important: true })
      .populate("list")
      .sort({ completed: 1, dueDate: 1 });

    const lists = await List.find().sort({ name: 1 });

    res.render("important", { importantTodos, lists });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ================================
// PLANNED TASKS (NEXT 7 DAYS)
// ================================
app.get("/planned", async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);

    const plannedTodos = await Todo.find({
      dueDate: { $gte: start, $lte: end },
    })
      .populate("list")
      .sort({ dueDate: 1 });

    const lists = await List.find().sort({ name: 1 });

    res.render("planned", { plannedTodos, lists, today: start, endOfRange: end });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ================================
// ROUTES
// ================================
app.use("/todos", todoRoutes);
app.use("/lists", listRoutes);

// ================================
// 404 HANDLER
// ================================
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
