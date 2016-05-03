var HttpHelper = require('../common/http.hlpr');
var BulkSMSHelper = require('./helpers/bulk_sms.hlpr');
var logger = require('tracer').colorConsole();

var getNumbersFromFile = function(filename, callback) {
  var phone_numbers = [];
  csv()
    .from
    .stream(fs.createReadStream(file_name, {encoding: 'utf-8'}))
    .on('record', function(row, index){
      phone_numbers.push(row[0]);
    })
    .on('end', function(count){
      callback(phone_numbers);
    });
};

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
