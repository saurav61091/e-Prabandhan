const { sequelize } = require('../models');
const { logger } = require('../utils/logger');

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
global.beforeAll(async () => {
  // Sync database with force true in test environment
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync({ force: true });
  }
});

// Global test teardown
global.afterAll(async () => {
  await sequelize.close();
});

// Silence logger in tests
logger.logger.silent = true;
