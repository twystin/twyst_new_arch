var twyst = db.getSiblingDB('twyst');
var retwyst = db.getSiblingDB('retwyst');
var users_with_coupons = retwyst.users.find({coupons:{$ne: null}});
while(users_with_coupons.hasNext()) {
    u = users_with_coupons.next();
    var c = 0;
    for (c = 0; c < u.coupons.length; c++) {
        if (u.coupons[c].meta && u.coupons[c].meta.issued_for) {
            var offer = twyst.offers.findOne({_id: u.coupons[c].meta.issued_for});
            if (offer && offer.reward) {
                u.coupons[c].meta.reward_type = Object.keys(offer.reward)[0];
                retwyst.users.save(u);
            }
        }
    }
}
