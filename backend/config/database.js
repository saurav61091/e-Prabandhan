/**
 * Database Configuration Module
 * 
 * This module sets up the Sequelize ORM connection to the MySQL database.
 * It uses environment variables for configuration and provides connection pooling.
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    
    // Connection pool configuration
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,     // Maximum number of connections in pool
      min: parseInt(process.env.DB_POOL_MIN) || 0,     // Minimum number of connections in pool
      acquire: 30000,                                  // Maximum time (ms) to acquire a connection
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000 // Maximum time (ms) a connection can be idle
    },
    
    // Logging configuration - only log in development
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Define global model options
    define: {
      underscored: true,           // Use snake_case for fields
      timestamps: true,            // Add createdAt and updatedAt timestamps
      paranoid: true,             // Enable soft deletes (deletedAt timestamp)
      freezeTableName: true       // Prevent pluralization of table names
    }
  }
);

// Export the configured Sequelize instance
module.exports = sequelize;
