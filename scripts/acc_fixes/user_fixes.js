var db = db.getSiblingDB('retwyst_dummy');
var cursor = db.users.find({role: 3});
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  a = cursor.next();
  user = retwyst.users.find({'_id': a._id});
  if(!user) {
    printjson('inserted');
    retwyst.users.insert(a); 
  }
  
}
