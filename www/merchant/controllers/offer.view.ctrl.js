angular.module('merchantApp')
  .controller('OfferViewController', ['$scope', 'merchantRESTSvc', '$stateParams', '$log',
    function($scope, merchantRESTSvc, $stateParams, $log) {

      merchantRESTSvc.getOutlets().then(function(data) { $scope.outlets = _.indexBy(data.data.outlets, '_id'); }, function(err) { $log.log('Could not get outlets - ' + err.message); $scope.outlets = []; });

      $scope.reward_types = { 'buyonegetone': 'Buy One Get One', 'discount': 'Discount', 'flatoff': 'Flat Off', 'free': 'Free', 'happyhours': 'Happy Hours', 'reduced': 'Reduced Price', 'custom': 'Custom', 'unlimited': 'Unlimited', 'onlyhappyhours': 'Only Happy Hours', 'combo': 'Combo', 'buffet': 'Buffet' };
      
      merchantRESTSvc.getOffer($stateParams.offer_group).then(function(data) {
        if (data.data.offer_cost) {
          data.data.offer_cost = data.data.offer_cost.toString();
        }
        $scope.offer = _.merge({}, data.data);
        delete $scope.offer._id;
        angular.forEach($scope.offer.actions.reward.reward_hours, function(schedule) {
          if (!schedule.closed) {
            angular.forEach(schedule.timings, function(timing) {
              timing.open.time = new Date(),
                timing.close.time = new Date();
              timing.open.time.setSeconds(0);
              timing.open.time.setMilliseconds(0);
              timing.close.time.setSeconds(0);
              timing.close.time.setMilliseconds(0);
              timing.open.time.setHours(timing.open.hr);
              timing.open.time.setMinutes(timing.open.min);
              timing.close.time.setHours(timing.close.hr);
              timing.close.time.setMinutes(timing.close.min);
            });
          }
        });
      }, function(err) {
        console.log('err', err);
      })
    }
  ])