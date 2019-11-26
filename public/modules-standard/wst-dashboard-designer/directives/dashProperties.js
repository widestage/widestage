app.directive('dashProperties', function($compile, $rootScope, $i18next, reportListModal,uuid2,$timeout) {
    return {
        transclude: true,
        scope: {
            dashboard: '=',
            onNewBand: '=',
            htmlObject: '='
        },

        templateUrl: 'wst-dashboard-designer/directives/views/dashProperties.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          $scope.$watch('dashboard', function(val,old){

                if ($scope.dashboard & !$scope.dashboard.properties)
                      $scope.dashboard.properties = {};
          });


          $scope.addBand = function()
          {
                var theNewBand = {}
                theNewBand.blocks = [];
                theNewBand.id = uuid2.newguid();
                $scope.dashboard.bands.push(theNewBand);
                if ($scope.onNewBand)
                    $scope.onNewBand(theNewBand);
          }

          


        }
      }
});
