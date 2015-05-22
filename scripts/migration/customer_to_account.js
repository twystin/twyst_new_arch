// Separate the customer and account collections
// After this run
// db.customers.update({},{$unset:{"username":"", "hash":"","salt":""}}, {multi:true})

var db = db.getSiblingDB('retwyst');
var cursor = db.users.find();
while(cursor.hasNext()) {
  c = cursor.next();
  db.accounts.insert({
    _id: c._id,
    username: c.username,
    hash: c.hash,
    salt: c.salt,
    role: c.role,
    created_at: c.created_at,
    user: c._id
  });
}
