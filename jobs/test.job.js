var logger = require('tracer').colorConsole();
var transporter = require('../transports/transporter.js');
exports.runner = function(agenda) {
  agenda.define('test', function(job, done) {
    logger.log("Test message.");
    // transporter.send('email', 'gmail', {
    //     from: 'Arun Rajappa ✔ ar@twyst.in', // sender address
    //     to: 'ar@twyst.in', // list of receivers
    //     subject: 'Daily analytics report for',
    //     text: 'Analytics report.', // plaintext body
    //     html: '<b>Analytics report.</b>'
    //   });
    
    done();
  });
}
