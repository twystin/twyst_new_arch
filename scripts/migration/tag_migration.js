var db = db.getSiblingDB('twyst');
var cursor = db.tags.find();
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  c = cursor.next();
  for (var i = 0; i < c.offers.length; i++) {
    retwyst.outlets.update(
      {_id: c.outlets[i]},
      {$addToSet: {'attributes.tags': c.name}}
    );
  }
}
