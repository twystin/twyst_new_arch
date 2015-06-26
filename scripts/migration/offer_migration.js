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
              offers: {
                offer_status: p.status,
                offer_type: 'checkin',
                offer_group: p.name,
                actions: {
                  reward: {
                    header: o.basics.title,
                    line1: o.basics.description,
                    line2: o.terms,
                    expiry: p.validity.earn_end,
                    reward_hours: o.avail_hours,
                    applicability: o.reward_applicability,
                    valid_days: o.valid_days,
                    reward_meta: {
                      reward_type: Object.keys(o.reward)[0],
                      reward_info: o.reward
                    }
                  }
                },
                rule: {
                  event_type: 'checkin',
                  event_count: o.user_eligibility.criteria.value,
                  event_match: o.user_eligibility.criteria.condition
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
