var retwyst = db.getSiblingDB('retwyst');
var users_with_coupons = retwyst.users.find({});

while(users_with_coupons.hasNext()) {
    user = users_with_coupons.next();
    if(user.coupons && user.coupons.length) {
        for(var i = 0; i< user.coupons.length; i++){
            var offer_id = user.coupons[i].meta.issued_for;
            //print(offer_id)
            if(offer_id) {
              var outlet = retwyst.outlets.findOne({'offers._id': offer_id});
              
              //print.log(outlet)
                if(outlet && outlet.offers && outlet.offers.length){
                    for(var j = 0; j < outlet.offers.length; j++) {
                      //print(outlet.offers[j]._id)
                        if(outlet.offers[j]._id != undefined && offer_id != undefined) {
                            if(outlet.offers[j]._id.toString() === offer_id.toString()) {  
                                user.coupons[i].header =   outlet.offers[j].actions.reward.header;
                                user.coupons[i].line1 =   outlet.offers[j].actions.reward.line1;
                                user.coupons[i].line2 =   outlet.offers[j].actions.reward.line2;
                                user.coupons[i].description =   outlet.offers[j].actions.reward.description;
                                user.coupons[i].terms =   outlet.offers[j].actions.reward.terms;

                                user.coupons[i].issued_for = offer_id;
                                
                                user.coupons[i].meta.reward_type = {};
                                user.coupons[i].meta.reward_type.type = outlet.offers[j].actions.reward.reward_meta.reward_type;

                                print(user.coupons[0].header)
                                retwyst.users.save(user);
                              
                            }
                        }
                        
                    }
                }
                
            }
        }

      
    }

}
    
 



