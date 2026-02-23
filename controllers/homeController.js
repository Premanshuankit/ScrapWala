const logger = require('../utils/logger');

const handleHome = (req, res) => {
  try {
    logger.info({
      route: "home",
      method: req.method,
      message: "Home route accessed"
    });

    res.status(200).json({
      success: true,
      message: "Backend working",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error({
      route: "home",
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports = { handleHome };