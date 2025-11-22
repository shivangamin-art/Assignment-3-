// routes/todoRoutes.js
const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const List = require('../models/List');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

// -------------------------------
// GET all tasks
// -------------------------------
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().populate('list').sort({ dueDate: 1 });
    res.render('todos/list', { todos });
  } catch (error) {
    console.error(error);
    res.send('Error loading tasks');
  }
});

// -------------------------------
// NEW task form
// -------------------------------
router.get('/new', async (req, res) => {
  try {
    const lists = await List.find();
    res.render('todos/new', { lists });
  } catch (error) {
    console.error(error);
    res.send('Error loading new task form');
  }
});

// -------------------------------
// CREATE task
// -------------------------------
router.post('/', async (req, res) => {
  try {
    const todo = new Todo({
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate || null,
      priority: req.body.priority,
      list: req.body.list && req.body.list !== '' ? req.body.list : null,
      important: req.body.important === 'on',
      completed: false
    });

    await todo.save();
    res.redirect('/todos');
  } catch (error) {
    console.error(error);
    res.send('Error creating task');
  }
});

// -------------------------------
// EDIT task form
// -------------------------------
router.get('/:id/edit', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    const lists = await List.find();
    res.render('todos/edit', { todo, lists });
  } catch (error) {
    console.error(error);
    res.send('Error loading edit form');
  }
});

// -------------------------------
// UPDATE task
// -------------------------------
router.put('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate || null,
      priority: req.body.priority,
      list: req.body.list && req.body.list !== '' ? req.body.list : null,
      important: req.body.important === 'on',
      completed: req.body.completed === 'on'
    });

    res.redirect('/todos');
  } catch (error) {
    console.error(error);
    res.send('Error updating task');
  }
});

// -------------------------------
// COMPLETE task (stay on same page)
// -------------------------------
router.put('/:id/complete', async (req, res) => {
  try {
    await Todo.findByIdAndUpdate(req.params.id, { completed: true });

    // Stay on same page
    res.redirect(req.get('referer'));
  } catch (error) {
    console.error(error);
    res.redirect('/todos');
  }
});

// -------------------------------
// DELETE task (stay on same page)
// -------------------------------
router.get('/:id/delete', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);

    // Stay on same page
    res.redirect(req.get('referer'));
  } catch (error) {
    console.error(error);
    res.redirect('/todos');
  }
});

module.exports = router;
