// routes/todoRoutes.js
// Handles all CRUD routes for tasks

const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const List = require('../models/List');

// Helper: parse "YYYY-MM-DD" as a LOCAL date (avoid UTC shift)
function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [y, m, d] = dateString.split('-').map(Number);
  // year, monthIndex (0-based), day -> local date
  return new Date(y, m - 1, d);
}

// READ: list all tasks
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find()
      .populate('list')
      .sort({ completed: 1, dueDate: 1 });

    res.render('todos/list', { todos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// CREATE: show new task form
router.get('/new', async (req, res) => {
  try {
    const lists = await List.find().sort({ name: 1 });
    res.render('todos/new', { lists });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// CREATE: handle form submit
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority, list, important } = req.body;

    const parsedDueDate = parseLocalDate(dueDate);

    await Todo.create({
      title,
      description,
      dueDate: parsedDueDate,
      priority,
      important: important === 'on',
      list: list || null
    });

    res.redirect('/todos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// UPDATE: show edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).send('Task not found');

    const lists = await List.find().sort({ name: 1 });

    res.render('todos/edit', { todo, lists });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// UPDATE: handle edit form
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, priority, list, completed, important } = req.body;

    const parsedDueDate = parseLocalDate(dueDate);

    await Todo.findByIdAndUpdate(req.params.id, {
      title,
      description,
      dueDate: parsedDueDate,
      priority,
      completed: completed === 'on',
      important: important === 'on',
      list: list || null
    });

    res.redirect('/todos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE CONFIRM PAGE
router.get('/:id/delete', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).send('Task not found');
    res.render('todos/delete', { todo });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE: handle delete
router.delete('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect('/todos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
