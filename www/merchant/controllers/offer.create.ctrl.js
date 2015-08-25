angular.module('merchantApp')
	.controller('OfferCreateController', ['$scope', '$http', '$q',
		function($scope, $http, $q) {
			$scope.checkModelTimes = {};
			$scope.checkModelDays = {};
			$scope.minDate = new Date();
			
			$scope.offer_types = [{ text: 'Check In', value: 'checkin' }, { text: 'Offer', value: 'offer' }, { text: 'Deal', value: 'deal' }, { text: 'Bank Deal', value: 'bank_deal' }];

			$scope.offer_groups = [{ text: 'Group 1', value: 'group_1' }, { text: 'Group 2', value: 'group_2' }, { text: 'Group 3', value: 'group_3' }, { text: 'Group 4', value: 'group_4' }];

			$scope.event_match_set = [{ text: 'Recurring', value: 'every' }, { text: 'Only Once', value: 'only' }, { text: 'Every Time', value: 'after' }];

			$scope.event_types = [{ text: 'Check In', value: 'checkin' }, { text: 'Offer', value: 'offer' }, { text: 'Deal', value: 'deal' }, { text: 'Bank Deal', value: 'bank_deal' }];

			$scope.reward_types = [{ text: 'Buy one get one', value: 'buyonegetone' }, { text: 'Unlimited', value: 'unlimited' }, { text: 'Combo', value: 'combo' }, { text: 'Free', value: 'free' }, { text: 'Only Happy Hrs', value: 'onlyhappyhours' }, { text: 'Buffet', value: 'buffet' }, { text: 'Reduced Price', value: 'reduced price' }, { text: 'Discount', value: 'discount' }, { text: 'Custom', value: 'custom' }, { text: 'Flat Off', value: 'flatoff' }, { text: 'Happy Hours', value: 'happyhours' }];

			$scope.days_of_week = [{ text: 'Monday', value: 'monday' }, { text: 'Tuesday', value: 'tuesday' }, { text: 'Wednesday', value: 'wednesday' }, { text: 'Thursday', value: 'thursday' }, { text: 'Friday', value: 'friday' }, { text: 'Saturday', value: 'saturday' }, { text: 'Sunday', value: 'sunday' }, { text: 'All Days', value: 'all days' }];

			$scope.times_of_the_day = [{ text: 'Breakfast', value: 'breakfast' }, { text: 'Brunch', value: 'brunch' }, { text: 'Lunch', value: 'lunch' }, { text: 'Evening', value: 'evening' }, { text: 'Dinner', value: 'dinner' }, { text: 'All Day', value: 'all day' }];

			$scope.offer = {
				rule: {},
				actions: {
					reward: {
						reward_hours: {
				    		monday: {
				    			closed: false,
				    			timings: [{

				    			}]
				    		},
				    		tuesday: {
				    			closed: false,
				    			timings: [{

				    			}]
				    		},
				    		wednesday: {
				    			closed: false,
				    			timings: [{

				    			}]
				    		},
				    		thursday: {
				    			closed: false,
				    			timings: [{

				    			}]
				    		},
				    		friday: {
				    			closed: false,
				    			timings: [{

				    			}]
				    		},
				    		saturday: {
				    			closed: false,
				    			timings: [{

				    			}]
				    		},
				    		sunday: {
				    			closed: false,
				    			timings: [{

				    			}]
				    		}
				    	}
					}
				}
			};

			$scope.validateBasics = function() {
				console.log('validating basics');
				if(!_.has($scope.offer, 'actions.reward.title')) {
					$scope.handleErrors('Offer name required');
					return false;
				} else if(!_.has($scope.offer, 'actions.reward.detail')) {
					$scope.handleErrors('Offer description required');
					return false;
				} else if(!_.has($scope.offer, 'offer_group')) {
					$scope.handleErrors('Offer group required');
					return false;
				} else if(!_.has($scope.offer, 'offer_start_date')) {
					$scope.handleErrors("Offer start date required");
					return false;
				} else if(!_.has($scope.offer, 'offer_end_date')) {
					$scope.handleErrors("Offer end date required");
					return false;
				} else if(!_.has($scope.offer, 'offer_lapse_days')) {
					$scope.handleErrors("Offer lapse duration required");
					return false;
				} else {
					return true;
				}
			};

			$scope.validateSystem = function() {
				if(!_.has($scope.offer, 'offer_type')) {
					$scope.handleErrors("Choose an offer type");
					return false;
				} else if($scope.offer.offer_type == "bank_deal" && !_.has($scope.offer, 'offer_source')) {
					$scope.handleErrors("Offer source required for bank deal");
					return false;
				} else if($scope.offer.offer_type == "offer" && !_.has($scope.offer, 'offer_cost')) {
					$scope.handleErrors("Offer cost required for 'offer' offer type");
					return false;
				} else if(!_.has($scope.offer, 'rule.event_type')) {
					$scope.handleErrors("Offer event type required");
					return false;
				} else if($scope.offer.offer_type == "checkin" && !_.has($scope.offer, 'rule.event_match')) {
					$scope.handleErrors("Please choose an offer class");
					return false;
				} else if($scope.offer.offer_type == "checkin" && !_.has($scope.offer, 'rule.event_count')) {
					$scope.handleErrors("Pleaes provide an appropriate number of visits");
					return false;
				} else if($scope.offer.offer_type == "checkin" && !_.has($scope.offer, 'rule.friendly_text')) {
					$scope.handleErrors("Please provide a reward description");
					return false;
				} else {
					return true;
				}
			};

			$scope.validateNotifAndTimings = function() {
				if(!_.has($scope.offer, 'actions.message.sms') || !$scope.offer.actions.message.sms) {
					$scope.handleErrors("SMS notification message required");
					return false;
				} else if(!_.has($scope.offer, 'actions.message.email') || !$scope.offer.actions.message.email) {
					$scope.handleErrors("Email notification message required");
					return false;
				} else if(!_.has($scope.offer, 'actions.message.push') || !$scope.offer.actions.message.push) {
					$scope.handleErrors("Push notification message required");
					return false;
				}
				for(var i=0; i<$scope.offer.actions.reward.reward_hours.length; i++) {
					var sched = $scope.offer.actions.reward.reward_hours[i];
					if(!schedule.closed) {
						for(var j=0; i<schedule.timings.length; j++) {
							if ( ((schedule.timings[j].open.hr * 60) + schedule.timings[j].open.min + 60) < ((schedule.timings[j].close.hr * 60) + schedule.timings[j].close.min) ) {
								return false;
							}
						}
					}
				}
				return true;
				// return _.includes(_.map($scope.offer.actions.reward.reward_hours, function(schedule) {
				// 	if(schedule.closed === true) {
				// 		return true;
				// 	} else {
				// 		return _.reduce(schedule.timings, function(timing1, timing2) {
				// 			if(timing1 === false) {
				// 				return false;
				// 			} else if(timing1 === true) {
				// 				return ((timing2.open.hr * 60) + timing2.open.min + 60) > ((timing2.open.hr * 60) + timing2.close.min);
				// 			} else {
				// 				return (((timing2.open.hr * 60) + timing2.open.min + 60) > ((timing2.open.hr * 60) + timing2.close.min)) && (((timing2.open.hr * 60) + timing2.open.min + 60) > ((timing2.open.hr * 60) + timing2.close.min));
				// 			}
				// 		});
				// 	}
				// }), false);
					// async.each($scope.offer.actions.reward.reward_hours, function(schedule, callback) {
			  //           if(!schedule.closed) {
			  //               async.each(schedule.timings, function(timing, callback) {
			  //                   if(((timing.open.hr * 60) + timing.open.min + 60) > ((timing.close.hr * 60) + timing.close.min)) {
			  //                       callback(new Error("error"));
			  //                   }
			  //               }, function(err) {
			  //               	callback(err);
			  //               });
			  //           } else {
			  //           	callback();
			  //           }
			  //       }, function(err) {
			  //       	if(err) {

			  //       	}
			  //       		deferred.resolve(false);
			  //       	else 
			  //       		deferred.resolve(false);
			  //       });
			};

			$scope.validateDetails = function() {
				if(!_.has($scope.offer, 'actions.reward.terms')) {
					$scope.handleErrors("Terms and conditions required");
					return false;
				} else if(!_.has($scope.offer, 'actions.reward.header')) {
					$scope.handleErrors("Reward header required");
					return false;
				} else if(!_.has($scope.offer, 'actions.reward.expiry')) {
					$scope.handleErrors("Reward expiration information required");
					return false;
				} else if(!_.has($scope.offer, 'actions.reward.valid_days')) {
					$scope.handleErrors("Reward validity duration required");
					return false;
				} else if(!_.has($scope.offer, 'actions.reward.applicability.time_of_day') || $scope.offer.actions.reward.applicability.time_of_day.length ) {
					$scope.handleErrors("Choose times for which the offer is applicable");
					return false;
				} else if(!_.has($scope.offer, 'actions.reward.applicability.day_of_week') || $scope.offer.actions.reward.applicability.day_of_week.length ) {
					$scope.handleErrors("Choose days for which the offer is applicable");
					return false;
				} else if(!_.has($scope.offer, 'actions.reward.reward_meta.reward_type')) {
					$scope.handleErrors("Choose a valid reward type");
					return false;
				} else {
					var reward_meta = $scope.offer.actions.reward.reward_meta;
					if(reward_meta.reward_type=="discount" && (!_.has(reward_meta, 'discount.percentage') || !_.has(reward_meta, 'discount.max'))) {
						$scope.handleErrors("Discount details required");
						return false;
					} else if(reward_meta.reward_type=="flatoff" && (!_.has(reward_meta, 'flat.off') || !_.has(reward_meta, 'flat.spend'))) {
						$scope.handleErrors("Flat off details required");
						return false;
					} else if(reward_meta.reward_type=="free" && (!_.has(reward_meta, 'free.title') || !_.has(reward_meta, 'free._with'))) {
						$scope.handleErrors("Freebie details required");
						return false;
					} else if(reward_meta.reward_type=="buyonegetone" && !_.has(reward_meta, 'bogo.title')) {
						$scope.handleErrors("BOGO details required");
						return false;
					} else if(reward_meta.reward_type=='happyhours' && !_.has(reward_meta, 'happyhours.extension')) {
						$scope.handleErrors("Happy hours extension details required");
						return false;
					} else if(reward_meta.reward_type=='reduced price' && (!_.has(reward_meta, 'reduced.what') || !_.has(reward_meta, 'reduced.worth') || !_.has(reward_meta, 'reduced.for_what'))) {
						$scope.handleErrors("Reduced price details required");
						return false;
					} else if(reward_meta.reward_type=='custom' && !_.has(reward_meta, 'custom.text')) {
						$scope.handleErrors("Custom offer details required");
						return false;
					} else {
						return true;
					}
				}
				
			};

			$scope.handleErrors = function(err) {
				console.log('error', err);
			};

			$scope.updateTimings = function(day) {
				if($scope.offer.actions.reward.reward_hours[day].closed) {
					$scope.offer.actions.reward.reward_hours[day].timings = [];	
				} else {
					$scope.offer.actions.reward.reward_hours[day].timings = [{}];	
				}
			};

			$scope.initializeTiming = function(day, index) {
				if($scope.offer.actions.reward.reward_hours[day].timings[index].open || $scope.offer.actions.reward.reward_hours[day].timings[index].close) {
					return;
				}
				$scope.offer.actions.reward.reward_hours[day].timings[index] = {
					open: {hr: 0, min: 0},
					close: {hr: 0, min: 0}
				};
			};

			$scope.removeTiming = function(day, index) {
				$scope.offer.actions.reward.reward_hours[day].timings.splice(index, 1);
				$scope.checkTimingsValidity();
			};

			$scope.addNewTiming = function(day) {
				$scope.offer.actions.reward.reward_hours[day].timings.push({});
				$scope.checkTimingsValidity();
			};

			$scope.cloneToAllDays = function(the_day) {
		    	_.each($scope.offer.actions.reward.reward_hours, function(schedule, day) {
		    		if(day !== the_day) {
		    			schedule.timings = _.cloneDeep($scope.offer.actions.reward.reward_hours[the_day].timings);
		                schedule.closed = $scope.offer.actions.reward.reward_hours[the_day].closed;
		    		}
		    	});
		    	$scope.checkTimingsValidity();
		    };


			$scope.$watchCollection('checkModelTimes', function () {
				if(!Object.keys($scope.checkModelTimes).length) {
					return;
				}
				if(!$scope.offer.actions.reward.applicability) {
					$scope.offer.actions.reward.applicability = {};
				}
				console.log('checkModelTimes', $scope.checkModelTimes)
				var times_day = Object.keys(_.pick($scope.checkModelTimes, function(val, key) { return val; }));
				if(times_day.indexOf('all day') !== -1) {
					times_day = ['all day'];
					$scope.checkModelTimes = {'all day': true};
				}
				$scope.offer.actions.reward.applicability.time_of_day = times_day;
			});

			$scope.$watchCollection('checkModelDays', function () {
				if(!Object.keys($scope.checkModelDays).length) {
					return;
				}
				if(!$scope.offer.actions.reward.applicability) {
					$scope.offer.actions.reward.applicability = {};
				}
				console.log('checkModelDays', $scope.checkModelDays)
				var days_week = Object.keys(_.pick($scope.checkModelDays, function(val, key) { return val; }));
				if(days_week.indexOf('all days') !== -1) {
					days_week = ['all days'];
					$scope.checkModelDays = {'all days': true};
				}
				$scope.offer.actions.reward.applicability.day_of_week = days_week;
			});

			// $scope.$watchCollection('offer.actions.reward.reward_hours', function() {
			// 	console.log('checking');
			$scope.checkTimingsValidity = function() {
				$scope.timingsValid = true;
				_.each($scope.offer.actions.reward.reward_hours, function(schedule, day) {
					_.each(schedule.timings, function(timing) {
						console.log('timing', timing);
						if(timing.open && timing.close) {
							console.log(timing);
							console.log(((timing.open.hr * 60) + timing.open.min + 60) > ((timing.close.hr * 60) + timing.close.min));
							if( ((timing.open.hr * 60) + timing.open.min + 60) > ((timing.close.hr * 60) + timing.close.min) ) {
								$scope.timingsValid = false;
							}
						}
					});
				});
			};

			$scope.finishedWizard = function() {
				$http.post('/api/v4/offers', $scope.offer)
					.success(function(res) {
						console.log('res', res);
					})
					.error(function(err) {
						console.log('err', err);
					})
			}
			// });
		}
	]);