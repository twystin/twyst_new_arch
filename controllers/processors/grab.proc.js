var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  if (!_.get(data, 'event_data.event_meta.coupon') || !_.get(data, 'event_data.event_outlet')) {
    deferred.reject('No coupon code or outlet sent to grab');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  logger.log();
  var deferred = Q.defer();

  var user_id = data.user._id;
  var coupon_id = data.coupon._id;
  var outlet_id = data.outlet._id;
  var coupon = data.coupon;
  //remove coupon from cache
  _.each(coupon.social_friend_list, function(friend){
    Cache.hget(friend, 'social_pool_coupons', function(err, reply){
      if(err || !reply) {

      }
      else {
        var new_social_pool = []
        _.each(reply, function(coupon_in_social_pool){
            if(coupon_in_social_pool._id != coupon._id) {
                new_social_pool.push(coupon_in_social_pool);
            }
        })
        Cache.hset(friend, 'social_pool_coupons', new_social_pool);
      }
    })
  };
  coupon.is_grabed = true;
  coupons.status = 'active';
  var update = {
    $push: {
      coupons: {
        coupon
      }
    }
    //update user who grabbed coupon
    User.findOneAndUpdate({
        '_id': user_id
      }, update, function(err, u) {
        if (err || !u) {
          deferred.reject({
            err: err || true,
            message: "Couldn\'t update user"
          });
        } else {//update user whose coupon is being grabbed
          User.findOneAndUpdate({
            '_id': lapsed_coupon_source, coupons: {$elemMatch: {  _id: coupon._id }}
          }, {$set: {'coupons.$.grabbed_by': user_id, 'coupons.$.status': 'grabbed'},
           function(err, u) {
            if (err || !u) {
              deferred.reject({
                err: err || true,
                message: "Couldn\'t grab coupon"
              });
            }
            else{
                deferred.resolve({
                    data: user,
                    message: 'coupon grabbed successfully'
                  });
            }
          
          
        }
      });
  })

  deferred.resolve(true);
  return deferred.promise;
};
