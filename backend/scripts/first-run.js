const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { Sequelize } = require('sequelize');

// Load environment variables
dotenv.config();

// Constants
const REQUIRED_DIRS = [
  'uploads',
  'uploads/documents',
  'uploads/signatures',
  'uploads/temp',
  'logs',
  'backups'
];

async function checkDependencies() {
  const spinner = ora('Checking dependencies...').start();
  try {
    // Check if node_modules exists
    try {
      await fs.access(path.join(__dirname, '../node_modules'));
    } catch {
      spinner.text = 'Installing dependencies...';
      execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    }
    spinner.succeed('Dependencies checked');
  } catch (error) {
    spinner.fail('Failed to check dependencies');
    throw error;
  }
}

async function checkMySQLConnection(config) {
  const spinner = ora('Checking MySQL connection...').start();
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password
    });
    await connection.end();
    spinner.succeed('MySQL connection successful');
    return true;
  } catch (error) {
    spinner.fail('MySQL connection failed');
    console.error(chalk.red('Error:'), error.message);
    return false;
  }
}

async function getDatabaseConfig() {
  console.log(chalk.blue('\nDatabase Configuration'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'host',
      message: 'Database host:',
      default: process.env.DB_HOST || 'localhost'
    },
    {
      type: 'input',
      name: 'port',
      message: 'Database port:',
      default: process.env.DB_PORT || '3306'
    },
    {
      type: 'input',
      name: 'username',
      message: 'Database username:',
      default: process.env.DB_USER || 'root'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Database password:',
      default: process.env.DB_PASSWORD || ''
    },
    {
      type: 'input',
      name: 'database',
      message: 'Database name:',
      default: process.env.DB_NAME || 'eprabandhan'
    }
  ]);

  return answers;
}

async function getAdminConfig() {
  console.log(chalk.blue('\nAdmin User Configuration'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Admin email:',
      default: 'admin@eprabandhan.com',
      validate: input => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Please enter a valid email';
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Admin password:',
      validate: input => {
        return input.length >= 8 || 'Password must be at least 8 characters';
      }
    },
    {
      type: 'input',
      name: 'firstName',
      message: 'Admin first name:',
      default: 'System'
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Admin last name:',
      default: 'Administrator'
    }
  ]);

  return answers;
}

async function createDatabase(config) {
  const spinner = ora('Creating database...').start();
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}
                          CHARACTER SET utf8mb4
                          COLLATE utf8mb4_unicode_ci`);
    
    await connection.end();
    spinner.succeed('Database created successfully');
  } catch (error) {
    spinner.fail('Failed to create database');
    throw error;
  }
}

async function runSQLFile(config, filePath) {
  const spinner = ora('Running SQL file...').start();
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      multipleStatements: true
    });

    const sql = await fs.readFile(filePath, 'utf8');
    await connection.query(sql);
    await connection.end();
    spinner.succeed('SQL file executed successfully');
  } catch (error) {
    spinner.fail('Failed to execute SQL file');
    throw error;
  }
}

async function updateEnvFile(config) {
  const spinner = ora('Updating environment variables...').start();
  try {
    const envPath = path.join(__dirname, '../.env');
    const envExample = path.join(__dirname, '../.env.example');
    
    // Read .env.example if .env doesn't exist
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch {
      envContent = await fs.readFile(envExample, 'utf8');
    }

    // Update database configuration
    envContent = envContent.replace(/DB_HOST=.*/, `DB_HOST=${config.host}`);
    envContent = envContent.replace(/DB_PORT=.*/, `DB_PORT=${config.port}`);
    envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${config.username}`);
    envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${config.password}`);
    envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${config.database}`);

    // Add JWT secret if not exists
    if (!envContent.includes('JWT_SECRET=')) {
      const jwtSecret = require('crypto').randomBytes(32).toString('hex');
      envContent += `\nJWT_SECRET=${jwtSecret}`;
    }

    await fs.writeFile(envPath, envContent);
    spinner.succeed('Environment variables updated');
  } catch (error) {
    spinner.fail('Failed to update environment variables');
    throw error;
  }
}

async function runMigrations() {
  const spinner = ora('Running database migrations...').start();
  try {
    execSync('npx sequelize-cli db:migrate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    spinner.succeed('Migrations completed');
  } catch (error) {
    spinner.fail('Failed to run migrations');
    throw error;
  }
}

async function seedDatabase(adminConfig) {
  const spinner = ora('Seeding database...').start();
  try {
    const models = require('../models');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminConfig.password, 10);
    await models.User.create({
      email: adminConfig.email,
      password: hashedPassword,
      firstName: adminConfig.firstName,
      lastName: adminConfig.lastName,
      role: 'admin',
      status: 'active'
    });

    // Create default organization
    await models.Organization.create({
      name: 'e-Prabandhan',
      code: 'EPRB',
      primaryColor: '#1976D2',
      secondaryColor: '#424242'
    });

    spinner.succeed('Database seeded with initial data');
  } catch (error) {
    spinner.fail('Failed to seed database');
    throw error;
  }
}

async function setupDirectories() {
  const spinner = ora('Setting up directories...').start();
  try {
    for (const dir of REQUIRED_DIRS) {
      const dirPath = path.join(__dirname, '..', dir);
      await fs.mkdir(dirPath, { recursive: true });
    }
    spinner.succeed('Directories created');
  } catch (error) {
    spinner.fail('Failed to create directories');
    throw error;
  }
}

async function main() {
  console.log(chalk.green('\n=== e-Prabandhan First Run Setup ===\n'));

  try {
    // Step 1: Check dependencies
    await checkDependencies();

    // Step 2: Get database configuration
    const dbConfig = await getDatabaseConfig();

    // Step 3: Check MySQL connection
    const isConnected = await checkMySQLConnection(dbConfig);
    if (!isConnected) {
      console.log(chalk.red('Please check your MySQL configuration and try again.'));
      process.exit(1);
    }

    // Step 4: Create database
    await createDatabase(dbConfig);

    // Step 5: Run schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    await runSQLFile(dbConfig, schemaPath);

    // Step 6: Update .env file
    await updateEnvFile(dbConfig);

    // Step 7: Get admin configuration
    const adminConfig = await getAdminConfig();

    // Step 8: Run migrations
    await runMigrations();

    // Step 9: Seed database with admin user
    await seedDatabase(adminConfig);

    // Step 10: Setup required directories
    await setupDirectories();

    console.log(chalk.green('\n=== Setup Completed Successfully ==='));
    console.log(chalk.blue('\nYou can now start the application:'));
    console.log(chalk.yellow('\nnpm run dev'));
    
  } catch (error) {
    console.error(chalk.red('\nSetup failed:'), error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkDependencies,
  checkMySQLConnection,
  createDatabase,
  updateEnvFile,
  runMigrations,
  seedDatabase,
  setupDirectories
};
