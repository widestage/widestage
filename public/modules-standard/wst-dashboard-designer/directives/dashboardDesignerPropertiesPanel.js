'use strict';

app.directive('wstDashboardDesignerPropertiesPanel', function($compile, $rootScope,queryModel,userSettings,connection) {
    return {
        transclude: true,
        scope: {
            dashboard: '='

        },

        templateUrl: 'wst-dashboard-designer/directives/views/dashboardDesignerPropertiesPanel.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {
          $scope.tabs = {};

          $scope.tabs.selected = 'widgets';


            $rootScope.$on('dashboardItemSelected', function (event, data) {
                  $scope.tabs.selected = 'properties';
                  $scope.selectedItemType = data.type;
                  $scope.selectedObject = data.object;
                  $scope.selectedWSTObject = data.WSTObject;
            });

            $scope.deleteBand = function(type,bandID)
            {
              for (var b in $scope.dashboard.bands)
                  {
                    if ($scope.dashboard.bands[b].id == bandID)
                        {
                          $scope.dashboard.bands.splice(b,1);
                          var element = angular.element($('#dashWidgetContainer'));
                          $rootScope.$emit('dashboardItemSelected', {type:'dash-container',object:element,WSTObject:$scope.dashboard});
                        }
                  }
            }

            $scope.deleteBlock = function(type,blockID)
            {
              for (var b in $scope.dashboard.bands)
                  {
                          for (var bl in $scope.dashboard.bands[b].blocks)
                          {
                            if ($scope.dashboard.bands[b].blocks[bl].id == blockID)
                            {
                                  $scope.dashboard.bands[b].blocks.splice(bl,1);
                                var element = angular.element($('#BAND-'+$scope.dashboard.bands[b].id));
                                $rootScope.$emit('dashboardItemSelected', {type:'widget-band',object:element,WSTObject:$scope.dashboard.bands[b]});

                            }
                          }

                  }
            }


        }
      }
  });
