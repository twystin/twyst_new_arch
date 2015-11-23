angular.module('merchantApp')
	.factory('merchantRESTSvc', ['$http', '$q', '$cookies',
		function($http, Q, $cookies) {
			var merchantRESTSvc = {};

			merchantRESTSvc.login = function(user) {
				var deferred = Q.defer();
				$http.post('/api/v4/accounts/login', user)
					.then(function(res) {
						deferred.resolve(res);
					}, function(err) {
						deferred.reject(err)
					});
				return deferred.promise;
			}

			merchantRESTSvc.logout = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/accounts/logout?token='+token).then(function(data) {
					if(!data.data.response) {
						deferred.reject(data.data);
					} else {
						deferred.resolve(data.data);
					}
				}, function(err) {
					deferred.reject(err);
				});
				return deferred.promise;
			}

			merchantRESTSvc.getOutlets = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets?token='+token)
					.then(function(data) {
						if (!data.data.response) {
							deferred.reject(data.data);
						} else {
							deferred.resolve(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.removeOutlet = function(outlet_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.delete('/api/v4/outlets/' + outlet_id + '?token=' + token)
					.then(function(data) {
						if (!data.data.response) {
							deferred.reject(data.data);
						} else {
							deferred.resolve(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.getOutlet = function(outlet_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets/' + outlet_id + '?token=' + token)
					.then(function(data) {
						if (!data.data.response) {
							deferred.reject(data.data);
						} else {
							deferred.resolve(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.createOffer = function(offer) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.post('/api/v4/offers?token=' + token, offer)
					.then(function(data) {
						if(!data.data.response) {
							deferred.reject(data.data);
						} else {
							deferred.resolve(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.getOffer = function(offer_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/offers/' + offer_id + "?token=" + token)
					.then(function(data) {
						if (data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.removeOffer = function(offer_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.delete('/api/v4/offers/' + offer_id + '?token=' + token)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.getBills = function(status, sort) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/events/list/upload_bill?token=' + token + '&status=' + status + '&sort=' + sort)
					.then(function(data) {
						console.log(data)
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.getBill = function(bill_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/events/retrieve/' + bill_id + '?token=' + token)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.updateBill = function(bill) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.put('/api/v4/events/update/' + bill._id + '?token=' + token, bill)
					.then(function(data) {
						console.log(data)
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.checkinUser = function(req_obj) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.post('/api/v4/checkin/panel?token=' + token, req_obj)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.getVoucherByCode = function(outlet_id, code) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets/' + outlet_id + '/code/' + code + "?token=" + token)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.getVouchersByPhone = function(outlet_id, phone) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets/' + outlet_id + '/phone/' + phone + '?token=' + token)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.redeemUserCoupon = function(outlet_id, code) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.post('/api/v4/outlets/redeem_user_coupon?token=' + token, {code: code, outlet_id: outlet_id})
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.getAllMenus = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/menu?token=' + token).then(
					function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(error) {
						deferred.reject(error);
					});
				return deferred.promise;
			}

			merchantRESTSvc.createMenu = function(req_obj) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.post('/api/v4/menu?token=' + token, req_obj).then(function(data) {
					if(data.data.response) {
						deferred.resolve(data.data);
					} else {
						deferred.reject(data.data);
					}
				}, function(error) {
					deferred.reject(error);
				});
				return deferred.promise;
			}

			merchantRESTSvc.getMenu = function(menu_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/menus/' + menu_id + '?token=' + token).then(function(data) {
					if (data.data.response) {
						deferred.resolve(data.data);
					} else {
						deferred.reject(data.data);
					}
				}, function(error) {
					deferred.reject(error);
				})
				return deferred.promise;
			}

			merchantRESTSvc.updateMenu = function(req_obj) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.put('/api/v4/menus/' + req_obj._id + '?token=' + token, req_obj).then(function(data) {
					if (data.data.response) {
						deferred.resolve(data.data);
					} else {
						deferred.reject(data.data);
					}
				}, function(err) {
					deferred.reject(err);
				});
				return deferred.promise;
			}

			merchantRESTSvc.deleteMenu = function(menu_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.delete('/api/v4/menus/' + menu_id + '?token=' + token).then(function(res) {
					if(data.data.response) {
						deferred.resolve(data.data);
					} else {
						deferred.reject(data.data);
					}
				}, function(err) {
					deferred.reject(err);
				})
				return deferred.promise;
			}

			return merchantRESTSvc;
		}
	])