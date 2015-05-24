'use strict';
/*jslint node: true */

module.exports.response = function(o) {
  if (!o.error) {
    o.response.status(200).send({
      'response': true,
      'message': o.success_message,
      'data': o.success_data
    });
  } else {
    o.response.status(200).send({
      'response': false,
      'message': o.error_message,
      'data': o.error_data
    });
  }
};

module.exports.error = function(res, err, msg) {
  res.status(200).send({
    'response': false,
    'message': msg,
    'data': err
  });
};


module.exports.success = function(res, data, msg) {
  res.status(200).send({
    'response': true,
    'message': msg,
    'data': data
  });
};
