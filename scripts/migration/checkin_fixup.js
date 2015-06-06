var db = db.getSiblingDB('retwyst');
var cursor = db.events.find({event_type:'checkin', event_user: null});
while(cursor.hasNext()) {
  c = cursor.next();
  var phone = c.event_meta.phone;
  var u = db.users.findOne({'phone':c.event_meta.phone});
  db.events.update(
    {'event_meta.phone': phone},
    { $set: { event_user: u._id }},
    {multi: true});
}
