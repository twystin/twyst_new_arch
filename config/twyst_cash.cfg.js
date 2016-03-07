module.exports.twyst_cash_grid = [

	{"event": "invite_friends", "twyst_cash": 250, "earn": true, "update_now": true},

	{"event": "referral_join", "twyst_cash": 250, "earn": true, "update_now": true},

	{"event": "update_profile", "twyst_cash": 200, "earn": true, "update_now": true},

	{"event": "follow", "twyst_cash": 20, "earn": true, "update_now": true},

	{"event": "like_offer", "twyst_cash": 10, "earn": true, "update_now": true},

	{"event": "checkin", "twyst_cash": 50, "earn": true, "update_now": true}, //have to handle at server side for different events	

	{"event": "submit_offer", "twyst_cash":50, "earn": true, "update_now": false},//not confirmed

	{"event": "share_offer", "twyst_cash": 20, "earn": true, "update_now": true},	//not confirmed

	{"event": "share_outlet", "twyst_cash": 20, "earn": true, "update_now": true},

	{"event": "suggestion", "twyst_cash": 20, "earn": true, "update_now": false},

	{"event": "upload_bill", "twyst_cash": 50, "earn": true, "update_now": false},

	{"event": "share_checkin", "twyst_cash": 25, "earn": true, "update_now": true},

	{"event": "share_redemption", "twyst_cash": 25, "earn": true, "update_now": true},

	{"event": "grab", "twyst_cash": 100, "earn": false, "update_now": true},

	{"event": "extend_offer", "twyst_cash": 150, "earn": false, "update_now": true},

	{"event": "generate_coupon", "twyst_cash": 100, "earn": false, "update_now": true}, //not true for checkin type offer we will handle this 

	{"event": "buy_checkin", "twyst_cash": 150, "earn": false, "update_now": true}
	
]