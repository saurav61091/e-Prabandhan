const AuditLog = require('../models/AuditLog');

const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    const oldSend = res.send;
    res.send = async function (data) {
      try {
        // Get the response body
        const body = JSON.parse(data);

        // Create audit log entry
        await AuditLog.create({
          userId: req.user?.id,
          action,
          entityType,
          entityId: body.id || req.params.id,
          oldValues: req.method !== 'POST' ? req.body : null,
          newValues: req.method !== 'DELETE' ? body : null,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });

        // Call the original send function
        oldSend.apply(res, arguments);
      } catch (error) {
        console.error('Error creating audit log:', error);
        // Continue with the response even if logging fails
        oldSend.apply(res, arguments);
      }
    };
    next();
  };
};

// Middleware to log all requests
const requestLogger = async (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Capture response
  const oldSend = res.send;
  res.send = function (data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log response
    console.log(`[${new Date().toISOString()}] Response sent in ${duration}ms`);
    
    // Call original send
    oldSend.apply(res, arguments);
  };
  
  next();
};

module.exports = {
  auditLogger,
  requestLogger
};
