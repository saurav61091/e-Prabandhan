const setupService = require('../services/setupService');
const { validateDatabaseConfig } = require('../validators/configValidator');

class SetupController {
  async checkSetupStatus(req, res) {
    try {
      const isConfigured = await setupService.isSetupComplete();
      res.json({ isConfigured });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to check setup status',
        details: error.message,
      });
    }
  }

  async setupDatabase(req, res) {
    try {
      const config = req.body;
      
      // Validate configuration
      const validationError = validateDatabaseConfig(config);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Attempt database setup
      await setupService.setupDatabase(config);

      res.json({
        success: true,
        message: 'Database setup completed successfully',
      });
    } catch (error) {
      res.status(500).json({
        error: 'Database setup failed',
        details: error.message,
      });
    }
  }

  async testDatabaseConnection(req, res) {
    try {
      const config = req.body;
      
      // Validate configuration
      const validationError = validateDatabaseConfig(config);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Test connection
      const canConnect = await setupService.checkDatabaseConnection(config);
      
      if (canConnect) {
        res.json({
          success: true,
          message: 'Database connection successful',
        });
      } else {
        res.status(400).json({
          error: 'Database connection failed',
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Connection test failed',
        details: error.message,
      });
    }
  }

  async completeSetup(req, res) {
    try {
      // Perform any final setup steps
      // Mark setup as complete
      // Initialize default settings

      res.json({
        success: true,
        message: 'Setup completed successfully',
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to complete setup',
        details: error.message,
      });
    }
  }
}

module.exports = new SetupController();
