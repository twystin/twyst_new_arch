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

var retwyst = db.getSiblingDB('retwyst');
retwyst.users.update({},{$unset:{"username":"", "hash":"","salt":"", role: ""}}, {multi:true});
