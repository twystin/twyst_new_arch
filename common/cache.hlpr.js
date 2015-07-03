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
var redis = new Redis();
redis.flushall(); // This removes everything from the cache on a server start -- good idea?
module.exports = redis;
