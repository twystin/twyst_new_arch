var db = db.getSiblingDB('twyst');
var cursor = db.checkins.find();
var retwyst = db.getSiblingDB('retwyst')
while(cursor.hasNext()) {
  c = cursor.next();
  retwyst.customers.update({phone:c.phone},{
    $push: {
      events: {
        event_type: 'checkin',
        outlet: c.outlet,
        event_date: c.created_date,
        source: c.checkin_type
      }
    }
  }, {
    multi: true
  });
}
