var db = db.getSiblingDB('twyst');
var cursor = db.accounts.find({role:{$in:[1,2,3,4,5]}});
var retwyst = db.getSiblingDB('retwyst')
while(cursor.hasNext()) {
  a = cursor.next();
  retwyst.merchants.insert({
    _id: a._id,
    username: a.username,
    name: a.name,
    salt: a.salt,
    hash: a.hash,
    role: a.role,
    email: a.email,
    contact: a.contact_person,
    phone: a.phone,
    created_at: a.created_at
  });
}
