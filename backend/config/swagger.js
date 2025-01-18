const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load Swagger document
const swaggerDocument = YAML.load(
  path.join(__dirname, '../docs/swagger.yaml')
);

// Configure Swagger UI options
const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "e-Prabandhan API Documentation",
  customfavIcon: "/assets/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerDocument, options)
};
