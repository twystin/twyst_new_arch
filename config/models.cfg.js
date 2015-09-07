'use strict';
/*jslint node: true */

module.exports = function() {
  var models = ['account.mdl', 'auth_token.mdl', 'auth_code.mdl', 'event.mdl', 'outlet.mdl', 'user.mdl', 'qr_code.mdl', 'friend.mdl.js', 'notification.mdl.js'];
  var model = '';
  models.forEach(function(m) {
    model = require('../models/' + m);
  });
};
