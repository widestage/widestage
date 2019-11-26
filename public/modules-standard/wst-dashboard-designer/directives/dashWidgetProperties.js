app.directive('dashWidgetProperties', function($compile, $rootScope, $i18next, reportListModal) {
    return {
        transclude: true,
        scope: {
            widget: '=',
            htmlObject: '=',
            onDelete: '='
        },

        templateUrl: 'wst-dashboard-designer/directives/views/dashWidgetProperties.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          $scope.onPropertyChanged = function(property,value)
          {
            if (property == 'height' || property == 'margin' || property == 'margin-top' || property == 'margin-bottom' || property == 'margin-left' || property == 'margin-right'  )
                $rootScope.$emit('dashboardRefreshItemSelected', {type:'widget',object:element,WSTObject:$scope.widget});

          }

          $scope.delete = function()
          {
             if ($scope.onDelete)
                $scope.onDelete('widget',$scope.widget.id);
          }

        }
      }
});
