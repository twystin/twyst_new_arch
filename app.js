var settings = require('./config/settings');
var logger = require('tracer').colorConsole();

(function() {
  'use strict';
  var express = require('express');
  var app = express();

  // CONFIGURE THE APP & THE DATA MODELS
  require('./config/app.cfg')(app);
  require('./config/models.cfg')();
  require('./config/routes.cfg')(app);
  require('./config/cache.cfg').populate();
  require('./config/jobs.cfg').start(app);

  // START THE SERVER
  logger.info('STARTING THE TWYST SERVER');
  logger.info('Environment:' + settings.values.env);
  logger.info('URL:' + settings.values.config[settings.values.env].server);
  logger.info('Port:' + settings.values.config[settings.values.env].port);
  app.listen(settings.values.config[settings.values.env].port);
  logger.info('Started the server');
  process.on('uncaughtException', function(error) {
    logger.info(error.stack);
    logger.info(error);
  });

})();
