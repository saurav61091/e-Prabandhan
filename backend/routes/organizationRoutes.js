const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  createOrganization,
  updateOrganization,
  getOrganization,
  getHierarchy,
  searchOrganizations,
  getStatistics,
  moveOrganization
} = require('../controllers/organizationController');

// Organization management routes
router.post(
  '/',
  auth,
  checkRole(['admin', 'hr']),
  createOrganization
);

router.put(
  '/:orgId',
  auth,
  checkRole(['admin', 'hr']),
  updateOrganization
);

router.get(
  '/:orgId',
  auth,
  getOrganization
);

router.get(
  '/:orgId/hierarchy',
  auth,
  getHierarchy
);

router.get(
  '/',
  auth,
  searchOrganizations
);

router.get(
  '/stats',
  auth,
  checkRole(['admin', 'hr', 'manager']),
  getStatistics
);

router.post(
  '/:orgId/move',
  auth,
  checkRole(['admin', 'hr']),
  moveOrganization
);

module.exports = router;
