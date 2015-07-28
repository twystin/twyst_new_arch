// NOTE
// Can use ioredis or node=redis.

// var redis = require("redis");
// var client = redis.createClient();
//
// client.on("error", function(err) {
//   console.log("Error " + err);
// });
//
// module.exports = client;

var Redis = require('ioredis');
var logger = require('tracer').colorConsole();

var redis = new Redis({
  showFriendlyErrorStack: true,
  retryStrategy: function (times) {
  	logger.warn("REDIS is down - trying to reconnect");
    var delay = Math.min(times * 2, 2000);
    return delay;
  }
});

redis.on('ready', function() {
  logger.info('REDIS is ready');
});

redis.on('error', function(err) {
  logger.error('Error from REDIS - ' + err);
});

redis.on('end', function() {
  logger.warn('Could not connect to REDIS - ending!');
  process.exit(1);
});

redis.flushall(); // This removes everything from the cache on a server start -- good idea?
module.exports = redis;
