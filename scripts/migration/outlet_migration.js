var db = db.getSiblingDB('twyst');
var cursor = db.outlets.find();
var retwyst = db.getSiblingDB('retwyst')
while(cursor.hasNext()) {
  o = cursor.next();
  retwyst.outlets.insert({
    _id: o._id,
    name: o.basics.name,
    is_a: o.basics.is_a,
    publicUrl: o.publicUrl,
    shortUrl: o.shortUrl,
    created_at: o.basics.created_at,
    modified_at: o.basics.modified_at,
    location: o.contact.location,
    phones: o.contact.phones,
    emails: o.contact.emails,
    links: o.links,
    attributes: o.attributes,
    hours: o.business_hours,
    photos: o.photos
  });
}
