angular.module('merchantApp')
    .controller('ImagePickerController', function($scope, $modalInstance) {
        $scope.images = {
            'north-indian': [
                'retwyst-merchants/default-images/north-indian/1', 'retwyst-merchants/default-images/north-indian/2',
                'retwyst-merchants/default-images/north-indian/3', 'retwyst-merchants/default-images/north-indian/4',
                'retwyst-merchants/default-images/north-indian/5', 'retwyst-merchants/default-images/north-indian/6',
                'retwyst-merchants/default-images/north-indian/7', 'retwyst-merchants/default-images/north-indian/8',
                'retwyst-merchants/default-images/north-indian/9', 'retwyst-merchants/default-images/north-indian/10',
                'retwyst-merchants/default-images/north-indian/11', 'retwyst-merchants/default-images/north-indian/12',
                'retwyst-merchants/default-images/north-indian/13', 'retwyst-merchants/default-images/north-indian/14',
                'retwyst-merchants/default-images/north-indian/15', 'retwyst-merchants/default-images/north-indian/16',
                'retwyst-merchants/default-images/north-indian/17', 'retwyst-merchants/default-images/north-indian/18',
                'retwyst-merchants/default-images/north-indian/19', 'retwyst-merchants/default-images/north-indian/20'
            ],
            'pizza': [
                'retwyst-merchants/default-images/pizza/1', 'retwyst-merchants/default-images/pizza/2'
            ],
            'wrap': [
                'retwyst-merchants/default-images/wrap/1', 'retwyst-merchants/default-images/wrap/2',
                'retwyst-merchants/default-images/wrap/3'
            ],
            'sandwich': [
                'retwyst-merchants/default-images/sandwich/1', 'retwyst-merchants/default-images/sandwich/2',
                'retwyst-merchants/default-images/sandwich/3'
            ],
            'burger': [
                'retwyst-merchants/default-images/burger/1', 'retwyst-merchants/default-images/burger/2',
                'retwyst-merchants/default-images/burger/3', 'retwyst-merchants/default-images/burger/4'
            ],
            'beverages': [
                'retwyst-merchants/default-images/beverages/1', 'retwyst-merchants/default-images/beverages/2',
                'retwyst-merchants/default-images/beverages/3', 'retwyst-merchants/default-images/beverages/4',
                'retwyst-merchants/default-images/beverages/5', 'retwyst-merchants/default-images/beverages/6',
                'retwyst-merchants/default-images/beverages/7', 'retwyst-merchants/default-images/beverages/8',
                'retwyst-merchants/default-images/beverages/9', 'retwyst-merchants/default-images/beverages/10'
            ],
            'desserts': [
                'retwyst-merchants/default-images/desserts/1', 'retwyst-merchants/default-images/desserts/2',
                'retwyst-merchants/default-images/desserts/3', 'retwyst-merchants/default-images/desserts/4',
                'retwyst-merchants/default-images/desserts/5', 'retwyst-merchants/default-images/desserts/6',
                'retwyst-merchants/default-images/desserts/7', 'retwyst-merchants/default-images/desserts/8',
                'retwyst-merchants/default-images/desserts/9', 'retwyst-merchants/default-images/desserts/10',
                'retwyst-merchants/default-images/desserts/11', 'retwyst-merchants/default-images/desserts/12',
                'retwyst-merchants/default-images/desserts/13', 'retwyst-merchants/default-images/desserts/14'
            ],
            'chinese': [
                'retwyst-merchants/default-images/chinese/1', 'retwyst-merchants/default-images/chinese/2',
                'retwyst-merchants/default-images/chinese/3', 'retwyst-merchants/default-images/chinese/4',
                'retwyst-merchants/default-images/chinese/5', 'retwyst-merchants/default-images/chinese/6',
                'retwyst-merchants/default-images/chinese/7', 'retwyst-merchants/default-images/chinese/8',
                'retwyst-merchants/default-images/chinese/9', 'retwyst-merchants/default-images/chinese/10',
                'retwyst-merchants/default-images/chinese/11', 'retwyst-merchants/default-images/chinese/12'
            ],
            'healthy-food': [
                'retwyst-merchants/default-images/healthy-food/1', 'retwyst-merchants/default-images/healthy-food/2',
                'retwyst-merchants/default-images/healthy-food/3', 'retwyst-merchants/default-images/healthy-food/4',
                'retwyst-merchants/default-images/healthy-food/5'
            ],
            'south-indian': [
                'retwyst-merchants/default-images/south-indian/1', 'retwyst-merchants/default-images/south-indian/2'
            ],
            'biryani': [
                'retwyst-merchants/default-images/biryani/1', 'retwyst-merchants/default-images/biryani/2',
                'retwyst-merchants/default-images/biryani/3', 'retwyst-merchants/default-images/biryani/4',
                'retwyst-merchants/default-images/biryani/5', 'retwyst-merchants/default-images/biryani/6',
                'retwyst-merchants/default-images/biryani/7', 'retwyst-merchants/default-images/biryani/8',
                'retwyst-merchants/default-images/biryani/9', 'retwyst-merchants/default-images/biryani/10'
            ]
        }

        $scope.image_types = {
            'north-indian': 'North Indian',
            'pizza': 'Pizza',
            'wrap': 'Wraps',
            'sandwich': 'Sandwiches',
            'burger': 'Burgers',
            'beverages': 'Beverages',
            'desserts': 'Desserts',
            'chinese': 'Chinese',
            'healthy-food': 'Healthy Food',
            'south-indian': 'South Indian',
            'biryani': 'Biryani'
        }

        $scope.chooseImage = function(image) {
            $modalInstance.close(image);
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        }
    })
