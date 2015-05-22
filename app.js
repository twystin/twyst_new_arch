var settings = require('./config/settings');
(function () {
  'use strict';
  var express = require('express');
  var app = express();

  // CONFIGURE THE APP & THE DATA MODELS
  require('./config/app.cfg')(app);
  require('./config/models.cfg')();


  // ROUTES SERVED BY RESTIFY
  // var restify = require('express-restify-mongoose');
  // var Outlet = require('./models/outlet');
  //
  // var router = express.Router();
  // restify.serve(router, Outlet);
  //
  // app.use(router);

  // CUSTOM ROUTES
  require('./config/routes.cfg')(app);

  // START THE SERVER
  console.log('STARTING THE TWYST SERVER');
  console.log('-------------------------');
  console.log('Environment:' + settings.values.env);
  console.log('URL:' + settings.values.config[settings.values.env].server);
  console.log('Port:' + settings.values.config[settings.values.env].port);
  app.listen(settings.values.config[settings.values.env].port);
  console.log('Started the server');
  process.on('uncaughtException', function (error) {
      console.log(error.stack);
      console.log(error);
  });

})();
