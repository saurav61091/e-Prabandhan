const validateDatabaseConfig = (config) => {
  const requiredFields = ['host', 'port', 'username', 'password', 'database'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      return `Missing required field: ${field}`;
    }
  }

  // Validate port number
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    return 'Invalid port number';
  }

  // Validate database name format
  if (!/^[a-zA-Z0-9_]+$/.test(config.database)) {
    return 'Invalid database name format';
  }

  return null;
};

const validateSMTPConfig = (config) => {
  const requiredFields = ['host', 'port', 'username', 'password', 'fromEmail'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      return `Missing required field: ${field}`;
    }
  }

  // Validate port number
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    return 'Invalid port number';
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.fromEmail)) {
    return 'Invalid email format';
  }

  return null;
};

const validateOrganizationConfig = (config) => {
  const requiredFields = ['name', 'type', 'fiscalYearStart', 'fiscalYearEnd'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      return `Missing required field: ${field}`;
    }
  }

  // Validate fiscal year dates
  const dateRegex = /^\d{2}-\d{2}$/; // MM-DD format
  if (!dateRegex.test(config.fiscalYearStart) || !dateRegex.test(config.fiscalYearEnd)) {
    return 'Invalid fiscal year date format (use MM-DD)';
  }

  return null;
};

module.exports = {
  validateDatabaseConfig,
  validateSMTPConfig,
  validateOrganizationConfig,
};
