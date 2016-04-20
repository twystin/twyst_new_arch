var settings = require('./config/settings');
var logger = require('tracer').colorConsole();

(function() {
  'use strict';
  var express = require('express');
  var app = express();
  var compression = require('compression');
  var faye = require('faye');
  var http = require('http');
  var Bayeux = module.exports;
  var Server = module.exports;

  var bayeux = Bayeux.bayeux = new faye.NodeAdapter({
    mount:    '/faye',
    timeout:  100
  });
  bayeux.on('handshake', function(clientId) {
    console.log( 'new client ' + clientId);
  })
  var server = Server.server = http.createServer(app);

  bayeux.attach(server);


  app.use(compression());
  // CONFIGURE THE APP & THE DATA MODELS
  require('./config/app.cfg')(app);
  require('./config/models.cfg')();
  require('./config/routes.cfg')(app);
  require('./config/cache.cfg').populate();

  // START THE SERVER
  logger.info('STARTING THE TWYST SERVER');
  logger.info('Environment:' + settings.values.env);
  logger.info('URL:' + settings.values.config[settings.values.env].server);
  logger.info('Port:' + settings.values.config[settings.values.env].port);
  server.listen(settings.values.config[settings.values.env].port);
  logger.info('Started the server');
  process.on('uncaughtException', function(error) {
    logger.info(error.stack);
    logger.info(error);
  });

})();
