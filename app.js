var settings = require('./config/settings');
(function () {
  'use strict';
  var express = require('express');
  var app = express();

  // CONFIGURE THE APP & THE DATA MODELS
  require('./config/config_app')(app);
  require('./config/config_models')();


  // ROUTES SERVED BY RESTIFY
  var restify = require('express-restify-mongoose');
  var Outlet = require('./models/outlet');
  var Merchant = require('./models/merchant');
  var Customer = require('./models/customer');

  var router = express.Router();
  restify.serve(router, Outlet);
  restify.serve(router, Merchant);
  restify.serve(router, Customer);

  app.use(router);

  // CUSTOM ROUTES
  require('./config/config_routes')(app);

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
