var db = db.getSiblingDB('twyst');
var program_cursor = db.winbacks.find({status:'active'});

var retwyst = db.getSiblingDB('retwyst');
while(program_cursor.hasNext()) {
  p = program_cursor.next();
  retwyst.outlets.update({_id: {$in: p.outlets}},{
    $push: {
      offers: {
        offer_status: p.status,
        offer_type: 'winback',
        offer_group: p.name,
        offer_start_date: p.validity.earn_start,
        offer_end_date: p.validity.earn_end,
        actions: {
          reward: {
            title: p.name,
            terms: p.terms,
            detail: p.name,
            reward_meta: p.reward
          },
          message: {
            sms: p.messages && p.messages.sms,
            email: p.messages && p.messages.email,
            push: p.messages && p.messages.push
          }
        },
        rule: {
          event_type: 'winback',
          event_count: p.min_historical_checkins,
          event_match: 'after',
          event_params: {
            min_historical_checkins: p.min_historical_checkins,
            date_since_last_visit: p.date_since_last_visit
          }
        }
      }
    },
  },{
    multi: true
  });
}
