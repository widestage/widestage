'use strict';

app.directive('wstDashboardDesignerMainArea', function($compile, $rootScope,queryModel,reportModel,uuid2,$timeout) {
    return {
        transclude: true,
        scope: {
          dashboard: '=',
          onChange: '=',
          properties: '='
        },

        templateUrl: 'wst-dashboard-designer/directives/views/dashboardDesignerMainArea.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {


          $timeout(function () {
            var element = angular.element($('#dashWidgetContainer'));

            $rootScope.$emit('dashboardItemSelected', {type:'dash-container',object:element,WSTObject:$scope.dashboard});

          }, 500);





        }
  }



});
