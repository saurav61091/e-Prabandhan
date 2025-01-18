const express = require('express');
const router = express.Router();
const WorkflowPermissionService = require('../services/WorkflowPermissionService');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get template permissions
router.get('/templates/:templateId', authenticateToken, async (req, res) => {
  try {
    const permissions = await WorkflowPermissionService.getTemplatePermissions(
      req.params.templateId
    );
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching template permissions:', error);
    res.status(500).json({ error: 'Failed to fetch template permissions' });
  }
});

// Get user permissions
router.get('/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.query;
    const permissions = await WorkflowPermissionService.getUserPermissions(
      req.params.userId,
      templateId
    );
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

// Check specific permission
router.get('/check', authenticateToken, async (req, res) => {
  try {
    const { userId, templateId, permission } = req.query;
    const hasPermission = await WorkflowPermissionService.checkPermission(
      userId,
      templateId,
      permission
    );
    res.json({ hasPermission });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

// Get effective permissions
router.get('/effective', authenticateToken, async (req, res) => {
  try {
    const { userId, templateId } = req.query;
    const permissions = await WorkflowPermissionService.getEffectivePermissions(
      userId,
      templateId
    );
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching effective permissions:', error);
    res.status(500).json({ error: 'Failed to fetch effective permissions' });
  }
});

// Create permission (admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const permission = await WorkflowPermissionService.createPermission(req.body);
    res.json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

// Update permission (admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const permission = await WorkflowPermissionService.updatePermission(
      req.params.id,
      req.body
    );
    res.json(permission);
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ error: 'Failed to update permission' });
  }
});

// Delete permission (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await WorkflowPermissionService.deletePermission(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({ error: 'Failed to delete permission' });
  }
});

// Copy template permissions (admin only)
router.post('/copy', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { sourceTemplateId, targetTemplateId } = req.body;
    await WorkflowPermissionService.copyTemplatePermissions(
      sourceTemplateId,
      targetTemplateId
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error copying template permissions:', error);
    res.status(500).json({ error: 'Failed to copy template permissions' });
  }
});

// Add user permission (admin only)
router.post('/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { templateId, userId, permissions, priority } = req.body;
    const permission = await WorkflowPermissionService.addUserPermission(
      templateId,
      userId,
      permissions,
      priority
    );
    res.json(permission);
  } catch (error) {
    console.error('Error adding user permission:', error);
    res.status(500).json({ error: 'Failed to add user permission' });
  }
});

// Add role permission (admin only)
router.post('/roles', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { templateId, role, permissions, priority } = req.body;
    const permission = await WorkflowPermissionService.addRolePermission(
      templateId,
      role,
      permissions,
      priority
    );
    res.json(permission);
  } catch (error) {
    console.error('Error adding role permission:', error);
    res.status(500).json({ error: 'Failed to add role permission' });
  }
});

// Add department permission (admin only)
router.post('/departments', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { templateId, department, permissions, priority } = req.body;
    const permission = await WorkflowPermissionService.addDepartmentPermission(
      templateId,
      department,
      permissions,
      priority
    );
    res.json(permission);
  } catch (error) {
    console.error('Error adding department permission:', error);
    res.status(500).json({ error: 'Failed to add department permission' });
  }
});

module.exports = router;
