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
module.exports = redis;
