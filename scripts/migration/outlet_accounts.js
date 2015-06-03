var db = db.getSiblingDB('retwyst');
var cursor = db.outlets.find();
while(cursor.hasNext()) {
  c = cursor.next();
  var accounts = c.outlet_meta.accounts || [];
  var ai = 0;
  for (ai = 0; ai < accounts.length; ai++) {
    db.users.update(
      {_id : accounts[ai]},
      {$push: {
        outlets: c._id
      }},
      {
        multi: true
      }
    );
  }
}
