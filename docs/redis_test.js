var redis = require("redis"),
  client = redis.createClient();

client.on("error", function(err) {
  console.log("Error " + err);
});

var deep_nexted_obj = {
  person: {
    name: {
      first: "Arun",
      last: "Rajappa"
    },
    likes: [{sport: 'cricket'}, {hobby: 'painting'}]
  },
  father: {
    name: {
      first: "Ramamurthi",
      last: "Rajappa"
    }
  }
};

client.set('person', JSON.stringify(deep_nexted_obj), redis.print);
client.get('person', function(err, reply) {
    var person = JSON.parse(reply);
    person.person.likes[0].sport = "football";
    console.log(person.person.likes);
});

client.get('person', function(err, reply) {
    var person = JSON.parse(reply);
    console.log(person.person.likes);
    client.quit();
});
