angular.module('consoleApp').factory('consoleRESTSvc', ['$http', '$q', '$cookies', '$localStorage',
    function($http, $q, $cookies, $localStorage) {
        var consoleRESTSvc = {};

        consoleRESTSvc.login = function(user) {
            var deferred = $q.defer();
            $http.post('/api/v4/accounts/login', user)
                .then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        consoleRESTSvc.logout = function() {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/accounts/logout?token=' + token)
                .then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        consoleRESTSvc.refreshOutlets = function() {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/outlets?token=' + token)
                .then(function(res) {
                    console.log(res);
                    if (res.data.response) {
                        // $localStorage['outlets'] = angular.toJson(res.data);
                        deferred.resolve(res.data);
                    } else {
                        // $localStorage['outlets'] = [];
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    $localStorage['outlets'] = [];
                    console.log(err);
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        consoleRESTSvc.refreshOffers = function() {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/offers?token=' + token)
                .then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        consoleRESTSvc.refreshQRs = function() {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/qr?token=' + token)
                .then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        consoleRESTSvc.getOutlets = function() {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/outlets?token=' + token)
                .then(function(res) {
                    console.log(res);
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };


        /*==================================
        =            OFFER APIs            =
        ==================================*/

        consoleRESTSvc.getOffers = function() {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/offers?token=' + token)
                .then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        consoleRESTSvc.getOffer = function(offer_id) {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/offers/' + offer_id + '?token=' + token).then(function(res) {
                if (res.data.response) {
                    deferred.resolve(res.data);
                } else {
                    deferred.reject(res.data);
                }
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };

        consoleRESTSvc.updateOfferStatus = function(offer) {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.put('/api/v4/offers/' + offer._id + '?token=' + token, offer)
                .then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        consoleRESTSvc.getQRs = function() {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/qr?token=' + token)
                .then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };


        /*===================================
        =            EVENTS APIs            =
        ===================================*/

        consoleRESTSvc.getAllEvents = function(event_type) {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/events/list/' + event_type + '?token=' + token)
                .then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };

        consoleRESTSvc.getEvent = function(event_id) {
            var deferred = $q.defer();
            var token = $cookies.get('token');
            $http.get('/api/v4/events/retrieve/' + event_id + '?token=' + token).then(function(res) {
                if (res.data.response) {
                    deferred.resolve(res.data);
                } else {
                    deferred.reject(res.data);
                }
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };

        return consoleRESTSvc;
    }
])
