const express = require('express');
const router = express.Router();
const WorkflowMetricsService = require('../services/WorkflowMetricsService');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get dashboard metrics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const metrics = await WorkflowMetricsService.generateDashboardMetrics(
      new Date(startDate),
      new Date(endDate)
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Get template performance metrics
router.get('/templates/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const { startDate, endDate } = req.query;
    const metrics = await WorkflowMetricsService.getTemplatePerformance(
      templateId,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching template metrics:', error);
    res.status(500).json({ error: 'Failed to fetch template metrics' });
  }
});

// Get department performance metrics
router.get('/departments/:department', authenticateToken, async (req, res) => {
  try {
    const { department } = req.params;
    const { startDate, endDate } = req.query;
    const metrics = await WorkflowMetricsService.getDepartmentPerformance(
      department,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching department metrics:', error);
    res.status(500).json({ error: 'Failed to fetch department metrics' });
  }
});

// Get user performance metrics
router.get('/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const metrics = await WorkflowMetricsService.getUserPerformance(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({ error: 'Failed to fetch user metrics' });
  }
});

// Get SLA performance metrics
router.get('/sla/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const { startDate, endDate } = req.query;
    const metrics = await WorkflowMetricsService.getSLAPerformance(
      templateId,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching SLA metrics:', error);
    res.status(500).json({ error: 'Failed to fetch SLA metrics' });
  }
});

// Record custom metric (admin only)
router.post('/custom', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const metric = await WorkflowMetricsService.recordMetric(req.body);
    res.json(metric);
  } catch (error) {
    console.error('Error recording custom metric:', error);
    res.status(500).json({ error: 'Failed to record custom metric' });
  }
});

module.exports = router;
