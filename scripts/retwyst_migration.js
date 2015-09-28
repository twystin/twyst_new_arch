var db = db.getSiblingDB('retwyst_dummy');
var cursor = db.outlets.find();
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  o = cursor.next();
  printjson(o)
  retwyst.outlets.insert(o)
    
}
