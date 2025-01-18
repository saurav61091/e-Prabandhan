const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

// Load environment variables
dotenv.config();

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
      default: process.env.DB_PASS || ''
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
      name: 'username',
      message: 'Admin username:',
      default: 'admin'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Admin email:',
      default: 'admin@eprabandhan.com'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Admin password:',
      default: 'Admin@123'
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
                          CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    await connection.end();
    spinner.succeed('Database created');
  } catch (error) {
    spinner.fail('Failed to create database');
    throw error;
  }
}

async function updateEnvFile(config) {
  const spinner = ora('Updating environment configuration...').start();
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
    envContent = envContent.replace(/DB_PASS=.*/, `DB_PASS=${config.password}`);
    envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${config.database}`);

    // Generate JWT secret if not exists
    if (!envContent.includes('JWT_SECRET=')) {
      const jwtSecret = require('crypto').randomBytes(64).toString('hex');
      envContent += `\nJWT_SECRET=${jwtSecret}`;
    }

    await fs.writeFile(envPath, envContent);
    spinner.succeed('Environment configuration updated');
  } catch (error) {
    spinner.fail('Failed to update environment configuration');
    throw error;
  }
}

async function runMigrations() {
  const spinner = ora('Running database migrations...').start();
  try {
    // Import the migration runner
    const { Sequelize } = require('sequelize');
    const { Umzug, SequelizeStorage } = require('umzug');
    const config = require('../config/config');

    const sequelize = new Sequelize(config.development);
    
    const umzug = new Umzug({
      migrations: {
        path: path.join(__dirname, '../migrations'),
        params: [sequelize.getQueryInterface(), Sequelize]
      },
      storage: new SequelizeStorage({ sequelize }),
      logger: undefined
    });

    await umzug.up();
    spinner.succeed('Database migrations completed');
  } catch (error) {
    spinner.fail('Failed to run migrations');
    throw error;
  }
}

async function seedDatabase(adminConfig) {
  const spinner = ora('Seeding database...').start();
  try {
    const seedScript = require('./seed');
    await seedScript(adminConfig);
    spinner.succeed('Database seeded with initial data');
  } catch (error) {
    spinner.fail('Failed to seed database');
    throw error;
  }
}

async function setupDirectories() {
  const spinner = ora('Setting up directories...').start();
  try {
    const dirs = [
      '../uploads',
      '../uploads/documents',
      '../uploads/temp',
      '../logs'
    ];

    for (const dir of dirs) {
      const dirPath = path.join(__dirname, dir);
      await fs.mkdir(dirPath, { recursive: true });
    }

    spinner.succeed('Directories created');
  } catch (error) {
    spinner.fail('Failed to create directories');
    throw error;
  }
}

async function main() {
  console.log(chalk.green('\n=== e-Prabandhan Setup Wizard ===\n'));

  try {
    // Check and install dependencies
    await checkDependencies();

    // Get configurations
    const dbConfig = await getDatabaseConfig();
    const adminConfig = await getAdminConfig();

    // Setup steps
    await createDatabase(dbConfig);
    await updateEnvFile(dbConfig);
    await setupDirectories();
    await runMigrations();
    await seedDatabase(adminConfig);

    console.log(chalk.green('\n=== Setup Completed Successfully ==='));
    console.log(chalk.blue('\nYou can now start the application with:'));
    console.log(chalk.yellow('npm start'));
    
    console.log(chalk.blue('\nAdmin Credentials:'));
    console.log(chalk.yellow(`Username: ${adminConfig.username}`));
    console.log(chalk.yellow(`Password: ${adminConfig.password}`));

  } catch (error) {
    console.error(chalk.red('\nSetup failed:'), error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = main;
