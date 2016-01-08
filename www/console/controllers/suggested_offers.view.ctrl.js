angular.module('consoleApp').controller('SuggestedOfferViewController', ['$scope', 'consoleRESTSvc', '$stateParams',
    function($scope, consoleRESTSvc, $stateParams) {
        consoleRESTSvc.getEvent($stateParams.suggested_offer_id).then(function(res) {
            console.log(res);
            $scope.offer = res.data;
        }, function(err) {
            console.log(err);
        });

        $scope.updateCheck = function(flag, value) {
            $scope[flag] = value;
        };

        $scope.loadOffers = function() {
            consoleRESTSvc.getOffers().then(function(res) {
                console.log(res);
                $scope.offers = _.filter(res.data, function(offer) {
                    return offer.offer_outlets.indexOf($scope.offer.event_outlet) !== -1 && offer.offer_user_source && offer.offer_user_source == $scope.offer.event_user;
                });
                console.log($scope.offers.length, res.data.length);
            }, function(err) {
                console.log(err);
            });
        };

        $scope.updateOfferId = function(item) {
            console.log(item);
            $scope.offer.event_meta.actual_offer = item._id;
        };

        $scope.processOffer = function() {
            console.log($scope.offer);
            if (!$scope.disable_input) {
                $scope.disable_input = true;
                var event_obj = _.cloneDeep($scope.offer);
                event_obj.event_meta.status = 'twyst_approved';
                delete event_obj.event_meta.user;
                consoleRESTSvc.updateEvent(event).then(function(res) {
                    $scope.disable_input = false;
                    event_obj.event_meta.user = $scope.offer.event_meta.user;
                    $scope.offer = _.cloneDeep(event_obj);
                    SweetAlert.swal('SUCCESS', 'Updated successfully', 'success');
                }, function(err) {
                    $scope.disable_input = false;
                    SweetAlert.swal('ERROR', err.message ? err.message : 'Error occured while trying to update', 'error');
                });
            }
        };

        $scope.rejectOffer = function() {
            if (!$scope.disable_input) {
                $scope.disable_input = true;
                var event = _.cloneDeep($scope.offer);
                event.event_meta.status = 'twyst_rejected';
                delete event.event_meta.user;
                if (!$scope.isValidInput) {
                    event.event_meta.rejected = true;
                    event.event_meta.reason = "Offer not valid for the outlet";
                } else if ($scope.offerOnTwyst) {
                    event.event_meta.rejected = true;
                    event.event_meta.reason = "Offer already on Twyst";
                }
                consoleRESTSvc.updateEvent(event).then(function(data) {
                    $scope.disable_input = false;
                    event.event_meta.user = $scope.offer.event_meta.user;
                    $scope.offer = _.cloneDeep(event);
                    SweetAlert.swal("SUCCESS", "Updated successfully", "success");
                }, function(err) {
                    $scope.disable_input = false;
                    SweetAlert.swal("ERROR", err.message ? err.message : 'Error occured while trying to update', "error");
                });
            }
        };
    }
])
