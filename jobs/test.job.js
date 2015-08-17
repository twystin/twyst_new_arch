var logger = require('tracer').colorConsole();

exports.runner = function(agenda) {
  agenda.define('test', function(job, done) {
    logger.log("Test message.");
    done();
  });
}
