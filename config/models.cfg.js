'use strict';
/*jslint node: true */

module.exports = function() {
    var models = ['account.mdl', 'contact.mdl', 'auth_token.mdl', 'auth_code.mdl', 'event.mdl', 'outlet.mdl', 'user.mdl', 'qr_code.mdl', 'friend.mdl.js', 'notification.mdl.js', 'order.mdl.js', 'cashback_offer.mdl.js'];
    var model = '';
    models.forEach(function(m) {
        model = require('../models/' + m);
    });
};
