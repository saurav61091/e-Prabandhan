const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const previewRoutes = require('./routes/previewRoutes');
const searchRoutes = require('./routes/searchRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const auditRoutes = require('./routes/auditRoutes');
const encryptionRoutes = require('./routes/encryptionRoutes');

// Import Swagger configuration
const swagger = require('./config/swagger');
const { swaggerUi, swaggerDocument, swaggerOptions } = require('./middleware/swagger');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/preview', previewRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/encryption', encryptionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    details: err.details || {}
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

module.exports = app;
