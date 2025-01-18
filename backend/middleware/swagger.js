const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');

// Configure Swagger UI options
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'e-Prabandhan API Documentation',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  swaggerUi,
  swaggerDocument,
  swaggerOptions
};
