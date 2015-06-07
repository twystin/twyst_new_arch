var db = db.getSiblingDB('retwyst');
var cursor = db.users.find({'coupons.used_details.used_at': {$ne: null}},{'coupons.used_details.used_at':1});
while(cursor.hasNext()) {
  c = cursor.next();
  for (var i = 0; i < c.coupons.length; i++) {
    db.outlets.update(
      {_id: c.coupons[i].used_details.used_at},
      {$inc: {'analytics.coupon_analytics.coupons_redeemed':1}},
      {$multi: true}
    );
  }

}
