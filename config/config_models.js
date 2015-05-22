'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var models = ['outlet', 'user'];
  var model = '';
  models.forEach(function(m) {
    model = require('../models/' + m);
  });
};
