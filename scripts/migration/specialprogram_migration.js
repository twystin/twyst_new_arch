var db = db.getSiblingDB('twyst');
var program_cursor = db.specialprograms.find({status:'active'});

var retwyst = db.getSiblingDB('retwyst');
while(program_cursor.hasNext()) {
  p = program_cursor.next();
  retwyst.outlets.update({_id: {$in: p.outlets}},{
    $push: {
      offers: {
        _id: new ObjectId(),
        offer_status: p.status,
        offer_type: p.types.birth?'birthday':'anniversary',
        offer_group: p.name,
        actions: {
          reward: {
            _id: new ObjectId(),
            title: p.name,
            terms: p.ranges[0].terms,
            detail: p.desc,
            reward_meta: p.ranges[0].reward
          }
        },
        rule: {
          _id: new ObjectId(),
          event_type: p.types.birth?'birthday':'anniversary',
          event_count: p.ranges[0].count_from,
          event_match: 'after'
        }
      }
    },
  },{
    multi: true
  });
}
