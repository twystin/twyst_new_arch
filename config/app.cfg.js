'use strict';
/*jslint node: true */

var express = require('express'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  morgan = require('morgan'),
  cookieParser = require('cookie-parser'),
  compression = require('compression'),
  session = require('express-session'),
  favicon = require('serve-favicon'),
  errorhandler = require('errorhandler'),
  multer = require('multer'),
  MongoStore = require('connect-mongo')(session),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  logger = require('tracer').colorConsole();


var redis = require('../common/cache.hlpr');

var Account = require('../models/account.mdl');

var settings = require('./settings');
var env_config = settings.values.config[settings.values.env];
var session_store = new MongoStore({
  url: env_config.db_uri,
  clear_interval: env_config.clear_interval
});

var mustBe = require('mustbe');
var mustBeConfig = require('./mustbe.cfg');
mustBe.configure(mustBeConfig);

module.exports = function(app) {
  app.use(compression());
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(multer());
  app.use(cookieParser('Twyst_Sessions'));
  app.use(session({
    secret: "Twyst_Sessions",
    cookie: {
      maxAge: 31536000000
    },
    store: session_store,
    resave: true,
    saveUninitialized: true
  }));
  app.use(methodOverride());

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(__dirname + '/../www/'));

  // app.use(favicon(__dirname + '/../../Twyst-Web-Apps/common/images/favicon/twyst.ico'));
  app.all("/api/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, HEAD, DELETE, OPTIONS");
    return next();
  });

  // User login
  passport.use('account', new LocalStrategy(Account.authenticate()));
  passport.serializeUser(Account.serializeUser());
  passport.deserializeUser(Account.deserializeUser());

  app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
  }));
  mongoose.connect(env_config.db_uri);

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', function() {
    logger.info('Mongoose default connection open to: ' + env_config.server);
  });

  // If the connection throws an error
  mongoose.connection.on('error', function(err) {
    logger.error('Mongoose default connection error: ' + err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', function() {
    logger.warn('Mongoose default connection disconnected');
  });

  redis.on('ready', function() {
    logger.info('REDIS is ready');
  });

  redis.on('error', function(err) {
    logger.error('Error from REDIS - ' + err);
  });

  redis.on('end', function() {
    logger.warn('Could not connect to REDIS - ending!');
    process.exit(1);
  });

  redis.flushall(function(err) {
    if (!err) {
      logger.info('Cleared the cache');
    }
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function() {
    mongoose.connection.close(function() {
      logger.info('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
};
