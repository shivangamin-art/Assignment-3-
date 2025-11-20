// routes/listRoutes.js
// Routes for creating, listing, viewing and deleting custom lists

const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Todo = require('../models/Todo');

// GET /lists - show all lists
router.get('/', async (req, res) => {
  try {
    const lists = await List.find().sort({ createdAt: 1 });
    res.render('lists/index', { lists });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /lists/new - form to create a new list
router.get('/new', (req, res) => {
  res.render('lists/new');
});

// POST /lists - create a new list
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).send('List name is required');
    }
    await List.create({ name: name.trim() });
    res.redirect('/lists');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /lists/:id - view tasks inside a specific list
router.get('/:id', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).send('List not found');

    const todos = await Todo.find({ list: list._id }).sort({ completed: 1, dueDate: 1 });
    res.render('lists/show', { list, todos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /lists/:id/delete - confirm delete list
router.get('/:id/delete', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).send('List not found');
    res.render('lists/delete', { list });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE /lists/:id - delete list and optionally its tasks
router.delete('/:id', async (req, res) => {
  try {
    const listId = req.params.id;

    // Delete all todos that belong to this list
    await Todo.deleteMany({ list: listId });

    // Delete the list itself
    await List.findByIdAndDelete(listId);

    res.redirect('/lists');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
