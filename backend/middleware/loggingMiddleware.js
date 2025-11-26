const { logApiRequest, logError } = require('../services/activityLogger');

/**
 * Middleware to log all API requests
 */
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Capture the original res.json and res.send methods
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function (data) {
    const duration = Date.now() - startTime;
    logApiRequest(req, res, duration);
    return originalJson.call(this, data);
  };

  res.send = function (data) {
    const duration = Date.now() - startTime;
    logApiRequest(req, res, duration);
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware to log errors
 */
const errorLoggingMiddleware = (err, req, res, next) => {
  logError(err, req, {
    action: `${req.method} ${req.path}`,
    endpoint: req.path,
  });

  next(err);
};

module.exports = {
  requestLoggingMiddleware,
  errorLoggingMiddleware,
};
