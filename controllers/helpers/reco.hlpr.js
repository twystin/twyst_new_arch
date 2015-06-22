var fs = require('fs'),
  _ = require('underscore'),
  dateFormat = require('dateformat'),
  Cache = require('../../common/cache.hlpr'),
  Q = require('q');

module.exports.distance = function(p1, p2) {

  if (!p1 || !p1.latitude || ! p1.longitude ||
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

module.exports.cache_user_coupons = function(user) {
  var deferred = Q.defer();
  Cache.hget(user._id, 'coupon_map', function(err, reply) {
    if (err || !reply) {
      if (user.coupons && user.coupons.length !== 0 ) {
        var coupon_map = _.reduce(user.coupons, function(memo, item) {
          _.each(item.outlets, function(outlet) {
            memo[outlet] = memo[outlet] || {};
            memo[outlet].coupons = memo[outlet].coupons || [];
            if (item.status === "active") {
              memo[outlet].coupons.push(item);
            }
          });
          return memo;
        }, {});
        Cache.hset(user._id, 'coupon_map', JSON.stringify(coupon_map));
        deferred.resolve(true);
      } else {
        deferred.resolve(true);
      }
    } else {
      deferred.resolve(true);
    }
  });
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
  if (!business_hours) {
    return false;
  }
  var time = null;
  if (date && tm) {
    time = new Date(date + ' ' + tm);
  } else {
    time = new Date();
  }

  var day = days[time.getDay()];
  var today = business_hours[day];
  if (!today.timings || !today.timings.length) {
    return false;
  }
  if (today.closed) {
    return true;
  }
  var minutes = time.getHours() * 60 + time.getMinutes();
  for (var i = 0; i < today.timings.length; i++) {
    var t = today.timings[i];
    var open_min = 0,
      close_min = 0;
    if (t && t.open) {
      open_min = t.open.hr * 60 + t.open.min;
    } else {
      return false;
    }

    if (t && t.close) {
      close_min = t.close.hr * 60 + t.close.min;
    } else {
      return false;
    }
    if (minutes >= open_min && minutes <= close_min) {
      return false;
    }
  }
  return true;
};

module.exports.opensAt = function(business_hours) {
  var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  if (!business_hours) {
    return false;
  }
  var opens = {
    'day': null,
    'time': null
  };
  var time = new Date(Date.now() + 19800000);
  var minutes = time.getHours() * 60 + time.getMinutes();
  var day = days[time.getDay()];
  var today = business_hours[day];
  if (today.closed || !today.timings || !today.timings.length) {
    return checkNextDays();
  } else {
    for (var i = 0; i < today.timings.length; i++) {
      if (today.timings[i].open && today.timings[i].open.hr && today.timings[i].open.min) {
        var open_min = today.timings[i].open.hr * 60 + today.timings[i].open.min;
        if (open_min > minutes) {
          var hr = today.timings[i].open.hr;
          var min = today.timings[i].open.min;
          opens.time = formatTime(hr, min);
          return opens;
        }
      }
    }
    return checkNextDays();
  }

  function checkNextDays() {
    for (var j = 1; j < 7; j++) {
      time = new Date(time.getTime() + 86400000);
      var minutes = 0;
      var day = days[time.getDay()];
      var today = business_hours[day];
      if (today.closed || !today.timings || !today.timings.length) {
      } else {
        for (var i = 0; i < today.timings.length; i++) {
          if (today.timings[i].open && today.timings[i].open.hr && today.timings[i].open.min) {
            var open_min = today.timings[i].open.hr * 60 + today.timings[i].open.min;
            if (minutes < open_min) {
              opens.day = day.substr(0, 3);
              var hr = today.timings[i].open.hr;
              var min = today.timings[i].open.min;
              opens.time = formatTime(hr, min);
              return opens;
            }
          }
        }
      }
    }
    return opens;
  }
};

function formatTime(hours, minutes) {
  if (!hours || !minutes) {
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
