var keygen = require('keygenerator');
var mongoose = require('mongoose');

require('../models/auth_token.js');
var AuthToken = mongoose.model('AuthToken');

module.exports.login = function(req, res) {
  var token = keygen.session_id();
  var auth_token = new AuthToken({
    token: token,
    expiry: new Date(),
    user_type: 'merchant',
    merchant: req.user._id,
  });

  auth_token.save(function(err) {
    if (!err) {
      res.send(200, {
        'status': 'success',
        'message': 'Login successful',
        'info': token
      });
    } else {
      res.send(400, {
        'status': 'error',
        'message': 'couldnt generate auth token'
      });
    }
  });
};
