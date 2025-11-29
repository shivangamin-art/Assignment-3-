// routes/todoRoutes.js
const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const List = require('../models/List');
const { ensureAuth } = require('../middleware/auth');


// getting all tasks 

router.get('/', async (req, res) => {
  try {
    const showCompleted = req.query.showCompleted === 'true';
    const priorityFilter = req.query.priority || null;
    const importantFilter = req.query.important === 'true';

    const filter = {};

    // hiding completed by default
    if (!showCompleted) {
      filter.completed = false;
    }

    if (priorityFilter) {
      filter.priority = priorityFilter;
    }

    if (importantFilter) {
      filter.important = true;
    }

    const todos = await Todo.find(filter)
      .populate('list')
      .sort({ dueDate: 1 });

    res.render('todos/list', {
      todos,
      showCompleted,
      priorityFilter,
      importantFilter
    });
  } catch (error) {
    console.error(error);
    res.send('Error loading tasks');
  }
});

// creating new task form
router.get('/new', async (req, res) => {
  const lists = await List.find();
  res.render('todos/new', { lists });
});

// task creation
router.post('/', async (req, res) => {
  await Todo.create({
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate || null,
    priority: req.body.priority,
    list: req.body.list || null,
    important: req.body.important === 'on',
    completed: false
  });
  res.redirect('/todos');
});

// editing task form
router.get('/:id/edit', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  const lists = await List.find();
  res.render('todos/edit', { todo, lists });
});

// updating task form
router.put('/:id', async (req, res) => {
  await Todo.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate || null,
    priority: req.body.priority,
    list: req.body.list || null,
    important: req.body.important === 'on',
    completed: req.body.completed === 'on'
  });
  res.redirect('/todos');
});

// completing task
router.put('/:id/complete', async (req, res) => {
  await Todo.findByIdAndUpdate(req.params.id, { completed: true });
  res.redirect(req.get('referer'));
});

// deleting the task
router.get('/:id/delete', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.redirect(req.get('referer'));
});

module.exports = router;
