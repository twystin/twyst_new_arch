var db = db.getSiblingDB('twyst');
var cursor = db.accounts.find();
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  a = cursor.next();
  a.user_acquisition_source = 'migrated';
  retwyst.users.insert(a);
}
