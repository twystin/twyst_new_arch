angular.module('merchantApp').controller('OrderViewController', function($scope, $modalInstance, order, merchantRESTSvc) {
    console.log('order', order);

    $scope.order = order;

    $scope.getItemPrice = function(item) {
        var price = 0;
        if (!item.option || !item.option._id) {
            return item.item_price;
        } else {
            price += item.option.option_cost;
            _.each(item.sub_options, function(sub_option) {
                price += sub_option.sub_option_set[0].sub_option_cost;
            });
            _.each(item.addons, function(addon) {
                _.each(addon.addon_set, function(addon_obj) {
                    price += addon_obj.addon_cost;
                });
            });
            return price;
        }
    };

    $scope.getItemTotal = function() {
        var item_total = 0;
        _.each(order.items, function(item) {
            if (!item.option || !item.option._id) {
                item_total += item.item_price;
            } else {
                var price = item.option.option_cost;
                _.each(item.sub_options, function(sub_option) {
                    price += sub_option.sub_option_set[0].sub_option_cost;
                });
                _.each(item.addons, function(addon) {
                    _.each(addon.addon_set, function(addon_obj) {
                        price += addon_obj.addon_cost;
                    });
                });
                item_total += price;
            }
        });
        return item_total;
    };

});
