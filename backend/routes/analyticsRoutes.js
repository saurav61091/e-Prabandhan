const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  getDepartmentLeaveStats,
  getLeaveUtilizationTrends,
  getTourExpenseAnalytics,
  generateCustomReport,
  downloadReport
} = require('../controllers/analyticsController');

// Dashboard statistics
router.get('/dashboard', isAuthenticated, getDashboardStats);

// Department-wise analytics
router.get('/department/leaves', isAuthenticated, isAdmin, getDepartmentLeaveStats);

// Leave utilization trends
router.get('/leaves/trends', isAuthenticated, getLeaveUtilizationTrends);

// Tour expense analytics
router.get('/tours/expenses', isAuthenticated, getTourExpenseAnalytics);

// Custom reports
router.post('/reports', isAuthenticated, generateCustomReport);
router.get('/reports/download/:fileName', isAuthenticated, downloadReport);

module.exports = router;
