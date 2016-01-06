angular.module('consoleApp').directive('uiFileUpload', function() {
    return {
        restrict: 'A',
        link: function(scope, ele) {
            ele.bootstrapFileInput();
        }
    }
});
