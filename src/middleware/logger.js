const logger = require("../utils/logger.js");

const addLogger = (req, res, next) => {
  req.logger = logger;
  req.logger.http(
    `${req.method} na ${req.url} - ${new Date().toLocaleDateString()}`
  );
  next();
};

module.exports = addLogger;
