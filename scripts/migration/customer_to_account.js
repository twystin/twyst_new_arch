// Separate the customer and account collections
// After this run
// db.customers.update({},{$unset:{"username":"", "hash":"","salt":""}}, {multi:true})

var db = db.getSiblingDB('retwyst');
var cursor = db.customers.find();
while(cursor.hasNext()) {
  c = cursor.next();
  db.accounts.insert({
      username: c.username,
      hash: c.hash,
      salt: c.salt,
      phone: c.phone,
      created_at: c.created_at,
      customer: c._id
  });
}
