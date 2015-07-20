var db = db.getSiblingDB('twyst');
var cursor = db.checkins.find();
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  c = cursor.next();
  retwyst.events.insert({
    _id: new ObjectId(),
    event_type: 'checkin',
    event_date: c.created_date,
    event_outlet: c.outlet,
    event_meta: {
      phone: c.phone,
      checkin_program: c.checkin_program,
      checkin_tier: c.checkin_tier,
      checkin_for: c.checkin_for,
      checkin_validated: c.checkin_validated,
      checkin_code: c.checkin_code,
      checkin_type: c.checkin_type,
      location: c.location,
      checkin_location: c.checkin_location
    }
  });
}
