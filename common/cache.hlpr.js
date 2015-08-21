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

module.exports = redis;
