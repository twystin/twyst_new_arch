var db = db.getSiblingDB('twyst');
var cursor = db.outlets.find();
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
	outlet = cursor.next();
  if(outlet.sms_off && outlet.sms_off.value) {
      var start_hr = outlet.sms_off.time.start/60;
      var end_hr = outlet.sms_off.time.end/60;
      print(outlet._id)
      print(end_hr)
      retwyst.outlets.update({
        _id: outlet._id
      }, {
        $set: {
          sms: { time: {'start.hr': start_hr}},
          sms: { time: {'start.min': 0}},
          sms: { time: {'end.hr': end_hr}},
          sms: { time: {'end.min': 0}},
        }
      }, {upsert: true})
    }
}
