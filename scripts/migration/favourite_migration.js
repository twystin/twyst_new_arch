var db = db.getSiblingDB('twyst');
var cursor = db.favourites.find();
var retwyst = db.getSiblingDB('retwyst')
while(cursor.hasNext()) {
  f = cursor.next();
  retwyst.customers.update({_id:f.account},{
    $push: {
      events: {
        event_type: 'favourite',
        outlet: f.outlets,
        event_date: f.created_date
      }
    }
  }, {
    multi: true
  });
}
