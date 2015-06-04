var db = db.getSiblingDB('twyst');
var cursor = db.favourites.find();
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  f = cursor.next();
  retwyst.events.insert({
    event_type: 'favourite',
    event_date: f.created_date,
    event_user: f.account,
    event_outlet: f.outlets,
    event_meta: {
      program: f.program,
      tier: f.tier,
      offer: f.offers
    }
  });
}
