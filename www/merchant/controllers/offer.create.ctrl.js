angular.module('merchantApp')
  .controller('OfferCreateController', ['$scope', '$http', '$q', 'toastr', 'merchantRESTSvc', '$rootScope', '$log', '$timeout', '$state', 'WizardHandler', '$modal',
    function($scope, $http, Q, toastr, merchantRESTSvc, $rootScope, $log, $timeout, $state, WizardHandler, $modal) {

      $scope.isPaying = $rootScope.isPaying;
      merchantRESTSvc.getOutlets().then(function(data) {
        $scope.outlets = _.indexBy(data.data.outlets, '_id');
      }, function(err) {
        $log.log('Could not get outlets - ' + err.message);
        $scope.outlets = [];
      });
      $scope.menus = [];
      merchantRESTSvc.getAllMenus().then(function(res) {
        _.each(res.data, function(menu) {
          if (!$scope.outlet_id) {
            $scope.outlet_id = menu.outlet;
            $scope.menus.push(menu);
            console.log('menu', menu);
          } else if($scope.outlet_id === menu.outlet) {
            $scope.menus.push(menu);
          }
        })
      }, function(error) {
        console.log(err);
      });

      $scope.today = new Date();
      $scope.max_date = new Date($scope.today.getTime() + (2 * 365 * 24 * 60 * 60 * 1000));
      $scope.today.setMinutes(0);
      $scope.today.setHours(0);
      $scope.today.setSeconds(0);
      $scope.today.setMilliseconds(0);

      $scope.chooseItem = function(text, item_only) {
        var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'chooseItemTemplate.html',
          controller: 'ChooseItemController',
          size: 'lg',
          resolve: {
            item_only: function() {
              return item_only;
            }
          }
        });

        modalInstance.result.then(function(choice) {

          if (text === 'buyxgety_1') {
            $scope.offer.actions.reward.reward_meta.item_x = choice;
            $scope.offer.offer_items = _.extend($scope.offer.offer_items, choice);
          } else if (text === 'buyxgety_2') {
            $scope.offer.actions.reward.reward_meta.item_y = choice;
          } else if (text === 'free') {
            $scope.offer.actions.reward.reward_meta.item_free = choice;
            $scope.offer.offer_items = _.extend($scope.offer.offer_items, choice);
          } else if (text === '') {
            $scope.offer.offer_items = _.extend($scope.offer.offer_items, choice);
          } else {
            $scope.offer.offer_items = _.extend($scope.offer.offer_items, choice);
          }
        }, function(err) {
          console.log('Modal dismissed at: ', new Date());
          if(err) {
            toastr.error(err, "ERROR");
          }
        });
      }

      $scope.offer = {
        offer_status: 'active',
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
        },
        offer_items: {
          all: true,
        }
      }

      $scope.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      $scope.offer_types = { 'checkin': 'Checkin Offer', 'offer': 'Offer', 'deal': 'Deal', 'bank_deal': 'Bank Deal' }
      $scope.reward_types = {'discount': 'Discount', 'flatoff': 'Flat Off', 'free': 'Free'};
      $scope.offer_sources = { 'HDFC': 'HDFC Bank', 'SBI': 'State Bank Of India', 'HSBC': 'HSBC Bank', 'Citi Bank': 'Citi Bank', 'Axis Bank': 'Axis Bank', 'ICICI': 'ICICI Bank', 'American Express': 'American Express' };
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
        }

        if (newVal.reward_type == "buyxgety") {
          if (newVal.item_x && newVal.item_y) {
            $scope.getBuyXGetYRewards().then(function(rewards) {
              console.log('rewards', rewards);
              $scope.offer.actions.reward.header = 'FREE';
              $scope.offer.actions.reward.line1 = rewards.item_x;
              $scope.offer.actions.reward.line2 = 'WITH ' + rewards.item_y;
            }, function() {
              $scope.offer.actions.reward.header = '';
              $scope.offer.actions.reward.line1 = '';
              $scope.offer.actions.reward.line2 = '';
            });
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
          if (newVal.item_free) {
            $scope.getFreeItemReward().then(function(text_obj) {
              $scope.offer.actions.reward.reward_meta.free_item_name = text_obj.item_free;
              $scope.offer.actions.reward.header = 'Free';
              $scope.offer.actions.reward.line1 = text_obj.item_free;
              $scope.offer.actions.reward.line2 = '';
            }, function(err) {
              $scope.offer.actions.reward.header = 'test';
              $scope.offer.actions.reward.line1 = 'test';
              $scope.offer.actions.reward.line2 = 'test';
            });
          } else {
            $scope.offer.actions.reward.header = '';
            $scope.offer.actions.reward.line1 = '';
            $scope.offer.actions.reward.line2 = '';
          }
        }

      });

      $scope.scrollToTop = function() {
        $('document').ready(function() {
            $(window).scrollTop(0);
        });
      }

      $scope.validateStep1 = function() {
        var deferred = Q.defer();

        var _handleErrors = function(err) {
          $scope.formFailure = true;
          toastr.error(err, "Error");
          deferred.reject();
        };

        $scope.validateOfferType().then(function() {
          $scope.validateOfferRules().then(function() {
            $scope.validateRewardDetails().then(function() {
              $scope.validateRewardInfo().then(function() {
                $scope.scrollToTop();
                $scope.formFailure = false;
                deferred.resolve(true);
              }, _handleErrors)
            }, _handleErrors)
          }, _handleErrors)
        }, _handleErrors);
          
          
          
        return deferred.promise;
      }

      $scope.validateStep2 = function() {
        var deferred = Q.defer();

        var _handleErrors = function(err) {
          $scope.formFailure = true;
          toastr.error(err, "Error");
          deferred.reject();
        };

        $scope.validateOfferTerms().then(function() {
          $scope.validateOfferTimings().then(function() {
            $scope.validateAgainstOutlets().then(function() {
              $scope.validateOfferValidity().then(function() {
                $scope.scrollToTop();
                $scope.formFailure = false;
                deferred.resolve(true);
              }, _handleErrors)
            }, _handleErrors)
          }, _handleErrors)
        }, _handleErrors)

        return deferred.promise;
      }

      $scope.validateOfferType = function() {
        var def = Q.defer();
        if (!$scope.offer.offer_type) {
          def.reject("Offer type must be selected");
        } else if ($scope.offer.user_sourced && (!$scope.offer.offer_user_source || !/.{24}/i.test($scope.offer.offer_user_source))) {
          def.reject("Valid offer user ID required for user sourced offer");
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
        } else if ($scope.offer.actions.reward.reward_meta.reward_type == 'buyxgety') {
          if (!$scope.offer.actions.reward.reward_meta.item_x) {
            def.reject("Buy X Get y requires 'FREE ITEM'");
          } else if (!$scope.offer.actions.reward.reward_meta.item_y) {
            def.reject("Buy X Get y requires 'PAID ITEM'");
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
          if (!$scope.offer.actions.reward.reward_meta.item_free) {
            def.reject("Free offer requires 'FREE ITEM' to be selected");
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
        if(!$scope.offer.offer_outlets || !$scope.offer.offer_outlets.length) {
          def.reject("Select atleast one outlet");
        } else {
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
                  def.reject(err);
              } else {
                  def.resolve(true);
              }
          });
        }
        return def.promise;
      }

      $scope.validateAgainstOutlets = function() {
        var def = Q.defer();
        async.each(Object.keys($scope.offer.actions.reward.reward_hours), function(day, callback) {
          var offer_schedule = $scope.offer.actions.reward.reward_hours[day];
          if(offer_schedule.closed) {
            callback();
          } else {
            async.each(offer_schedule.timings, function(offer_timing, callback) {
              var offerOpenMin = (offer_timing.open.hr * 60) + offer_timing.open.min,
                offerCloseMin = (offer_timing.close.hr * 60) + offer_timing.close.min;
              async.each($scope.offer.offer_outlets, function(outletId, callback) {
                var outlet = $scope.outlets[outletId];
                var outlet_schedule = outlet.business_hours[day];

                if(offerCloseMin<=offerOpenMin) {
                  offerCloseMin += (24*60);
                }

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
                  }, function(found_or_err) {
                    callback(found_or_err);
                  });
                }
              }, function(found_or_err) {
                if(found_or_err=='found') {
                  callback();
                } else if (found_or_err) {
                  callback(err);
                } else {
                  callback("Offer available on " + day.toUpperCase() + " outside the timings for all outlets");
                }
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
        if (!$scope.offer.offer_start_date || $scope.offer.offer_end_date > $scope.max_date) {
          def.reject("Offer requires valid start date")
        } else if (!$scope.offer.offer_end_date || $scope.offer.offer_end_date > $scope.max_date) {
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

      $scope.getBuyXGetYRewards = function() {
        var deferred = Q.defer();
        $scope.getRewardName($scope.offer.actions.reward.reward_meta.item_x).then(function(item_x) {
          $scope.getRewardName($scope.offer.actions.reward.reward_meta.item_y).then(function(item_y) {
            deferred.resolve({
              item_x: item_x,
              item_y: item_y
            });
          })
        })
        return deferred.promise;
      }

      $scope.getFreeItemReward = function() {
        var deferred = Q.defer();
        $scope.getRewardName($scope.offer.actions.reward.reward_meta.item_free).then(function(reward) {
          deferred.resolve({
            item_free: reward
          });
        }, function(err) {
          deferred.reject();
          console.log('error', err);
        })
        return deferred.promise;
      }

      $scope.getItemName = function(item) {
        $scope.getRewardName(item).then(function(name) {
          console.log(name);
          return '123';
        }, function(err) {
          return 'asd';
        })
      }

      $scope.getRewardName = function(item_obj) {
        var deferred = Q.defer();
        async.each($scope.menus, function(menu, callback) {
          console.log(menu._id, item_obj.menu_id, menu._id !== item_obj.menu_id, 'menu');
          if(menu._id !== item_obj.menu_id) {
            callback();
          } else {
            async.each(menu.menu_categories, function(category, callback) {
              console.log(category._id, item_obj.category_id, category._id !== item_obj.category_id, 'category');
              if(category._id !== item_obj.category_id) {
                callback();
              } else if(!item_obj.sub_category_id) {
                  callback(category.category_name + " (Category)");
              } else {
                async.each(category.sub_categories, function(sub_category, callback) {
                  console.log(sub_category._id, item_obj.sub_category_id, sub_category._id !== item_obj.sub_category_id, 'sub category');
                  if(sub_category._id !== item_obj.sub_category_id) {
                    callback();
                  } else if (!item_obj.item_id) {
                    callback(sub_category.sub_category_name + " (Sub Category)");
                  } else {
                    async.each(sub_category.items, function(item, callback) {
                      console.log(item._id, item_obj.item_id, item._id !== item_obj.item_id, 'item');
                      if(item._id !== item_obj.item_id) {
                        callback();
                      } else if (!item_obj.option_id) {
                        callback(item.item_name);
                      } else {
                        async.each(item.options, function(option, callback) {
                          console.log(option._id, item_obj.option_id, option._id !== item_obj.option_id, 'option');
                          if(option._id !== item_obj.option_id) {
                            callback();
                          } else if (!item_obj.sub_option_id && !item_obj.addon_id) {
                            callback(option.option_value + ' ' + item.item_name + '(Option)')
                          } else if (item_obj.sub_option_id) {
                            async.each(option.sub_options, function(sub_option, callback) {
                              console.log(sub_option._id, item_obj.sub_option_id, sub_option._id !== item_obj.sub_option_id, 'sub option');
                              if(sub_option._id !== item_obj.sub_option_id) {
                                callback();
                              } else if (!item_obj.sub_option_set_id) {
                                callback(sub_option.sub_option_title + ' ' + item.item_name + ' (Sub option)');
                              } else {
                                async.each(sub_option.sub_option_set, function(sub_option_obj, callback) {
                                  console.log(sub_option_obj._id, item_obj.sub_option_set_id, sub_option_obj._id !== item_obj.sub_option_set_id, 'sub option obj');
                                  if (sub_option_obj._id !== item_obj.sub_option_set_id) {
                                    callback();
                                  } else {
                                    callback(sub_option_obj.sub_option_value + ' ' + item.item_name + ' (sub option obj)');
                                  }
                                }, function(item_name) {
                                  callback(item_name);
                                });
                              }
                            }, function(item_name) {
                              callback(item_name);
                            })
                          } else if (item_obj.addon_id) {
                            async.each(option.addons, function(addon, callback) {
                              console.log(addon._id, item_obj.addon_id, addon._id !== item_obj.addon_id, 'addon');
                              if (addon._id !== item_obj.addon_id) {
                                callback();
                              } else if (!item_obj.addon_set_id) {
                                callback(addon.addon_title + ' ' + item.item_name + '(addon)');
                              } else {
                                async.each(addon.addon_set, function(addon_obj, callback) {
                                  console.log(addon_obj._id, item_obj.addon_set_id, addon_obj._id !== item_obj.addon_set_id, 'addon obj');
                                  if (addon_obj._id !== item_obj.addon_set_id) {
                                    callback();
                                  } else {
                                    callback(addon_obj.addon_value + ' ' + item.item_name + '(addon obj)');
                                  }
                                }, function(item_name) {
                                  callback(item_name);
                                });
                              }
                            }, function(item_name) {
                              callback(item_name);
                            });
                          }
                        }, function(item_name) {
                          callback(item_name);
                        });
                        // async.each(item.options, function(option, callback) {
                        //   if (option._id !== item_obj.option_id) {
                        //     callback();
                        //   } else if (!item_obj.sub_option_id && !item_obj.addon_id) {
                        //     callback(option.option_value + " " + item.item_name);
                        //   } else if (item_obj.sub_option_id) {
                        //     async.each(option.sub_options, function(sub_option, callback) {
                        //       if(sub_option._id !== item_obj.sub_option_id) {
                        //         callback();
                        //       } else if (!item_obj.sub_option_set_id) {
                        //         callback(option_set.option_name + ' ' + sub_option.sub_option_title + ' ' + item.item_name);
                        //       } else  {
                        //         async.each(sub_option.sub_option_set, function(sub_option_obj, callback) {
                        //           if (sub_option_obj.)
                        //         })
                        //       }
                        //     }, function(item_name) {
                        //       callback(item_name);
                        //     });
                        //   } else {
                        //     async.each(option_set.addons, function(addon, callback) {
                        //       if(addon._id !== item_obj.addon) {
                        //         callback();
                        //       } else {
                        //         callback(option_set.option_set_name + ' ' + item.item_name + ' with ' + addon.addon_name);
                        //       }
                        //     }, function(item_name) {
                        //       callback(item_name);
                        //     });
                        //   }
                        // }, function(item_name) {
                        //   callback(item_name);
                        // });
                      }
                    }, function(item_name) {
                      callback(item_name);
                    })
                  }
                }, function(item_name) {
                  callback(item_name);
                })
              }
            }, function(item_name) {
              callback(item_name);
            })
          }
        }, function(item_name) {
          if(item_name) {
            deferred.resolve(item_name);
          } else {
            deferred.reject("error");
          }
        })
        return deferred.promise;
      }
    }
  ]).controller('ChooseItemController', function($scope, $modalInstance, toastr, merchantRESTSvc, item_only) {
    $scope.item_only = item_only || false;
    $scope.menus = [];
    $scope.categories = [];
    $scope.sub_categories = [];
    $scope.items = [];
    $scope.option_sets = [];
    $scope.sub_option_sets = {};
    $scope.addon_sets = {};
    $scope.choice_option_id = '';
    $scope.options = [];
    $scope.choice = {};

    $scope.$watchCollection('sub_option_sets', function(newVal, oldVal) {
      if(newVal===undefined) {
        return;
      }
      $scope.choice.sub_options = [];
      $scope.choice.sub_options = _.compact(_.map(newVal, function(val, key) { return val?key:false; }));
    });

    $scope.$watchCollection('addon_sets', function(newVal, oldVal) {
      if(newVal===undefined) {
        return;
      }
      $scope.choice.addons = [];
      $scope.choice.addons = _.compact(_.map(newVal, function(val, key) { return val?key:false; }));
    });

    merchantRESTSvc.getAllMenus().then(function(res) {
      _.each(res.data, function(menu) {
        if (!$scope.outlet_id) {
          $scope.outlet_id = menu.outlet;
          $scope.menus.push(menu);
        } else if($scope.outlet_id === menu.outlet) {
          $scope.menus.push(menu);
        }
      })
    }, function(error) {
      console.log(err);
    });

    $scope.menuSelected = function() {
      if (!$scope.choice.menu_id) {
        return;
      }
      _.each($scope.menus, function(menu) {
        if (menu._id === $scope.choice.menu_id) {
          $scope.categories = _.clone(menu.menu_categories);
        }
      });
      $scope.choice.category_id = '';
      $scope.choice.sub_category_id = '';
      $scope.choice.item_id = '';
      $scope.sub_categories = [];
      $scope.items = [];
      $scope.options = [];
    }

    $scope.categorySelected = function() {
      if (!$scope.choice.category_id) {
        return;
      }
      _.each($scope.categories, function(category) {
        if (category._id === $scope.choice.category_id) {
          $scope.sub_categories = _.clone(category.sub_categories);
        }
      });
      $scope.choice.sub_category_id = '';
      $scope.choice.item_id = '';
      $scope.items = [];
      $scope.options = [];
    }

    $scope.subCategorySelected = function() {
      if (!$scope.choice.sub_category_id) {
        return;
      }
      _.each($scope.sub_categories, function(sub_category) {
        if (sub_category._id === $scope.choice.sub_category_id) {
          $scope.items = _.clone(sub_category.items);
        }
      })
      $scope.choice.item_id = '';
      $scope.options = [];
    }

    $scope.itemSelected = function() {
      if (!$scope.choice.item_id) {
        return;
      }
      _.each($scope.items, function(item) {
        if(item._id === $scope.choice.item_id) {
          $scope.option_title = item.option_title;
          $scope.option_sets = [{option_title: item.option_title, options: item.options}];
          console.log($scope.option_sets);
        }
      })
    }

    $scope.optionChoosen = function(option) {
      console.log('option', option);
      if (!option) {
        return;
      }
      $scope.choice.option_id = option._id;
      $scope.option_sets = $scope.option_sets.slice(0, 1);
      $scope.option_sets = $scope.option_sets.concat(option.sub_options).concat(option.addons);
    }

    $scope.pickMenu = function() {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu")
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: undefined,
          sub_category_id: undefined,
          item_id: undefined,
          option_id: undefined,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.pickCategory = function() {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected category");
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: $scope.choice.category_id,
          sub_category_id: undefined,
          item_id: undefined,
          option_id: undefined,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.pickSubCategory = function() {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected category");
      } else if (!$scope.choice.sub_category_id) {
        $modalInstance.dismiss("Error looking up selected sub category");
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: $scope.choice.category_id,
          sub_category_id: $scope.choice.sub_category_id,
          item_id: undefined,
          option_id: undefined,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.pickItem = function() {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected category");
      } else if (!$scope.choice.sub_category_id) {
        $modalInstance.dismiss("Error looking up selected sub category");
      } else if (!$scope.choice.item_id) {
        $modalInstance.dismiss("Error looking up selected item");
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: $scope.choice.category_id,
          sub_category_id: $scope.choice.sub_category_id,
          item_id: $scope.choice.item_id,
          option_id: undefined,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.pickOptionSet = function(index) {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected category");
      } else if (!$scope.choice.sub_category_id) {
        $modalInstance.dismiss("Error looking up selected sub category");
      } else if (!$scope.choice.item_id) {
        $modalInstance.dismiss("Error looking up selected item");
      } else if (!$scope.options || !$scope.options[index]) {
        $modalInstance.dismiss("Option set out of bounds");
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: $scope.choice.category_id,
          sub_category_id: $scope.choice.sub_category_id,
          item_id: $scope.choice.item_id,
          option_id: $scope.options[index]._id,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.pickSubOption = function(option_id, sub_option_id) {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected category");
      } else if (!$scope.choice.sub_category_id) {
        $modalInstance.dismiss("Error looking up selected sub category");
      } else if (!$scope.choice.item_id) {
        $modalInstance.dismiss("Error looking up selected item");
      } else if (!option_id) {
        $modalInstance.dismiss("error looking up selected option");
      } else if (!sub_option_id) {
        $modalInstance.dismiss("Sub option out of bounds");
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: $scope.choice.category_id,
          sub_category_id: $scope.choice.sub_category_id,
          item_id: $scope.choice.item_id,
          option_id: option_id,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.pickSubOptionObj = function(option_id, sub_option_id, sub_option_obj_id) {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected category");
      } else if (!$scope.choice.sub_category_id) {
        $modalInstance.dismiss("Error looking up selected sub category");
      } else if (!$scope.choice.item_id) {
        $modalInstance.dismiss("Error looking up selected item");
      } else if (!option_id) {
        $modalInstance.dismiss("error looking up selected option");
      } else if (!sub_option_id) {
        $modalInstance.dismiss("Sub option out of bounds");
      } else if (!sub_option_obj_id) {
        $modalInstance.dismiss("Sub option value out of bounds");
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: $scope.choice.category_id,
          sub_category_id: $scope.choice.sub_category_id,
          item_id: $scope.choice.item_id,
          option_id: option_id,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.pickAddon = function(option_id, addon_id) {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected category");
      } else if (!$scope.choice.sub_category_id) {
        $modalInstance.dismiss("Error looking up selected sub category");
      } else if (!$scope.choice.item_id) {
        $modalInstance.dismiss("Error looking up selected item");
      } else if (!option_id) {
        $modalInstance.dismiss("error looking up selected option set");
      } else if (!addon_id) {
        $modalInstance.dismiss("Addon out of bounds");
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: $scope.choice.category_id,
          sub_category_id: $scope.choice.sub_category_id,
          item_id: $scope.choice.item_id,
          option_id: option_id,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.pickAddonObj = function(option_id, addon_id, addon_obj_id) {
      if (!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected category");
      } else if (!$scope.choice.sub_category_id) {
        $modalInstance.dismiss("Error looking up selected sub category");
      } else if (!$scope.choice.item_id) {
        $modalInstance.dismiss("Error looking up selected item");
      } else if (!option_id) {
        $modalInstance.dismiss("error looking up selected option");
      } else if (!addon_id) {
        $modalInstance.dismiss("Addon out of bounds");
      } else if (!addon_obj_id) {
        $modalInstance.dismiss("Addon value out of bounds");
      } else {
        $modalInstance.close({
          menu_id: $scope.choice.menu_id,
          category_id: $scope.choice.category_id,
          sub_category_id: $scope.choice.sub_category_id,
          item_id: $scope.choice.item_id,
          option_id: option_id,
          sub_options: [],
          addons: []
        });
      }
    }

    $scope.finaliseItem = function() {
      if(!$scope.choice.menu_id) {
        $modalInstance.dismiss("Error looking up selected menu");
      } else if (!$scope.choice.category_id) {
        $modalInstance.dismiss("Error looking up selected cateory");
      } else if (!$scope.choice.sub_category_id) {
        $modalInstance.dismiss("Error looking up selected sub category");
      } else if (!$scope.choice.item_id) {
        $modalInstance.dismiss("Error looking up selected item");
      } else if (!$scope.choice.option_id && $scope.option_sets.length && $scope.option_sets[0].options.length) {
        $modalInstance.dismiss("Error looking up selected option");
      } else {
        $modalInstance.close($scope.choice);
      }
    }

  });