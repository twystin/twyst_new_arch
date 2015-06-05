var db = db.getSiblingDB('twyst');
var cursor = db.feedbacks.find();
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  f = cursor.next();
  retwyst.events.insert({
    event_type: 'feedback',
    event_date: f.created_date,
    event_user: f.account,
    event_outlet: f.outlet,
    event_meta: f.feedback
  });
}
