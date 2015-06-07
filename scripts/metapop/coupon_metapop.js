var db = db.getSiblingDB('retwyst');
var cursor = db.users.find({'coupons': {$ne: null}},{'coupons':1});
while(cursor.hasNext()) {
  c = cursor.next();
  for (var i = 0; i < c.coupons.length; i++) {
    for (var j = 0; j< c.coupons[i].outlets.length; j++) {
      db.outlets.update(
        {_id: c.coupons[i].outlets[j]},
        {$inc: {'analytics.coupon_analytics.coupons_generated':1}},
        {$multi: true}
      );
    }

  }

}
