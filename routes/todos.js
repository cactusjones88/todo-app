const express = require('express');
const Todo = require('../models/Todo');
const { protect } = require('../middleware/auth'); // ADD THIS IMPORT
const router = express.Router();

// PROTECT ALL TODO ROUTES - ADD THIS LINE
router.use(protect);

// GET all todos for logged-in user
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// POST new todo for logged-in user
router.post('/', async (req, res) => {
    try {
        const { task, priority, dueDate } = req.body;
        
        if (!task || task.trim() === '') {
            return res.status(400).json({ error: 'Task is required' });
        }

        const todo = new Todo({
            task: task.trim(),
            priority: priority || 'medium',
            dueDate: dueDate || null,
            user: req.user._id  // ADD USER ID TO NEW TODO
        });

        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

// PUT update todo (only if user owns it)
router.put('/:id', async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        todo.completed = !todo.completed;
        await todo.save();
        
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update todo' });
    }
});

// DELETE todo (only if user owns it)
router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ 
            success: true, 
            message: 'Todo deleted successfully',
            deletedTodo: todo 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

module.exports = router;