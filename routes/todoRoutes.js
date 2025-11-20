// Handles all CRUD routes for tasks

const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// READ: list all tasks
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ completed: 1, dueDate: 1 });
    res.render('todos/list', { todos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// CREATE: show new task form
router.get('/new', (req, res) => {
  res.render('todos/new');
});

// CREATE: handle form submit
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    await Todo.create({ title, description, dueDate, priority });
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
    res.render('todos/edit', { todo });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// UPDATE: handle edit form
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, priority, completed } = req.body;
    await Todo.findByIdAndUpdate(req.params.id, {
      title,
      description,
      dueDate,
      priority,
      completed: completed === 'on'
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
