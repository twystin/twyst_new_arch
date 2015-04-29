var db = db.getSiblingDB('twyst');
var program_cursor = db.programs.find({status:'active'});
var tier_cursor = null;
var offer_cursor = null;
var ti, oi = 0;
var p,t,o = null;

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
          retwyst.outlets.update({_id: {$in: p.outlets}},{
            $push: {
              rules: {
                status: p.status,
                program: p.name,
                reward: {
                  title: o.basics.title,
                  detail: o.basics.description,
                  reward_meta: o.reward
                },
                events: {
                  event_type: 'checkin',
                  criteria: o.user_eligibility.criteria
                }
              }
            },
          },{
            multi: true
          });
        }
        oi++;
      }
    }
    ti++;
  }
}
