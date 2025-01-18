require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;
const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const swagger = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const previewRoutes = require('./routes/previewRoutes');
const searchRoutes = require('./routes/searchRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const auditRoutes = require('./routes/auditRoutes');
const encryptionRoutes = require('./routes/encryptionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Check if this is first run
const isFirstRun = async () => {
  try {
    const firstRunMarker = path.join(__dirname, '../.first-run');
    await fs.access(firstRunMarker);
    return true;
  } catch {
    return false;
  }
};

// Database connection check
const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch {
    return false;
  }
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable compression
app.use(compression());

// Setup logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Create write stream for access logs
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Ensure required directories exist
const dirs = ['uploads', 'temp', 'logs'].map(dir => 
  path.join(__dirname, dir)
);

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API Documentation
app.use('/api-docs', swagger.serve, swagger.setup);

// First run route
app.post('/api/setup/database', async (req, res) => {
  try {
    const { host, port, username, password, database } = req.body;

    // Update .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = await fs.readFile(envPath, 'utf8');
    
    envContent = envContent.replace(/DB_HOST=.*/, `DB_HOST=${host}`);
    envContent = envContent.replace(/DB_PORT=.*/, `DB_PORT=${port}`);
    envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${username}`);
    envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
    envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${database}`);

    await fs.writeFile(envPath, envContent);

    // Create database and run migrations
    const setupScript = path.join(__dirname, 'scripts/first-run.js');
    require(setupScript).createDatabase({
      host,
      port,
      username,
      password,
      database
    });

    // Remove first run marker
    const firstRunMarker = path.join(__dirname, '../.first-run');
    await fs.unlink(firstRunMarker);

    res.json({ success: true, message: 'Database configured successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check setup status
app.get('/api/setup/status', async (req, res) => {
  const firstRun = await isFirstRun();
  if (!firstRun) {
    res.json({ status: 'configured' });
    return;
  }

  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: dbConnected ? 'database_ready' : 'needs_setup',
    firstRun: true
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/preview', previewRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/encryption', encryptionRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to e-Prabandhan API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Log error details
  if (process.env.NODE_ENV === 'production') {
    const errorLogStream = fs.createWriteStream(
      path.join(__dirname, 'logs', 'error.log'),
      { flags: 'a' }
    );
    errorLogStream.write(`${new Date().toISOString()} - ${err.stack}\n`);
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    details: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    status: 404,
    details: {
      path: req.path,
      method: req.method
    }
  });
});

// Database sync and server start
sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    console.log('Database synced successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
    process.exit(1);
  });
