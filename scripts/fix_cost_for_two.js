db.outlets.find({}).forEach(
  function(outlet) {
    if(outlet.offers && outlet.offers.length) {
      for(var i = 0; i< outlet.offers.length; i++){
        var offer_id = outlet.offers[i]._id;
        print(offer_id)
        db.outlets.update({
            'offers._id': offer_id
          }, {
            $set: {
              //'offers.$.offer_valid_days': outlet.offers[i].actions.reward.offer_valid_days
                'offers.$.offer_end_date': outlet.offers[i].actions.reward.expiry
            }
          }, {multi: true})  
      }
      
    }
    print('p')
    
  }
)



