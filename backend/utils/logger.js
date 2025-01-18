const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4
    };

    this.colors = {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'white'
    };

    // Add colors to Winston
    winston.addColors(this.colors);

    // Create logger instance
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      levels: this.logLevels,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      transports: this.getTransports(),
      exitOnError: false
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
          )
        )
      }));
    }
  }

  /**
   * Get log transports based on environment
   * @private
   * @returns {Array} Array of winston transports
   */
  getTransports() {
    const transports = [
      // Error logs
      new DailyRotateFile({
        filename: path.join(this.logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
      }),

      // Combined logs
      new DailyRotateFile({
        filename: path.join(this.logDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
      })
    ];

    // Add HTTP logs in production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new DailyRotateFile({
          filename: path.join(this.logDir, 'http-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'http',
          maxSize: '20m',
          maxFiles: '7d',
          zippedArchive: true
        })
      );
    }

    return transports;
  }

  /**
   * Format error for logging
   * @private
   * @param {Error} error - Error object
   * @returns {Object} Formatted error
   */
  formatError(error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      details: error.details || {}
    };
  }

  /**
   * Format metadata
   * @private
   * @param {Object} meta - Metadata object
   * @returns {Object} Formatted metadata
   */
  formatMetadata(meta = {}) {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...meta
    };
  }

  /**
   * Log error message
   * @param {string|Error} message - Error message or object
   * @param {Object} meta - Additional metadata
   */
  error(message, meta = {}) {
    const error = message instanceof Error ? this.formatError(message) : { message };
    this.logger.error(error, this.formatMetadata(meta));
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, this.formatMetadata(meta));
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, this.formatMetadata(meta));
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} meta - Additional metadata
   */
  http(req, res, meta = {}) {
    const httpInfo = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: meta.responseTime,
      userAgent: req.get('user-agent'),
      ip: req.ip
    };

    this.logger.http(httpInfo, this.formatMetadata(meta));
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, this.formatMetadata(meta));
  }

  /**
   * Create a child logger with preset metadata
   * @param {Object} defaultMeta - Default metadata for child logger
   * @returns {Object} Child logger instance
   */
  child(defaultMeta = {}) {
    return {
      error: (message, meta = {}) => this.error(message, { ...defaultMeta, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { ...defaultMeta, ...meta }),
      info: (message, meta = {}) => this.info(message, { ...defaultMeta, ...meta }),
      http: (req, res, meta = {}) => this.http(req, res, { ...defaultMeta, ...meta }),
      debug: (message, meta = {}) => this.debug(message, { ...defaultMeta, ...meta })
    };
  }

  /**
   * Stream for Morgan HTTP logger
   */
  get morganStream() {
    return {
      write: (message) => {
        this.logger.http(message.trim());
      }
    };
  }
}

// Create singleton instance
const logger = new Logger();

// Export instance and class
module.exports = {
  logger,
  Logger
};
