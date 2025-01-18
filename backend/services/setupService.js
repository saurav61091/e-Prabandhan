const { Sequelize } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

class SetupService {
  constructor() {
    this.configPath = path.join(__dirname, '../config/database.json');
  }

  async checkDatabaseConnection(config) {
    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    });

    try {
      await sequelize.authenticate();
      return true;
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      return false;
    } finally {
      await sequelize.close();
    }
  }

  async createDatabase(config) {
    const rootSequelize = new Sequelize({
      dialect: 'mysql',
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    });

    try {
      await rootSequelize.query(`CREATE DATABASE IF NOT EXISTS ${config.database};`);
      return true;
    } catch (error) {
      console.error('Error creating database:', error);
      throw error;
    } finally {
      await rootSequelize.close();
    }
  }

  async initializeTables(config) {
    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
    });

    try {
      // Import all models
      const models = require('../models');

      // Sync all models with database
      await sequelize.sync({ force: true });

      // Create initial admin user
      await models.User.create({
        username: config.adminUsername,
        password: config.adminPassword, // Should be hashed
        email: config.adminEmail,
        role: 'ADMIN',
        isActive: true,
      });

      // Create default organization settings
      await models.OrganizationSettings.create({
        name: config.organizationName,
        type: config.organizationType,
        fiscalYearStart: config.fiscalYearStart,
        fiscalYearEnd: config.fiscalYearEnd,
      });

      return true;
    } catch (error) {
      console.error('Error initializing tables:', error);
      throw error;
    } finally {
      await sequelize.close();
    }
  }

  async saveDatabaseConfig(config) {
    try {
      await fs.writeFile(
        this.configPath,
        JSON.stringify({
          development: {
            username: config.username,
            password: config.password,
            database: config.database,
            host: config.host,
            port: config.port,
            dialect: 'mysql',
          },
          production: {
            username: config.username,
            password: config.password,
            database: config.database,
            host: config.host,
            port: config.port,
            dialect: 'mysql',
          },
        }, null, 2)
      );
      return true;
    } catch (error) {
      console.error('Error saving database config:', error);
      throw error;
    }
  }

  async setupDatabase(config) {
    try {
      // Step 1: Test connection
      const canConnect = await this.checkDatabaseConnection(config);
      if (!canConnect) {
        throw new Error('Cannot connect to database server');
      }

      // Step 2: Create database
      await this.createDatabase(config);

      // Step 3: Initialize tables
      await this.initializeTables(config);

      // Step 4: Save configuration
      await this.saveDatabaseConfig(config);

      return true;
    } catch (error) {
      console.error('Database setup failed:', error);
      throw error;
    }
  }

  async isSetupComplete() {
    try {
      const config = require(this.configPath);
      const sequelize = new Sequelize(config[process.env.NODE_ENV || 'development']);
      await sequelize.authenticate();
      
      // Check if admin user exists
      const [results] = await sequelize.query('SELECT COUNT(*) as count FROM Users WHERE role = "ADMIN"');
      const hasAdmin = results[0].count > 0;

      await sequelize.close();
      return hasAdmin;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new SetupService();
