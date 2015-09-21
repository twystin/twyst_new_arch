var db = db.getSiblingDB('twyst');
var retwyst = db.getSiblingDB('retwyst');
var cursor = db.vouchers.find();
while(cursor.hasNext()) {
  a = cursor.next();
  retwyst.users.update({_id:a.issue_details.issued_to},{
    $push: {
      coupons: {
        _id: a._id,
        code: a.basics.code,
        issued_by: a.issue_details.issued_at,
        coupon_source: a.basics.gen_type,
        header: a.basics.description,
        coupon_group: new ObjectId(),
        line1: "",
        line2: "",
        terms: a.terms,
        coupon_valid_days: a.validity.number_of_days,
        expiry: a.validity.end_date,
        meta: a.issue_details,
        reward: a.reward,
        used_details: {
          used_time: a.used_details && a.used_details.used_time,
          used_by: a.used_details && a.used_details.used_by,
          used_at: a.used_details && a.used_details.used_at,
          used_phone: a.redemption_phone_number
        },
        status: a.basics.status,
        issued_at: a.issue_details.issue_date
      }
    }
  }, {
    multi: true
  });
}
