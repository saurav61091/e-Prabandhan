const Task = require('../models/Task');
const User = require('../models/User');
const { Op } = require('sequelize');

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id,
      status: 'pending'
    });

    // Notify assigned user via Socket.IO
    req.app.get('io').to(`user_${req.body.assignedTo}`).emit('newTask', {
      task,
      message: 'You have been assigned a new task'
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const where = {};
    
    // Filter by status
    if (req.query.status) {
      where.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority) {
      where.priority = req.query.priority;
    }

    // Filter by due date
    if (req.query.dueDate) {
      where.dueDate = {
        [Op.lte]: new Date(req.query.dueDate)
      };
    }

    // Search by title or description
    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Filter tasks based on user role
    if (req.user.role !== 'admin') {
      where[Op.or] = [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ];
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['dueDate', 'ASC']
      ]
    });

    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id } });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check authorization
    if (task.createdBy !== req.user.id && 
        task.assignedTo !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const oldStatus = task.status;
    await task.update(req.body);

    // Notify relevant users about task update
    if (oldStatus !== task.status) {
      const io = req.app.get('io');
      io.to(`user_${task.assignedTo}`).emit('taskUpdated', {
        task,
        message: `Task status updated to ${task.status}`
      });
      io.to(`user_${task.createdBy}`).emit('taskUpdated', {
        task,
        message: `Task status updated to ${task.status}`
      });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id } });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only admin or task creator can delete
    if (task.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    await task.destroy();

    // Notify assigned user about task deletion
    req.app.get('io').to(`user_${task.assignedTo}`).emit('taskDeleted', {
      taskId: task.id,
      message: 'A task assigned to you has been deleted'
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const where = req.user.role !== 'admin' 
      ? { [Op.or]: [{ assignedTo: userId }, { createdBy: userId }] }
      : {};

    const stats = {
      total: await Task.count({ where }),
      pending: await Task.count({ where: { ...where, status: 'pending' } }),
      inProgress: await Task.count({ where: { ...where, status: 'in_progress' } }),
      completed: await Task.count({ where: { ...where, status: 'completed' } }),
      highPriority: await Task.count({ where: { ...where, priority: 'high' } }),
      dueSoon: await Task.count({
        where: {
          ...where,
          dueDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          },
          status: { [Op.ne]: 'completed' }
        }
      })
    };

    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
};
