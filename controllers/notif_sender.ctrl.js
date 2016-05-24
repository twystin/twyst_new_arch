var HttpHelper = require('../common/http.hlpr');
var NotificationHelper = require('./helpers/notif_send.hlpr');
var logger = require('tracer').colorConsole();

module.exports.send = function(req, res) {
  logger.log();
  var token = req.query.token || null;
  if(!token) {
    HttpHelper.error(res, null, "Not Authenticated");
  }
  else{
    NotificationHelper.sendNotification(token, req.body).then(function(data) {
        HttpHelper.success(res, data.data, data.message);
    },  function(err) {
          HttpHelper.error(res, err.err, err.message);
    });
  }

};
