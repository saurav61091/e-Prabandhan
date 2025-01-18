const path = require('path');
const fs = require('fs').promises;
const { logger, Logger } = require('../../utils/logger');

// Mock winston
jest.mock('winston', () => {
  const mockFormat = {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    splat: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn()
  };

  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn()
  };

  return {
    format: mockFormat,
    createLogger: jest.fn(() => mockLogger),
    transports: {
      Console: jest.fn()
    },
    addColors: jest.fn()
  };
});

// Mock winston-daily-rotate-file
jest.mock('winston-daily-rotate-file', () => {
  return jest.fn();
});

describe('Logger', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create logger with correct configuration', () => {
      const newLogger = new Logger();
      expect(newLogger.logger).toBeDefined();
    });
  });

  describe('error logging', () => {
    it('should log error message', () => {
      const message = 'Test error message';
      logger.error(message);
      expect(logger.logger.error).toHaveBeenCalled();
    });

    it('should log error object with stack trace', () => {
      const error = new Error('Test error');
      logger.error(error);
      expect(logger.logger.error).toHaveBeenCalled();
      const [loggedError] = logger.logger.error.mock.calls[0];
      expect(loggedError.stack).toBeDefined();
    });
  });

  describe('warning logging', () => {
    it('should log warning message', () => {
      const message = 'Test warning message';
      logger.warn(message);
      expect(logger.logger.warn).toHaveBeenCalled();
    });

    it('should include metadata in warning log', () => {
      const message = 'Test warning message';
      const meta = { source: 'test' };
      logger.warn(message, meta);
      expect(logger.logger.warn).toHaveBeenCalled();
    });
  });

  describe('info logging', () => {
    it('should log info message', () => {
      const message = 'Test info message';
      logger.info(message);
      expect(logger.logger.info).toHaveBeenCalled();
    });

    it('should include metadata in info log', () => {
      const message = 'Test info message';
      const meta = { source: 'test' };
      logger.info(message, meta);
      expect(logger.logger.info).toHaveBeenCalled();
    });
  });

  describe('HTTP logging', () => {
    it('should log HTTP request', () => {
      const req = {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent')
      };
      const res = {
        statusCode: 200
      };
      const meta = { responseTime: 100 };

      logger.http(req, res, meta);
      expect(logger.logger.http).toHaveBeenCalled();
    });
  });

  describe('debug logging', () => {
    it('should log debug message', () => {
      const message = 'Test debug message';
      logger.debug(message);
      expect(logger.logger.debug).toHaveBeenCalled();
    });

    it('should include metadata in debug log', () => {
      const message = 'Test debug message';
      const meta = { source: 'test' };
      logger.debug(message, meta);
      expect(logger.logger.debug).toHaveBeenCalled();
    });
  });

  describe('child logger', () => {
    it('should create child logger with default metadata', () => {
      const defaultMeta = { service: 'test-service' };
      const childLogger = logger.child(defaultMeta);

      childLogger.info('Test message');
      expect(logger.logger.info).toHaveBeenCalled();
    });

    it('should merge child and call metadata', () => {
      const defaultMeta = { service: 'test-service' };
      const childLogger = logger.child(defaultMeta);
      const callMeta = { operation: 'test-op' };

      childLogger.info('Test message', callMeta);
      expect(logger.logger.info).toHaveBeenCalled();
    });
  });

  describe('morgan stream', () => {
    it('should provide morgan stream that logs to http level', () => {
      const message = 'Test HTTP log';
      logger.morganStream.write(message);
      expect(logger.logger.http).toHaveBeenCalledWith(message.trim());
    });
  });
});
