'use strict';

app.directive('propertiesGrid', function($compile, $rootScope,queryModel,reportModel) {
    return {
        transclude: true,
        scope: {
            report: '=',
            onChange: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/propertiesGrid.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {


        }
      }
});
