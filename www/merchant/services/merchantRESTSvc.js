angular.module('merchantApp')
    .factory('merchantRESTSvc', ['$http', '$q', '$cookies',
        function($http, $q, $cookies) {
            var merchantRESTSvc = {};

            merchantRESTSvc.login = function(user) {
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
            }

            merchantRESTSvc.logout = function() {
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
            }

            merchantRESTSvc.getOutlets = function() {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/outlets?token=' + token)
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
            }

            merchantRESTSvc.getOutlet = function(outlet_id) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/outlets/' + outlet_id + '?token=' + token)
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
            }

            merchantRESTSvc.updateOutlet = function(outlet) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.put('/api/v4/outlets/' + outlet._id + '?token=' + token, outlet)
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
            }

            merchantRESTSvc.deleteOutlet = function(outlet_id) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.delete('/api/v4/outlets/' + outlet_id + '?token=' + token)
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
            }

            merchantRESTSvc.createOffer = function(offer) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.post('/api/v4/offers?token=' + token, offer)
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
            }

            merchantRESTSvc.getOffer = function(offer_id) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/offers/' + offer_id + '?token=' + token)
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
            }

            merchantRESTSvc.updateOffer = function(offer) {
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

            merchantRESTSvc.deleteOffer = function(offer_id) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.delete('/api/v4/offers/' + offer_id + '?token=' + token)
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
            }

            merchantRESTSvc.getBills = function(status, sort) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/events/list/upload_bill?token=' + token + '&status=' + status + '&sort=' + sort)
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
            }

            merchantRESTSvc.getBill = function(bill_id) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/events/retrieve/' + bill_id + '?token=' + token)
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
            }

            merchantRESTSvc.updateBill = function(bill) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.put('/api/v4/events/update/' + bill._id + '?token=' + token, bill)
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
            }

            merchantRESTSvc.checkinUser = function(req_obj) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.post('/api/v4/checkin/panel?token=' + token, req_obj)
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
            }

            merchantRESTSvc.getVoucherByCode = function(outlet_id, code) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/outlets/' + outlet_id + '/code/' + code + '?token=' + token)
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
            }

            merchantRESTSvc.getVouchersByPhone = function(outlet_id, phone) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/outlets/' + outlet_id + '/phone/' + phone + '?token=' + token)
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
            }

            merchantRESTSvc.redeemUserCoupon = function(outlet_id, code) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.post('/api/v4/outlets/redeem_user_token?token=' + token, {
                        code: code,
                        outlet_id: outlet_id
                    })
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
            }

            merchantRESTSvc.getAllMenus = function() {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/menu?token=' + token)
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
            }

            merchantRESTSvc.getMenu = function(menu_id) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.get('/api/v4/menus/' + menu_id + '?token=' + token)
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
            }

            merchantRESTSvc.createMenu = function(menu_obj) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.post('/api/v4/menu?token=' + token, menu_obj)
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
            }

            merchantRESTSvc.updateMenu = function(menu_obj) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.put('/api/v4/menus/' + menu_obj._id + '?token=' + token)
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
            }

            merchantRESTSvc.cloneMenu = function(menu_id, outlet_id) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.post('/api/v4/menus/clone?token=' + token, {
                    menu: menu_id,
                    outlet: outlet_id
                }).then(function(res) {
                    if (res.data.response) {
                        deferred.resolve(res.data);
                    } else {
                        deferred.reject(res.data);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }

            merchantRESTSvc.deleteMenu = function(menu_id) {
                var deferred = $q.defer();
                var token = $cookies.get('token');
                $http.delete('/api/v4/menus/' + menu_id + '?token=' + token)
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
            }

            merchantRESTSvc.getLocations = function() {
                var deferred = $q.defer();
                $http.get('/api/v4/locations')
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
            }

            return merchantRESTSvc;
        }
    ]);
