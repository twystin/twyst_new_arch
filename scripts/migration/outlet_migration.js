var db = db.getSiblingDB('twyst');
var cursor = db.outlets.find();
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  o = cursor.next();
  retwyst.outlets.insert({
    _id: o._id,
    basics: {
      name: o.basics.name,
      slug: o.basics.slug,
      is_a: o.basics.is_a,
      icon: o.basics.icon,
      main_type: 'fnb',
      created_at: o.basics.created_at,
      modified_at: o.basics.modified_at
    },
    contact: o.contact,
    links: {
      public_url: o.publicUrl,
      short_url: o.shortUrl,
      website_url: o.website_url,
      facebook_url: o.facebook_url,
      twitter_url: o.twitter_url,
      youtube_url: o.youtube_url,
      zomato_url: o.zomato_url,
      foodpanda_url: o.foodpanda_url,
      other_urls: o.other_urls
    },
    business_hours: o.business_hours,
    attributes: o.attributes,
    photos: o.photos,
    outlet_meta: o.outlet_meta,
    twyst_meta: o.twyst_meta,
    sms_off: o.sms_off
  });
}
