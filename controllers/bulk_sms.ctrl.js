var HttpHelper = require('../common/http.hlpr');
var BulkSMSHelper = require('./helpers/bulk_sms.hlpr');
var logger = require('tracer').colorConsole();

module.exports.send = function(req, res) {
  logger.log();
  var token = req.query.token || null;
  if(!token) {
    HttpHelper.error(res, null, "Not Authenticated");
  }
  else{
    BulkSMSHelper.sendMessage(token, req.body)
      .then(function(data) {
          HttpHelper.success(res, data.data, data.message);
        }, function(err) {
          HttpHelper.error(res, err.err, err.message);
      });
  }

};
