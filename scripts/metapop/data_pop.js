var db = db.getSiblingDB('retwyst');
// First update
db.outlets.update(
  {'_id': ObjectId('540ea3d32f61834b5170eb10')},
  {
    $set: {
      'basics.featured': true
    },
    $push: {
      offers: {
        offer_status: 'active',
        offer_type: 'checkin',
        offer_group: 'test_offer',
        actions: {
          reward: {
            title: 'Rs. 200 off',
            terms: 'on a min spend of Rs. 800',
            detail: null,
            expiry: '8/31/2015',
            reward_hours: null,
            applicability: null,
            valid_days: null,
            reward_meta: {
              reward_type: 'flatoff'
            },
            header: 'Rs. 200 off',
            line1: 'on a min spend of Rs. 800',
            line2: 'weekdays only'
          }
        },
        rule: {
          event_type: 'checkin',
          event_count: 2,
          event_match: 'every'
        }
      }
    }
  }
);
// Second update
db.outlets.update(
  {'_id': ObjectId('540ea3d32f61834b5170eb10')},
  {
    $set: {
      'basics.featured': true
    },
    $push: {
      offers: {
        offer_status: 'active',
        offer_type: 'checkin',
        offer_group: 'test_offer',
        actions: {
          reward: {
            title: 'Rs. 200 off',
            terms: 'on a min spend of Rs. 800',
            detail: null,
            expiry: '8/31/2015',
            reward_hours: null,
            applicability: null,
            valid_days: null,
            reward_meta: {
              reward_type: 'flatoff'
            },
            header: 'Rs. 200 off',
            line1: 'on a min spend of Rs. 800',
            line2: 'weekdays only'
          }
        },
        rule: {
          event_type: 'checkin',
          event_count: 2,
          event_match: 'every'
        }
      }
    }
  }
);
