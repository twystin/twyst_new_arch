var db = db.getSiblingDB('twyst');
var deal_cursor = db.deals.find();
var retwyst = db.getSiblingDB('retwyst');
while(deal_cursor.hasNext()) {
  d = deal_cursor.next();
  retwyst.outlets.update({_id: {$in: d.outlets}},{
    $push: {
      offers: {
        _id: new ObjectId(),
        offer_status: d.status,
        offer_type: 'deal',
        offer_group: 'deal',
        offer_start_date: d.start_date,
        offer_end_date: d.end_date,
        actions: {
          reward: {
            title: d.detail,
            terms: d.tc,
            detail: d.info,
            reward_meta: d.avaiable_at
          }
        },
        rule: {
          event_type: 'deal',
        }
      }
    },
  },{
    multi: true
  });
}
