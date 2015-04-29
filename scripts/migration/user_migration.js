var db = db.getSiblingDB('twyst');
var cursor = db.accounts.find({role:{$in:[6,7]}});
var retwyst = db.getSiblingDB('retwyst')
while(cursor.hasNext()) {
  a = cursor.next();
  retwyst.customers.insert({
    _id: a._id,
    username: a.username,
    salt: a.salt,
    hash: a.hash,
    phone: a.phone,
    first_name: a.profile && a.profile.first_name || null,
    middle_name: a.profile && a.profile.middle_name,
    last_name: a.profile && a.profile.last_name,
    email: a.profile && a.profile.email,
    bday: a.profile && a.profile.bday,
    anniv: a.profile && a.profile.anniv,
    gcm: a.gcm,
    validation: {
      otp: a.otp_validated,

    },
    blacklisted: a.blacklisted,
    created_at: a.created_at
  });
}
