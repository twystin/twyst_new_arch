var db = db.getSiblingDB('twyst');
var cursor = db.winbacks.find();
var retwyst = db.getSiblingDB('retwyst')
while(cursor.hasNext()) {
  w = cursor.next();
  retwyst.outlets.update({_id:{$in:w.outlets}},{
    $push: {
      jobs: {
        status: w.status,
        job_name:'winback',
        job_parameters: {
          min: w.min_historical_checkins,
          weeks: w.weeks_since_last_visit,
        },
        reward: {
          terms: w.terms,
          expiry: w.validity.earn_end,
          reward_meta: w.reward // the structured rewards
        }
      }
    }
  }, {
    multi: true
  });
}
