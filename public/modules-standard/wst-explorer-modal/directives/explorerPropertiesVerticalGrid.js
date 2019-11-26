'use strict';

app.directive('explorerPropertiesVerticalGrid', function($compile, $rootScope,queryModel,reportModel) {
    return {
        transclude: true,
        scope: {
            report: '=',
            onChange: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/explorerPropertiesVerticalGrid.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {


        }
      }
});
