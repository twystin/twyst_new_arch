'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var models = ['account.mdl', 'auth_token.mdl', 'event.mdl', 'outlet.mdl', 'user.mdl'];
  var model = '';
  models.forEach(function(m) {
    model = require('../models/' + m);
  });
};
