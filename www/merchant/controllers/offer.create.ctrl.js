angular.module('merchantApp')
  .controller('OfferCreateController', ['$scope', '$http', '$q', 'toastr', 'merchantRESTSvc', '$rootScope', '$log', '$timeout', '$state', 'WizardHandler',
    function($scope, $http, Q, toastr, merchantRESTSvc, $rootScope, $log, $timeout, $state, WizardHandler) {

      merchantRESTSvc.getOutlets().then(function(data) {
        $scope.outlets = _.indexBy(data.data.outlets, '_id');
      }, function(err) {
        $log.log('Could not get outlets - ' + err.message);
        $scope.outlets = [];
      });

      $scope.today = new Date(),
        max_date = new Date($scope.today.getTime() + (2 * 365 * 24 * 60 * 60 * 1000));
      $scope.today.setMinutes(0);
      $scope.today.setHours(0);
      $scope.today.setSeconds(0);
      $scope.today.setMilliseconds(0);

      $scope.offer = {
        offer_status: 'draft',
        offer_type: '',
        offer_start_date: _.clone($scope.today),
        offer_end_date: new Date($scope.today.getTime() + (2 * 30 * 24 * 60 * 60 * 1000)),
        rule: {

        },
        actions: {
          reward: {
            reward_meta: {
            },
            reward_hours: { monday: { closed: false, timings: [{}] }, tuesday: { closed: false, timings: [{}] }, wednesday: { closed: false, timings: [{}] }, thursday: { closed: false, timings: [{}] }, friday: { closed: false, timings: [{}] }, saturday: { closed: false, timings: [{}] }, sunday: { closed: false, timings: [{}] } },
            applicability: {
              dine_in: true,
              delivery: true
            }
          }
        }
      }

      $scope.offer_types = { 'checkin': 'Checkin Offer', 'offer': 'Offer', 'deal': 'Deal', 'bank_deal': 'Bank Deal' }
      $scope.reward_types = {'buyonegetone': 'Buy One Get One', 'discount': 'Discount', 'flatoff': 'Flat Off', 'free': 'Free', 'happyhours': 'Happy Hours', 'reduced': 'Reduced Price', 'custom': 'Custom', 'unlimited': 'Unlimited', 'onlyhappyhours': 'Only Happy Hours', 'combo': 'Combo', 'buffet': 'Buffet'};
      $scope.offer_sources = { 'hdfc': 'HDFC Bank', 'sbi': 'State Bank Of India', 'hsbc': 'HSBC Bank', 'citibank': 'Citi Bank' };
      $scope.event_matches = [{name: 'On every', value: 'on every'}, {name: 'After', value: 'after'}, {name: 'On only', value: 'on only'}]
      
      $scope.updateTiming = function(day, list) {
        if (list[day].closed) {
          list[day].timings = [];
        } else {
          list[day].timings = [{}];
        }
      };

      $scope.removeTiming = function(day, index, list) {
        list[day].timings.splice(index, 1);
      };

      $scope.initalizeTiming = function(day, index, list) {
        if(list[day].timings[index].open && list[day].timings[index].close) {
          return;
        }
        var openTime = new Date();
        openTime.setHours(9);
        openTime.setMinutes(0);
        openTime.setSeconds(0);
        openTime.setMilliseconds(0);
        var closeTime = new Date();
        closeTime.setHours(21);
        closeTime.setMinutes(0);
        closeTime.setSeconds(0);
        closeTime.setMilliseconds(0);
        list[day].timings[index] = { 
          open: { hr: 9, min: 0, time: openTime},
          close: { hr: 21, min: 0, time: closeTime},
        }
      };

      $scope.updateTime = function(day, index, list) {
        var _timing = list[day].timings[index];
        if(_timing.open.time) {
          _timing.open.hr  = _timing.open.time.getHours();
          _timing.open.min = _timing.open.time.getMinutes();
        } 
        if(_timing.close.time) {
          _timing.close.hr  = _timing.close.time.getHours();
          _timing.close.min = _timing.close.time.getMinutes();
        }
      }

      $scope.addNewTiming = function(day, list) {
        list[day].timings.push({});
      };

      $scope.cloneToAllDays = function(the_day, list) {
        _.each(list, function(schedule, day) {
          if (day !== the_day) {
            schedule.timings = _.cloneDeep(list[the_day].timings);
            schedule.closed = list[the_day].closed;
          }
        });
      };

      $scope.addOutlet = function(newOutlet) {
        if(!newOutlet)
          return;

        if(!$scope.offer.offer_outlets) {
          $scope.offer.offer_outlets = [newOutlet];
          $scope.cloneTimings({_id: newOutlet});
        } else {
          if($scope.offer.offer_outlets.indexOf(newOutlet) == -1) {
            $scope.offer.offer_outlets.push(newOutlet);
          }
        }
        
      }

      $scope.getRange = function(len) {
        return new Array(len);
      }

      $scope.getMaxRange = function() {
        return new Array(_.reduce($scope.offer.actions.reward.reward_hours, function(obj1, obj2) {
          if(!_.has(obj1, 'timings')) { return obj1 >= obj2.timings.length? obj1: obj2.timings.length; }
          else { return obj1.timings.length>obj2.timings.length? obj1.timings.length:obj2.timings.length; }
        }));
      }

      $scope.filterOutlets = function(val) {
        var regex = new RegExp(val, 'i');
        return _.filter($scope.outlets, function(obj) {
          return regex.test(obj.basics.name) || regex.test(obj.contact.location.address) || regex.test(obj.contact.location.locality_1[0]) || regex.test(obj.contact.location.locality_2[0]);
        });
      }

      $scope.removeOutlet = function(index) {
        if($scope.offer.offer_outlets) {
          $scope.offer.offer_outlets.splice(index, 1);
        }
      }

      $scope.cloneTimings = function(obj) {
        if(obj._id) {
          $scope.offer.actions.reward.reward_hours = _.indexBy(_.map(Object.keys($scope.outlets[obj._id].business_hours), function(day) {
            var timings = _.map($scope.outlets[obj._id].business_hours[day].timings, function(timing) {
              delete timing._id;
              var time = new Date();
              time.setHours(timing.open.hr);
              time.setMinutes(timing.open.min);
              time.setSeconds(0);
              time.setMilliseconds(0);
              timing.open.time = _.clone(time);
              time.setHours(timing.close.hr);
              time.setMinutes(timing.close.min);
              timing.close.time = _.clone(time);
              return _.cloneDeep(timing);
            });

            return {
              day: day,
              timings: timings,
              closed: $scope.outlets[obj._id].business_hours[day].closed
            };
          }), 'day');
          obj._id = '';
        }
      }

      $scope.$watchCollection('offer.offer_type', function(newVal, oldVal) {
        if(!newVal) {
          return;
        } else if(newVal=='offer') {
          if(Object.keys($scope.offer.rule).length) {
            $scope.offer.rule = {};
          }
          if(!$scope.offer.offer_cost) {
            $scope.offer.offer_cost = '100';
          }
        } else if(newVal=='deal' || newVal=='bank_deal') {
          if($scope.offer.minimum_bill_value) {
            delete $scope.offer.minimum_bill_value;
          }
        }
      });

      $scope.$watchCollection('offer.rule', function(newVal, oldVal) {
        if(newVal.event_match != oldVal.event_match) {
          $scope.offer.rule.friendly_text = '';
          $scope.offer.rule = { event_match: newVal.event_match };
        } else if($scope.offer.rule.event_match) {
          if($scope.offer.rule.event_match=='on every' && $scope.offer.rule.event_count && ($scope.offer.rule.event_start || $scope.offer.rule.event_start==0) && $scope.offer.rule.event_end) {
            var startOrdinal, endOrdinal, countOrdinal;
            startOrdinal = ($scope.offer.rule.event_start>3 || $scope.offer.rule.event_start==0)? 'th': ($scope.offer.rule.event_start==3)? 'rd': ($scope.offer.rule.event_start==2)? 'nd': ($scope.offer.rule.event_start==1)? 'st': 'th';
            endOrdinal = ($scope.offer.rule.event_end>3 || $scope.offer.rule.event_end==0)? 'th': ($scope.offer.rule.event_end==3)? 'rd': ($scope.offer.rule.event_end==2)? 'nd': ($scope.offer.rule.event_end==1)? 'st': 'th';
            countOrdinal = ($scope.offer.rule.event_count>3 || $scope.offer.rule.event_count==0)? 'th': ($scope.offer.rule.event_count==3)? 'rd': ($scope.offer.rule.event_count==2)? 'nd': ($scope.offer.rule.event_count==1)? 'st': 'th';
            $scope.offer.rule.friendly_text = 'Application on every ' + $scope.offer.rule.event_count + countOrdinal + ' checkin from ' + $scope.offer.rule.event_start + startOrdinal + ' to ' + $scope.offer.rule.event_end + endOrdinal + ' checkin';
          } else if($scope.offer.rule.event_match=='after' && ($scope.offer.rule.event_start || $scope.offer.rule.event_start==0) && $scope.offer.rule.event_end) {
            var startOrdinal, endOrdinal;
            startOrdinal = ($scope.offer.rule.event_start>3 || $scope.offer.rule.event_start==0)? 'th': ($scope.offer.rule.event_start==3)? 'rd': ($scope.offer.rule.event_start==2)? 'nd': ($scope.offer.rule.event_start==1)? 'st': 'th';
            endOrdinal = ($scope.offer.rule.event_end>3 || $scope.offer.rule.event_end==0)? 'th': ($scope.offer.rule.event_end==3)? 'rd': ($scope.offer.rule.event_end==2)? 'nd': ($scope.offer.rule.event_end==1)? 'st': 'th';
            $scope.offer.rule.friendly_text = 'Application on every checkin starts from ' + $scope.offer.rule.event_start + startOrdinal + ' to ' + $scope.offer.rule.event_end + endOrdinal + ' checkin';
          } else if($scope.offer.rule.event_match=='on only' && ($scope.offer.rule.event_count || $scope.offer.rule.event_count==0)) {
            var ordinal;
            ordinal = ($scope.offer.rule.event_count>3 || $scope.offer.rule.event_count==0)? 'th': ($scope.offer.rule.event_count==3)? 'rd': ($scope.offer.rule.event_count==2)? 'nd': ($scope.offer.rule.event_count==1)? 'st': 'th';
          $scope.offer.rule.friendly_text = 'Application on the ' + $scope.offer.rule.event_count + ordinal + 'checkin';
          } else {
            $scope.offer.rule.friendly_text = '';
          }
        }
      })

      $scope.$watchCollection('offer.actions.reward.reward_meta', function(newVal, oldVal) {
        if (!newVal.reward_type) {
          if (Object.keys($scope.offer.actions.reward.reward_meta).length) {
            $scope.offer.actions.reward.reward_meta = {
            };
          }
        }
        
        if (newVal.reward_type != oldVal.reward_type) {
          $scope.offer.actions.reward.reward_meta = {
            reward_type: newVal.reward_type
          };
          if (newVal.reward_type == 'custom') {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        }

        if (newVal.reward_type == "buyonegetone") {
          if (newVal.bogo) {
            $scope.offer.actions.reward.header = '1+1',
              $scope.offer.actions.reward.line1 = 'on ' + newVal.bogo;
            $scope.offer.actions.reward.line2 = '';
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == "discount") {
          if (newVal.percent && newVal.max) {
            $scope.offer.actions.reward.header = newVal.percent + '% off';
            $scope.offer.actions.reward.line1 = 'on your bill';
            $scope.offer.actions.reward.line2 = 'max discount Rs.' + newVal.max;
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == 'flatoff') {
          if (newVal.off && newVal.spend) {
            $scope.offer.actions.reward.header = 'Rs. ' + newVal.off + ' off';
            $scope.offer.actions.reward.line1 = 'on a min spend';
            $scope.offer.actions.reward.line2 = 'of Rs. ' + newVal.spend;
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == 'free') {
          if (newVal.title && newVal._with) {
            $scope.offer.actions.reward.header = 'Free';
            $scope.offer.actions.reward.line1 = newVal.title;
            $scope.offer.actions.reward.line2 = 'with ' + newVal._with;
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == 'happyhours') {
          if (newVal.extension) {
            $scope.offer.actions.reward.header = newVal.extension;
            $scope.offer.actions.reward.line1 = 'extra happy hours';
            $scope.offer.actions.reward.line2 = '';
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == 'reduced') {
          if (newVal.what && newVal.worth && newVal.for_what) {
            $scope.offer.actions.reward.header = 'Only Rs. ' + newVal.for_what;
            $scope.offer.actions.reward.line1 = 'for ' + newVal.what + ' worth';
            $scope.offer.actions.reward.line2 = 'Rs. ' + newVal.worth;
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == 'custom') {
          if (!$scope.offer.actions.reward.header)
            $scope.offer.actions.reward.header = '';
          if (!$scope.offer.actions.reward.line1)
            $scope.offer.actions.reward.line1 = '';
          if (!$scope.offer.actions.reward.line2)
            $scope.offer.actions.reward.line2 = '';
        } else if (newVal.reward_type == 'unlimited') {
          if (newVal.item && newVal.conditions) {
            $scope.offer.actions.reward.header = 'Unlimited';
            $scope.offer.actions.reward.line1 = newVal.item;
            $scope.offer.actions.reward.line2 = 'at Rs. ' + newVal.conditions;
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == 'onlyhappyhours') {
          if (newVal.title && newVal.conditions) {
            $scope.offer.actions.reward.header = 'Happy hours';
            $scope.offer.actions.reward.line1 = 'get ' + newVal.title;
            $scope.offer.actions.reward.line2 = 'on ' + newVal.conditions;
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == 'combo') {
          if (newVal.items && newVal._for) {
            $scope.offer.actions.reward.header = 'Combo';
            $scope.offer.actions.reward.line1 = newVal.items;
            $scope.offer.actions.reward.line2 = 'for Rs. ' + newVal._for;
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        } else if (newVal.reward_type == 'buffet') {
          if (newVal.title && newVal.cost) {
            $scope.offer.actions.reward.header = 'Buffet';
            $scope.offer.actions.reward.line1 = newVal.title;
            $scope.offer.actions.reward.line2 = 'at Rs. ' + newVal.cost;
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        }

      });

      $scope.validateStep1 = function() {
        var deferred = Q.defer();

        var _handleErrors = function(err) {
          toastr.error(err, "Error");
          deferred.reject();
        };

        $scope.validateOfferType()
          .then(function() {
            return $scope.validateOfferRules();
          }, _handleErrors)
          .then(function() {
            return $scope.validateRewardDetails();
          }, _handleErrors)
          .then(function() {
            return $scope.validateRewardInfo();
          }, _handleErrors)
          .then(function() {
            deferred.resolve(true);
          }, _handleErrors)
        return deferred.promise;
      }

      $scope.validateStep2 = function() {
        var deferred = Q.defer();

        var _handleErrors = function(err) {
          toastr.error(err, "Error");
          deferred.reject();
        };

        $scope.validateOfferTerms()
          .then(function() {
            return $scope.validateOfferTimings();
          }, _handleErrors)
          .then(function() {
            return $scope.validateAgainstOutlets();
          }, _handleErrors)
          .then(function() {
            return $scope.validateOfferValidity();
          }, _handleErrors)
          .then(function() {
            deferred.resolve(true);
          }, _handleErrors)

        return deferred.promise;
      }

      $scope.validateOfferType = function() {
        var def = Q.defer();
        if (!$scope.offer.offer_type) {
          def.reject("Offer type must be selected");
        } else {
          def.resolve(true);
        }
        return def.promise;
      }

      $scope.validateOfferRules = function() {
        var def = Q.defer();
        if ($scope.offer.offer_type !== 'checkin') {
          def.resolve(true)
        } else if (!$scope.offer.rule.event_match) {
          def.reject("Offer criteria required");
        } else if ($scope.offer.rule.event_match == "on every") {
          if (!$scope.offer.rule.event_count) {
            def.reject("Valid offer frequency required");
          } else if (!$scope.offer.rule.event_start && $scope.offer.rule.event_start !== 0) {
            def.reject("Valid offer start checkin count required");
          } else if (!$scope.offer.rule.event_end) {
            def.reject("Valud offer end checkin count required");
          } else if (($scope.offer.rule.event_count > ($scope.offer.rule.event_end - $scope.offer.rule.event_start)) || ($scope.offer.rule.event_start >= $scope.offer.rule.event_end)) {
            def.reject("Invalid rules for type 'every'");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.rule.event_match == "after") {
          if (!$scope.offer.rule.event_start) {
            def.reject("Valid offer start checkin count required");
          } else if (!$scope.offer.rule.event_end) {
            def.reject("Valud offer end checkin count required");
          } else if (($scope.offer.rule.event_count > ($scope.offer.rule.event_end - $scope.offer.rule.event_start)) || ($scope.offer.rule.event_start >= $scope.offer.rule.event_end)) {
            def.reject("Invalid rules for type 'every'");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.rule.event_match == "on only") {
          if (!$scope.offer.rule.event_count) {
            def.reject("Valid checkin number required");
          } else {
            def.resolve(true);
          }
        }
        return def.promise;
      }

      $scope.validateRewardDetails = function() {
        var def = Q.defer();
        if (!$scope.offer.actions.reward.reward_meta.reward_type) {
          def.reject("Choose a reward type");
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'buyonegetone') {
          if (!$scope.offer.actions.reward.reward_meta.bogo) {
            def.reject("'Buy One Get One' requires item names");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'discount') {
          if (!$scope.offer.actions.reward.reward_meta.percent) {
            def.reject("Discount requires valid disount percentage");
          } else if (!$scope.offer.actions.reward.reward_meta.max) {
            def.reject("Discouut requires maximum discount amount");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'flatoff') {
          if (!$scope.offer.actions.reward.reward_meta.off) {
            def.reject("Flatoff required off amount")
          } else if (!$scope.offer.actions.reward.reward_meta.spend) {
            def.reject("Flatoff required minimum spend");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'free') {
          if (!$scope.offer.actions.reward.reward_meta.title) {
            def.reject("Free offer requires item name");
          } else if (!$scope.offer.actions.reward.reward_meta._with) {
            def.reject("Free offer requires conditions");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'happyhours') {
          if (!$scope.offer.actions.reward.reward_meta.extension) {
            def.reject("'Happy hours' offer requires extension duration (in hrs.)")
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'reduced') {
          if (!$scope.offer.actions.reward.reward_meta.what) {
            def.reject("Reduced offer requires item info");;
          } else if (!$scope.offer.actions.reward.reward_meta.worth) {
            def.reject("Reduced offer requires actual worth");
          } else if (!$scope.offer.actions.reward.reward_meta.for_what) {
            def.reject("Reduced offer requires deal price");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'custom') {
          if (!$scope.offer.actions.reward.reward_meta.title) {
            def.reject("Custom offer requires offer details");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'unlimited') {
          if (!$scope.offer.actions.reward.reward_meta.item) {
            def.reject("Unlimited offer requires item name");
          } else if (!$scope.offer.actions.reward.reward_meta.conditions) {
            def.reject("Unlimited offer requires offer criteria");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'onlyhappyhours') {
          if (!$scope.offer.actions.reward.reward_meta.title) {
            def.reject("'Only happy hours' offer requires deal info");
          } else if (!$scope.offer.actions.reward.reward_meta.conditions) {
            def.reject("'Only happy hours' offer requires deal items");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'combo') {
          if (!$scope.offer.actions.reward.reward_meta.items) {
            def.reject("Combo offer requires deal items");
          } else if (!$scope.offer.actions.reward.reward_meta._for) {
            def.reject("Combo offer requires deal price");
          } else {
            def.resolve(true);
          }
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'buffet') {
          if (!$scope.offer.actions.reward.reward_meta.title) {
            def.reject("Buffet offer requires deal info");
          } else if (!$scope.offer.actions.reward.reward_meta.cost) {
            def.reject("Buffet offer requires deal price");
          } else {
            def.resolve(true);
          }
        }
        return def.promise;
      }

      $scope.validateRewardInfo = function() {
        var def = Q.defer();
        if(!$scope.offer.actions.reward.header) {
          def.reject("Header is mandatory");
        } else if (!$scope.offer.actions.reward.line1) {
          def.reject("Line 1 is mandatory");
        } else {
          def.resolve(true);
        }
        return def.promise;
      }

      $scope.validateOfferTerms = function() {
        var def = Q.defer();
        if (!$scope.offer.minimum_bill_value && ($scope.offer.offer_type == 'checkin' || $scope.offer.offer_type == 'offer')) {
          def.reject("Minimum bill amount required");
        } else if (!$scope.offer.actions.reward.applicability.dine_in && !$scope.offer.actions.reward.applicability.delivery) {
          def.reject("Offer cannot be invalid for both dine-in and delivery")
        } else if (!$scope.offer.offer_lapse_days && $scope.offer.offer_type == 'checkin') {
          def.reject("Offer lapse duration required.")
        } else if (!$scope.offer.offer_valid_days && $scope.offer.offer_type == 'checkin') {
          def.reject("Offer expiry duration required");
        } else if (!($scope.offer.offer_cost && /^[0-9]+$/.test($scope.offer.offer_cost)) && $scope.offer.offer_type == 'offer') {
          def.reject("offer cost required (in Twyst Bucks)");
        } else if (!$scope.offer.offer_source && $scope.offer.offer_type == 'bank_deal') {
          def.reject("Deal source required for bank deal");
        } else {
          def.resolve();
        }
        return def.promise;
      }

      $scope.validateOfferTimings = function() {
        var def = Q.defer();
        async.each(Object.keys($scope.offer.actions.reward.reward_hours), function(day, callback) {
            var schedule = $scope.offer.actions.reward.reward_hours[day];
            if(schedule.closed) {
                callback();
            } else {
                async.each(schedule.timings, function(timing1, callback) {
                    if((!timing1.open.hr && timing1.open.hr !== 0) || (!timing1.open.min && timing1.open.min !== 0) || (!timing1.close.hr && timing1.close.hr !== 0) || (!timing1.close.min && timing1.close.min !== 0)) {
                        callback("One or more offer timings invalid for " + day.toUpperCase())
                    } else {
                        async.each(schedule.timings, function(timing2, callback) {
                            if((!timing2.open.hr && timing2.open.hr !== 0) || (!timing2.open.min && timing2.open.min !== 0) || (!timing2.close.hr && timing2.close.hr !== 0) || (!timing2.close.min && timing2.close.min !== 0)) {
                                callback("One or more offer timings invalid for " + day.toUpperCase())
                            } else {
                                var startMin1 = (timing1.open.hr * 60) + timing1.open.min,
                                    closeMin1 = (timing1.close.hr * 60) + timing1.close.min,
                                    startMin2 = (timing2.open.hr * 60) + timing2.open.min,
                                    closeMin2 = (timing2.close.hr * 60) + timing2.close.min;

                                if(timing1 == timing2) {
                                    callback();
                                } else if(((startMin1 <= closeMin2) && (closeMin2 <= closeMin1)) || ((startMin1 <= startMin2) && (startMin2 <= closeMin1)) || ((startMin2<= closeMin1) && (closeMin1 <= closeMin2)) ) {
                                    callback("One or more offer timings invalid for " + day.toUpperCase());
                                } else {
                                    callback();
                                }
                            }
                        }, function(err) {
                            callback(err);
                        });
                    }
                }, function(err) {
                    
                    callback(err);
                })
            }
        }, function(err) {
            if(err) {
                // $scope.handleErrors(err);
                def.reject(err);
            } else {
                def.resolve(true);
            }
        });
        return def.promise;
      }

      $scope.validateAgainstOutlets = function() {
        var def = Q.defer();
        async.each(Object.keys($scope.offer.actions.reward.reward_hours), function(day, callback) {
          var offer_schedule = $scope.offer.actions.reward.reward_hours[day];
          if(offer_schedule.closed) {
            callback();
          } else {
            console.log(offer_schedule.timings, day);
            async.each(offer_schedule.timings, function(offer_timing, callback) {
              var offerOpenMin = (offer_timing.open.hr * 60) + offer_timing.open.min,
                offerCloseMin = (offer_timing.close.hr * 60) + offer_timing.close.min;
              async.each($scope.offer.offer_outlets, function(outletId, callback) {
                var outlet = $scope.outlets[outletId];
                var outlet_schedule = outlet.business_hours[day];

                if(outlet_schedule.closed) {
                  callback("Offer available on " + day.toUpperCase() + " despite outlet " + outlet.basics.name + " being closed");
                } else {
                  async.each(outlet_schedule.timings, function(outlet_timing, callback) {
                    var outletOpenMin = (outlet_timing.open.hr * 60) + outlet_timing.open.min,
                      outletCloseMin = (outlet_timing.close.hr * 60) + outlet_timing.close.min;

                    if(outletCloseMin<=outletOpenMin) {
                      outletCloseMin += (24*60);
                    }
                    
                    if(outletOpenMin<=offerOpenMin && offerCloseMin<=outletCloseMin) {
                      callback("found");
                    } else {
                      callback();
                    }
                  }, function(found) {
                    if(found) {
                      callback();
                    } else {
                      callback("Offer available on " + day.toUpperCase() + " outside the timings for " + outlet.basics.name);
                    }
                  });
                }
              }, function(err) {
                callback(err);
              })
            }, function(err) {
              callback(err);
            });
          }
        }, function(err) {
          if(err) {
            def.reject(err);
          } else {
            def.resolve(true);
          }
        });

        return def.promise;
      }

      $scope.validateOfferValidity = function() {
        var def = Q.defer();
        if (!$scope.offer.offer_start_date || $scope.offer.offer_start_date < $scope.today || $scope.offer.offer_end_date > max_date) {
          def.reject("Offer requires valid start date")
        } else if (!$scope.offer.offer_end_date || $scope.offer.offer_start_date < $scope.today || $scope.offer.offer_end_date > max_date) {
          def.reject("Offer requires valid end date");
        } else if ($scope.offer.offer_start_date >= $scope.offer.offer_end_date) {
          def.reject("Offer end date cannot be before or the same as offer end date");
        } else if (!$scope.offer.offer_outlets || !$scope.offer.offer_outlets.length) {
          def.reject("Atleast one outlet must be selected");
        } else {
          def.resolve(true);
        }
        return def.promise;
      }

      $scope.createOffer = function() {
        $http.post('/api/v4/offers?token=' + $rootScope.token, $scope.offer)
          .then(function(res) {
            if(res.data.response) {
              toastr.success('Offer creted successfully');
              $timeout(function() {
                $state.go('merchant.offers', {}, {
                  reload: true
                });
              }, 800);
            } else {
              console.log('err', res.data.data);
            }
          }, function(err) {
            console.log('err', err);
          })
      }

      $scope.backToStart = function() {
        WizardHandler.wizard().goTo(0);
      }


    }
  ])