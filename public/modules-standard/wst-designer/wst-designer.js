'use strict';

app.directive('wstDesigner', function($compile, $rootScope, $ocLazyLoad) {
    return {
        transclude: true,
        scope: {
            properties: '='
        },

        templateUrl: 'wst-designer/wst-designer.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {


          $ocLazyLoad.load({
                          name: "designer_directives",
                          files: [
                            'wst-designer/wst-designer.css'
                          ],
                          serie: true

                  }).then(function() {

                  });




        $rootScope.$watch('properties' ,function(){
            setTimeout(function(){
                if ($scope.properties && $scope.properties.tabs)
                    for (var t in $scope.properties.tabs)
                    {
                        if ($scope.properties.tabs[t].directive)
                          injectDirective($scope.properties.tabs[t].ID,$scope.properties.tabs[t].directive);
                    }
              }, 100);
        },true);



          $scope.selectTab = function(tabID)
          {
            $scope.properties.selectedTab = tabID
          }


          function injectDirective(tabID,directive2inject)
          {
            var html = '<'+directive2inject+'></'+directive2inject+'>';

            var $directive = angular.element(html);
            $compile($directive)($scope);

            var panelBody = angular.element($('#'+tabID));

            if (panelBody)
            {

                panelBody.append($directive);
            }
          }

        }
      }
  });
