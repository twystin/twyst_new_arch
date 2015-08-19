module.exports.bucks_grid = [

	{"event": "invite_friends", "bucks": 100, "earn": true, "update_now": true},

	{"event": "join_referral", "bucks": 100, "earn": true, "update_now": true},

	{"event": "update_profile", "bucks": 200, "earn": true, "update_now": true},

	{"event": "follow", "bucks": 20, "earn": true, "update_now": true},

	{"event": "like_offer", "bucks": 10, "earn": true, "update_now": true},

	{"event": "checkin", "bucks": 50, "earn": true, "update_now": false}, //have to handle at server side for different events	

	{"event": "submit_offer", "bucks":50, "earn": true, "update_now": false},//not confirmed

	{"event": "share_offer", "bucks": 20, "earn": true, "update_now": true},	//not confirmed

	{"event": "share_outlet", "bucks": 20, "earn": true, "update_now": true},

	{"event": "suggestion", "bucks": 20, "earn": true, "update_now": false},

	{"event": "upload_bill", "bucks": 50, "earn": true, "update_now": false},

	{"event": "share_checkin", "bucks": 25, "earn": true, "update_now": true},

	{"event": "share_redemption", "bucks": 25, "earn": true, "update_now": true},

	{"event": "unlike_offer", "bucks": 10, "earn": false, "update_now": true},

	{"event": "grab", "bucks": 100, "earn": false, "update_now": true},

	{"event": "extend_offer", "bucks": 150, "earn": false, "update_now": true},

	{"event": "generate_coupon", "bucks": 100, "earn": false, "update_now": true}, //not true for checkin type offer we will handle this 
	
	{"event": "unfollow", "bucks": 20, "earn": false, "update_now": true},

	{"event": "buy_checkin", "bucks": 150, "earn": false, "update_now": true}
	
]