angular.module('merchantApp')
    .controller('MenuSubOptionController', function($scope, $modalInstance, sub_option, is_new, SweetAlert) {

        $scope.is_new = is_new;
        $scope.sub_option = sub_option;

        $scope.addValuePair = function() {
            $scope.sub_option.sub_option_set.push({
                is_vegetarian: true
            });
        };

        $scope.removeValuePair = function(index) {
        	$scope.sub_option.sub_option_set.splice(index, 1);
        };

        $scope.resolveSubOption = function() {
            if (!$scope.sub_option.sub_option_title) {
                SweetAlert.swal('Validation Error', 'Title required', 'error');
            } else if (!$scope.sub_option.sub_option_set || !$scope.sub_option.sub_option_set.length) {
                SweetAlert.swal('Validation Error', 'Please provide atleast one value pair', 'error');
            } else {
                async.each($scope.sub_option.sub_option_set, function(sub_option_obj, callback) {
                    if (!sub_option_obj.sub_option_value) {
                        callback('No sub option name can be left blank');
                    } else if (!sub_option_obj.sub_option_cost && sub_option_obj.sub_option_cost !== 0) {
                        callback('No sub option cost can be left blank');
                    } else {
                        callback();
                    }
                }, function(err) {
                    if (err) {
                        SweetAlert.swal('Validation Error', err);
                    } else {
                        $modalInstance.close($scope.sub_option);
                    }
                });
            }
        };

        $scope.discardSubOption = function() {
            $modalInstance.dismiss('Cancel');
        };

    });
