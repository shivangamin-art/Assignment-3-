// routes/listRoutes.js

const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Todo = require('../models/Todo');


// GET all lists (My Lists page)

router.get('/', async (req, res) => {
  try {
    const lists = await List.find().sort({ createdAt: 1 });
    res.render('lists/index', { lists });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading lists');
  }
});


// NEW list form

router.get('/new', (req, res) => {
  res.render('lists/new');
});


// CREATE list

router.post('/', async (req, res) => {
  try {
    await List.create({ name: req.body.name });
    res.redirect('/lists');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating list');
  }
});


// SHOW a single list and its tasks

router.get('/:id', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).send('List not found');

    const showCompleted = req.query.showCompleted === 'true';

    const filter = { list: list._id };
    if (!showCompleted) filter.completed = false;

    const todos = await Todo.find(filter)
      .populate('list')
      .sort({ dueDate: 1 });

    res.render('lists/show', { list, todos, showCompleted });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading list');
  }
});


// DELETE list (and its tasks)

router.get('/:id/delete', async (req, res) => {
  try {
    const listId = req.params.id;

    // Remove all tasks associated with this list
    await Todo.deleteMany({ list: listId });

    // Remove the list itself
    await List.findByIdAndDelete(listId);

    res.redirect('/lists');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting list');
  }
});

module.exports = router;
