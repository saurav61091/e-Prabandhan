const { Sequelize } = require('sequelize');
require('dotenv').config();

const initializeDatabase = async () => {
  // First connect without database to create it
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    // Create database if it doesn't exist
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Database created or already exists');

    // Close initial connection
    await sequelize.close();

    // Connect to the created database
    const dbSequelize = new Sequelize({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Import and sync all models
    const models = require('../models');
    await dbSequelize.sync({ force: true }); // Be careful with force: true in production!

    console.log('Database tables created successfully');

    // Create default admin user
    await models.User.create({
      username: 'admin',
      email: 'admin@eprabandhan.com',
      password: await require('bcrypt').hash('Admin@123', 10),
      role: 'ADMIN',
      isActive: true
    });

    console.log('Default admin user created');

    await dbSequelize.close();
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
