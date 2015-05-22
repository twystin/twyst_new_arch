var db = db.getSiblingDB('twyst');
var cursor = db.accounts.find();
var retwyst = db.getSiblingDB('retwyst')
while(cursor.hasNext()) {
  a = cursor.next();
  retwyst.users.insert({
    _id: a._id,
    username: a.username,
    salt: a.salt,
    hash: a.hash,
    role: a.role,
    phone: a.phone,
    company_name: a.company_name,
    contact_person: a.contact_person,
    website: a.website,
    facebook_url: a.facebook_url,
    twitter_url: a.twitter_url,
    reset_password_token: a.reset_password_token,
    remember: a.remember,
    gcm: a.gcm,
    first_name: a.profile && a.profile.first_name || a.name || null,
    middle_name: a.profile && a.profile.middle_name,
    last_name: a.profile && a.profile.last_name,
    email: a.email || a.profile && a.profile.email,
    validation: {
      otp: a.otp_validated
    },
    blacklisted: a.blacklisted,
    created_at: a.created_at
  });
}
