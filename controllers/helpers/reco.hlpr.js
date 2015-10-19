var fs = require('fs'),
  _ = require('underscore'),
  dateFormat = require('dateformat'),
  ld = require('lodash'),
  Cache = require('../../common/cache.hlpr'),
  Q = require('q');
var logger = require('tracer').colorConsole();

module.exports.distance = function(p1, p2) {
  
  if (!p1 || !p1.latitude || !p1.longitude ||
    !p2 || !p2.latitude || !p2.longitude) {
    return undefined;
  }

  var R = 6371; // radius of the earth in km
  if (typeof(Number.prototype.toRad) === 'undefined') {
    Number.prototype.toRad = function() {
      return this * Math.PI / 180;
    };
  }

  var dLat = (p2.latitude - p1.latitude).toRad();
  var dLon = (p2.longitude - p1.longitude).toRad();

  var lat1 = (p1.latitude * 1).toRad();
  var lat2 = (p2.latitude * 1).toRad();

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  var d = R * c;

  return d.toFixed(1) * 1;
};

module.exports.cache_user_favourites = function(user) {
  logger.log();
  var deferred = Q.defer();
  var favourite_map = _.reduce(user.following, function(memo, item) {
    memo[item] = 1;
    return memo;
  }, {});
  Cache.hset(user._id, 'favourite_map', JSON.stringify(favourite_map));
  deferred.resolve(true);

  return deferred.promise;
};

module.exports.cache_user_coupons = function(user) {
  logger.log();
  var deferred = Q.defer();
  
  Cache.hget(user._id, 'coupon_map', function(err, reply) {
    if (err) {
      logger.log(err);
      deferred.resolve(true);
    } else {
      if (user.coupons) {
        var coupon_map = _.reduce(user.coupons, function(memo, item) {
          //TODO: see where else this problem occurs
          //TODO: also fix up coupon migration map
          _.each(item.outlets, function(outlet){
            memo[outlet] = memo[outlet] || {};
            memo[outlet].coupons = memo[outlet].coupons || [];
            if (item.status === "active" && ( item.coupon_source === 'QR' || item.coupon_source === 'PANEL' || item.coupon_source === 'POS' 
            || item.coupon_source === 'BATCH' || item.coupon_source === 'MRL')) {
              memo[outlet].coupons.push(item);
            }  
          })
        
          return memo;
        }, {});
        Cache.hset(user._id, 'coupon_map', JSON.stringify(coupon_map));
        deferred.resolve(true);
      } else {
        deferred.resolve(true);
      }
    } 
  });
  return deferred.promise;
};

module.exports.cache_offer_likes = function(event_type, updated_offer, new_user, updated_outlet) {
  logger.log();
  var deferred = Q.defer();
  var users = [];
  
  Cache.hget(updated_offer, 'offer_like_map', function(err, reply) {
    if (err || !reply) {
      Cache.get('outlets', function(err, reply) {
        if (!err && reply) { 
          var outlets = JSON.parse(reply),
            outlet = outlets[updated_outlet.toString()];

          _.map(outlet.offers, function(offer) {

            if(offer._id.toString() == updated_offer.toString()) {

              if ((!_.contains(offer.offer_likes, new_user.toString())) && (event_type == 'like_offer')) {
                if (!_.has(offer, 'offer_likes')) {
                  offer.offer_likes = [];
                }

                offer.offer_likes.push(new_user.toString());
                users = offer.offer_likes;

                Cache.hset(updated_offer, 'offer_like_map', JSON.stringify(users));
                Cache.set('outlets', JSON.stringify(outlets));
              } else if (_.contains(offer.offer_likes, new_user.toString()) && (event_type == 'unlike_offer')) {
                offer.offer_likes.pop(new_user.toString());
                users = offer.offer_likes;

                Cache.hset(updated_offer, 'offer_like_map', JSON.stringify(users));
                Cache.set('outlets', JSON.stringify(outlets));
              }
            }
          });
          
        }

        deferred.resolve(true);
      });
      
    } else {
      users = JSON.parse(reply) || [];

      if (event_type == 'like_offer' && !_.contains(users, new_user.toString())) {
        users.push(new_user.toString());
      } else if (_.contains(users, new_user.toString()) && event_type =='unlike_offer') {
          users.pop(new_user.toString());
      }
      
      Cache.hset(updated_offer, 'offer_like_map', JSON.stringify(users));

      Cache.get('outlets', function(err, reply) {
        if(err || !reply) {
          deferred.resolve(true);
        } else {
          var outlets = JSON.parse(reply),
            outlet_id = updated_outlet.toString();

          _.map(outlets[outlet_id].offers, function(offer) {
            if(offer._id.toString() == updated_offer.toString()) {
              offer.offer_likes = users;
              Cache.set('outlets', JSON.stringify(outlets));
            }
          });

          deferred.resolve(true);
        }
      });

    }

  });

  deferred.resolve(true);

  return deferred.promise;
};

// OLD CODE THAT SHOULD BE CLEANED UP

module.exports.shuffleArray = function(array) {
  var counter = array.length,
    temp, index;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
};

module.exports.isClosed = function(date, tm, business_hours) {
  var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var timeHr, timeMin, timeMins;
  if(tm) {
    var index = tm.indexOf(':');
    timeHr = parseInt(tm.slice(0, index));
    timeMin = parseInt(tm.slice(index + 1, 5));
    timeMins = (timeHr*60) + timeMin;
  }
  if (!business_hours)
    return false;

  var time = date? new Date((new Date(date).getTime())): new Date(Date.now() + 19800000),
    day = days[time.getDay()],
    today = business_hours[day];

  if (!_.has(today, 'timings') || _.isEmpty(today.timings))
    return true;

  if (today.closed)
    return true;

  var minutes = timeMins? timeMins: ((time.getHours() * 60) + time.getMinutes());

  for (var i = 0; i < today.timings.length; i++) {
    var timing = today.timings[i];

    if(ld.has(timing, 'open.hr') && ld.has(timing, 'open.min') && ld.has(timing, 'close.hr') && ld.has(timing, 'close.min')) {
      var open_min = (timing.open.hr * 60) + timing.open.min,
        close_min = (timing.close.hr * 60) + timing.close.min;

      if(close_min<open_min) {
        close_min += (24*60);
      }

      if( (minutes >= open_min) && (minutes <= close_min) ) {
        return false;
      }

    } else {
      return false;
    }
  }
  return true;
};

module.exports.opensAt = function(business_hours) {
  var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  if(!business_hours)
    return false;

  var time = new Date(Date.now() + 19800000),
    minutes = time.getHours() * 60 + time.getMinutes(),
    day = days[time.getDay()];

  var today = business_hours[day];

  if(today.isClosed || !ld.has(today, 'timings') || ld.isEmpty(today.timings)) {
    return checkTomorrow(1);
  } else {
    for(var i=0; i < today.timings.length; i++) {
      var timing = today.timings[i];

      if(ld.has(timing, 'open.hr') && ld.has(timing, 'open.min') && ld.has(timing, 'close.hr') && ld.has(timing, 'close.min')) {
        var open_min = (timing.open.hr * 60) + timing.open.min;
        
        if(open_min >= minutes) {
          return {
            time: formatTime(today.timings[i].open.hr, today.timings[i].open.min),
            day: 'Today'
          };
        }
      }
    }
    return checkTomorrow(1);
  }

  function checkTomorrow(counter) {
    if (counter === 7)
      return {
        'time': null,
        'day': null
      };

    minutes = 0;
    day = days[((time.getDay() + counter)%7)];
    today = business_hours[day];

    if(today.isClosed || !_.has(today, 'timings') || _.isEmpty(today.timings)) {
      return checkTomorrow(counter + 1);
    } else {
      for(var i=0; i < today.timings.length; i++) {
        var timing = today.timings[i];

        if(ld.has(timing, 'open.hr') && ld.has(timing, 'open.min') && ld.has(timing, 'close.hr') && ld.has(timing, 'open.min')) {
          var open_min = (timing.open.hr * 60) + timing.open.min;
           if(open_min >= minutes) {
            if (counter === 1)
              day = 'Tomorrow';


            return {
              time: formatTime(today.timings[i].open.hr, today.timings[i].open.min),
              day: day
            };
          }
        }
      }
      return checkTomorrow(counter + 1);
    }
  };
};

function formatTime(hours, minutes) {
  if (!ld.isFinite(hours) || !ld.isFinite(minutes)) {
    return "";
  }
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

module.exports.tenDigitPhone = function(phone) {
  if (!phone) {
    return '';
  }
  return phone.substring(phone.length - 10);
};

module.exports.formatDate = function(date) {
  return dateFormat(date, "dd mmm yyyy");
};




module.exports.replaceAll = function(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);

  function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }
}

module.exports.rewardify = function(input) {
  if (input.reward.custom && input.reward.custom.text) {
    return input.reward.custom.text;
  } else if (input.reward.flat && (input.reward.flat.off || input.reward.flat.spend)) {
    if (input.reward.flat.off && input.reward.flat.spend) {
      return "Get Rs. " + ifEmpty(input.reward.flat.off) + " off on a minimum spend of Rs." + ifEmpty(input.reward.flat.spend);
    }
    if (input.reward.flat.off) {
      return "Get Rs. " + ifEmpty(input.reward.flat.off) + " off on your bill";
    }
  } else if (input.reward.free && (input.reward.free.title || input.reward.free._with)) {
    if (input.reward.free.title && input.reward.free._with) {
      return "Get a free " + ifEmpty(input.reward.free.title) + " with " + ifEmpty(input.reward.free._with);
    }
    if (input.reward.free.title) {
      return "Get a free " + ifEmpty(input.reward.free.title);
    }
  } else if (input.reward.buy_one_get_one && input.reward.buy_one_get_one.title) {
    return "Buy one get one " + ifEmpty(input.reward.buy_one_get_one.title);
  } else if (input.reward.reduced && (input.reward.reduced.what || input.reward.reduced.worth || input.reward.reduced.for_what)) {
    if (input.reward.reduced.what && input.reward.reduced.worth) {
      return "Get " + ifEmpty(input.reward.reduced.what) + " worth Rs. " + ifEmpty(input.reward.reduced.worth) + " for Rs. " + ifEmpty(input.reward.reduced.for_what);
    }
  } else if (input.reward.happyhours && input.reward.happyhours.extension) {
    return "Extended happy hours by " + ifEmpty(input.reward.happyhours.extension);
  } else if (input.reward.discount) {
    if (input.reward.discount.max) {
      return "Get " + ifEmpty(input.reward.discount.percentage) + " off, subject to a maximum discount of Rs." + ifEmpty(input.reward.discount.max);
    } else {
      return "Get " + ifEmpty(input.reward.discount.percentage) + " off on your bill";
    }
  } else {
    return ifEmpty(input.basics.description);
  }

  function ifEmpty(input) {
    if (input) {
      return input;
    }
    return '';
  }
}

module.exports.setCurrentTime = function(oldDate) {
  if (!oldDate) {
    return (new Date());
  } else {
    var date = new Date(oldDate),
      h = new Date().getHours(),
      m = new Date().getMinutes(),
      s = new Date().getSeconds();
    date.setHours(h);
    date.setMinutes(m);
    date.setSeconds(s);
    return date;
  }
}

module.exports.getOutletAttributes = function(outlet) {

  var attributes = [];

  if (outlet.attributes) {
    _.each(outlet.attributes, function(val, key) {
      if (key === "cost_for_two" || key === "timings" || key === "toObject") {

      } else if (key === "tags") {
        attributes = attributes.concat(val);
      } else if (key === "cuisines" || key === "payment_options") {
        attributes = attributes.concat(val);
      } else if (key === "wifi" && (val === "Free" || val === "Paid")) {
        attributes.push(key);
      } else if (key === "parking" && (val === "Available" || val === "Valet")) {
        attributes.push(key);
      } else if (key === "air_conditioning" && (val === "Available" || val === "Partial")) {
        attributes.push(key);
      } else {
        if (val) {
          attributes.push(key);
        }
      }
    });
  }
  return _.uniq(attributes);
}
