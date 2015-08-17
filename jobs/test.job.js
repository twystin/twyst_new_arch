exports.runner = function(agenda) {
  agenda.define('test', function(job, done) {
    console.log("Test message.");
    done();
  });
}
