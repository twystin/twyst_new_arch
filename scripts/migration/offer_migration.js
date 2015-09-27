var db = db.getSiblingDB('twyst');
var program_cursor = db.programs.find({status:'active'});
var tier_cursor = null;
var offer_cursor = null;
var ti, oi = 0;
var p,t,o, k = null;

var retwyst = db.getSiblingDB('retwyst')
while(program_cursor.hasNext()) {
  ti = 0;
  p = program_cursor.next();
  while(ti < p.tiers.length) {
    tier_cursor = db.tiers.find({_id:p.tiers[ti]});
    while(tier_cursor.hasNext()) {
      oi = 0;
      t = tier_cursor.next();
      while(oi < t.offers.length) {
        offer_cursor = db.offers.find({_id: t.offers[oi]});
        while(offer_cursor.hasNext()) {
          o = offer_cursor.next();
          k = retwyst.outlets.find({_id: {$in: p.outlets}});
          printjson(p._id)
          printjson(o._id)
          printjson(p.validity.earn_start)
          retwyst.outlets.update({'offers._id': o._id},{
            $set: {'offers.$.offer_start_date': p.validity.earn_start}
          },
          {multi: true}
          )
        }
        oi++;
      }
    }
    ti++;
  }
}
