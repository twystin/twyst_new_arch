var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var User = mongoose.model('User')
var Friend = mongoose.model('Friend')

module.exports.check = function(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    var source = _.get(passed_data, 'event_data.event_meta.source');
    var referrar = _.get(passed_data, 'event_data.event_meta.referral_code');

    if ( !source || !referrar) {
        deferred.reject(" No referral code or source");
    }

    validate_referral_code(data)
    .then(function(data) {
        deferred.resolve(data);
    })
    .fail(function(err) {
        deferred.reject(err);
    })

    return deferred.promise;
};

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();

    var friend_source = data.source;
    var friend_referred_by = data.from_user;
    var user = data.user;

    var updated_user = {
        $push: {
            friends: {
                source: friend_source,
                add_date: new Date(),
                phone: user.phone,
                email: user.email,
                user: user._id
            }
        }
    }

    var update_referral = {
        $push: {
            friends: {
                source: friend_source,
                add_date: new Date(),
                phone: friend_referred_by.phone,
                email: friend_referred_by.email,
                user: friend_referred_by._id
            }
        }
    }

    if(friend_referred_by.friends) {
        update_referral_friend(friend_referred_by.friends, update_referral).then(function(data) {
            update_referral_friend(user.friends, updated_user).then(function(data) {
                
                deferred.resolve({
                    data: data,
                    message: 'Saved Referral'
                });                                            
                        
            }, function(err) {
                deferred.reject({
                    err: err || true,
                    message: "Couldn\'t update user"
                });
                
            })    
        }, function(err) {
            deferred.reject({
                err: err || true,
                message: "Couldn\'t update referral"
            });
            
        })
    }
    else{
        deferred.reject({
                err: err || true,
                message: "Couldn\'t update user"
            });
    }

    return deferred.promise;
};

function update_referral_friend(id, referral) {
    logger.log();
    var deferred = Q.defer();
    Friend.findOneAndUpdate({
            _id: id
        }, 
        referral,
        function(err, u) {
        if (err || !u) {
            deferred.reject(err);
          
        } else {
            deferred.resolve(u);
        }
    });

    return deferred.promise;
}

function validate_referral_code(data) {
    logger.log();
    var passed_data = data;
    var deferred = Q.defer();
    var passed_data = data;
    var source = _.get(passed_data, 'event_data.event_meta.source');
    var referrar = _.get(passed_data, 'event_data.event_meta.referral_code');
    User.findOne({phone: referrar}, function(err, user) {
        if (err || !user) {
          deferred.reject('Referral code is not valid');
        }
        else{
    
            passed_data.source = source;
            passed_data.from_user = user;
 
            deferred.resolve(passed_data);  
        }
    })

    return deferred.promise;
}


