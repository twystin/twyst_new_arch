angular.module('consoleApp').factory('consoleRESTSvc', ['$http', '$q', '$cookies', 
		function($http, Q, $cookies) {
			var consoleRESTSvc = {};

			consoleRESTSvc.login = function(user) {
				var deferred = Q.defer();
				$http.post('/api/v4/accounts/login', user)
					.then(function(res) {
						deferred.resolve(res);
					}, function(err) {
						deferred.reject(err)
					});
				return deferred.promise;
			}

			consoleRESTSvc.logout = function() {
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

			consoleRESTSvc.registerMerchant = function(merchant) {
				var deferred = Q.defer();
				$http.post('/api/v4/auth/register', merchant)
					.success(function(res) {
						deferred.resolve(res);
					})
					.error(function(err) {
						deferred.reject(err);
					})
				return deferred.promise;
			}

			consoleRESTSvc.getEvents = function(event_type, status, sort) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/events/list/' + event_type + '?token=' + token + '&status=' + status + '&sort=' + sort)
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

			consoleRESTSvc.getEvent = function(event_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/events/retrieve/' + event_id + '?token=' + token)
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

			consoleRESTSvc.getBill = function(bill_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/events/retrieve/' + bill_id + '?token=' + token)
					.then(function(data) {
						if(data.data.response) {
							console.log(data)
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			consoleRESTSvc.updateBill = function(bill) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.put('/api/v4/events/update/' + bill._id + '?token=' + token, bill)
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

			consoleRESTSvc.getAllOutlets = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets?token=' + token)
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

			consoleRESTSvc.getOutlet = function(outlet_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets/' + outlet_id + '?token=' + token)
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

			consoleRESTSvc.getAllOffers = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/offers?token=' + token)
					.then(function(data) {
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

			consoleRESTSvc.getOffer = function(offer_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/offers/' + offer_id + '?token=' + token)
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

			consoleRESTSvc.updateOutletStatus = function(outlet) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.put('/api/v4/outlets/' + outlet._id + '?token=' + token, outlet)
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

			consoleRESTSvc.updateOfferStatus = function(offer) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.put('/api/v4/offers/' + offer._id + '?token=' + token, offer)
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

			consoleRESTSvc.getQRs = function(outlet_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/qr?token=' + token + '&outlet=' + outlet_id)
					.then(function(data) {
						console.log(data);
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						console.log(err);
						deferred.reject(err);
					});
				return deferred.promise;
			}

			consoleRESTSvc.createQr = function(req_obj) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.post('/api/v4/qr/outlets?token=' + token, req_obj)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						console.log(err);
						deferred.reject(err);
					});
				return deferred.promise;
			}

			consoleRESTSvc.getMerchantAccounts = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets?token=' + token)
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

			return consoleRESTSvc;
		}
	])