const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');

// Get task statistics
router.get('/stats', auth, getTaskStats);

// Create task
router.post('/',
  auth,
  authorize(['admin', 'manager']),
  createTask
);

// Get all tasks
router.get('/', auth, getAllTasks);

// Get single task
router.get('/:id', auth, getTaskById);

// Update task
router.put('/:id', auth, updateTask);

// Delete task
router.delete('/:id',
  auth,
  authorize(['admin', 'manager']),
  deleteTask
);

module.exports = router;
