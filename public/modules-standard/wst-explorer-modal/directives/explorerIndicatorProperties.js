app.directive('explorerIndicatorProperties', function($compile, $rootScope, $i18next) {
    return {
        transclude: true,
        scope: {
            column: '=',
            report: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/explorerIndicatorProperties.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {
/*
          $scope.icon = $scope.report.properties.indicator.icon;
          $scope.main_font_color = $scope.report.properties.indicator.main_font_color;
          $scope.background_color = $scope.report.properties.indicator.background_color;
          $scope.secondary_font_color = $scope.report.properties.indicator.secondary_font_color;
          $scope.icon_background_color = $scope.report.properties.indicator.icon_background_color;
          $scope.icon_color = $scope.report.properties.indicator.icon_color;

          $scope.$watch('report.properties.indicator.icon', function(){
            if ($scope.report.properties.indicator)
                $scope.icon = $scope.report.properties.indicator.icon;
                else
                $scope.icon = 'fa-bolt';
          });
          $scope.$watch('report.properties.indicator.main_font_color', function(){
            $scope.main_font_color = $scope.report.properties.indicator.main_font_color;
          });
          $scope.$watch('report.properties.indicator.background_color;', function(){
            $scope.background_color = $scope.report.properties.indicator.background_color;
          });
          $scope.$watch('report.properties.indicator.secondary_font_color', function(){
            $scope.secondary_font_color = $scope.report.properties.indicator.secondary_font_color;
          });
          $scope.$watch('report.properties.indicator.icon_background_color', function(){
            $scope.icon_background_color = $scope.report.properties.indicator.icon_background_color || '#40bbea';
          });
          $scope.$watch('report.properties.indicator.icon_color', function(){
            $scope.icon_color = $scope.report.properties.indicator.icon_color;
          });


          $scope.iconChanged = function()
          {
            if ($scope.report.properties.indicator && $scope.report.properties.indicator.icon != $scope.icon)
            {
                $scope.report.properties.indicator.icon = $scope.icon;
                $scope.report.properties.indicator.refresh()
            }
          }

          $scope.colorChanged = function(property)
          {
            if ($scope.report.properties.indicator && $scope.report.properties.indicator[property] != $scope[property])
            {
                $scope.report.properties.indicator[property] = $scope[property];
                $scope.report.properties.indicator.refresh()
            }
          }

          $scope.colorChanged = function()
          {
            $scope.report.properties.indicator.refresh()

          }

          */


        }
      }
});
