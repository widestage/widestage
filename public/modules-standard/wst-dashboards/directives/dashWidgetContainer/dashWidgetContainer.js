app.directive('dashWidgetContainer', function($compile, $rootScope,$ocLazyLoad,$timeout,uuid2) {
    return {
        transclude: true,
        scope: {
            dashboard: '=',
            designerMode: '='
        },

        templateUrl: '/wst-dashboards/directives/dashWidgetContainer/dashWidgetContainer.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {


          element.bind("mouseover", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if ($scope.designerMode)
            if ($scope.designerMode)
                {
                  var top = element[0].getBoundingClientRect().top - element[0].offsetParent.getBoundingClientRect().top;
                  var left = element[0].getBoundingClientRect().left - element[0].offsetParent.getBoundingClientRect().left;
                  var bottom = element[0].offsetParent.getBoundingClientRect().bottom - element[0].getBoundingClientRect().bottom;
                  var right = element[0].offsetParent.getBoundingClientRect().right - element[0].getBoundingClientRect().right;

                    $('#hoverBorders').show();
                    $('#hoverBorders').css({top:top,left:left,right:right,bottom:bottom});

                }


          });

          element.bind("mouseout", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if ($scope.designerMode)
                  $('#hoverBorders').hide();


          });


          $scope.$watch('dashboard', function(val,old){

                if ($scope.dashboard && $scope.dashboard.properties)
                {
                  if ($scope.dashboard.properties.css)
                  {
                      for (var property in $scope.dashboard.properties.css)
                          {
                          if (property == 'background_image')
                              {
                                  element.css({'background-image':'url('+$scope.dashboard.properties.css[property]+')'});
                              } else
                                applyProperty(property,$scope.dashboard.properties.css[property]);
                          }
                  }

                }
          });


          function applyProperty(property,value,str)
          {

            var cssProperty = property.replace(/_/g,'-');

            if (property == 'padding' || property == 'margin' || property == 'font_size' || property == 'border_width')
                str = 'px';
                else
                str = '';

                  element.css(cssProperty,value+str);
          }

        var selectedData = undefined;
        var parentObject = undefined;

        $rootScope.$on('dashboardItemSelected', function (event, data) {

            selectedData = data;

            if (data.type == 'widget-band')
            {
              $scope.selectedBand = data.object;
              $scope.selected = false;
            }

            if ($scope.designerMode)
            {
              parentObject = data.object[0].offsetParent;

              if (data.type == 'widget')
                  parentObject = data.object[0].offsetParent.offsetParent;

              var top = data.object[0].getBoundingClientRect().top - parentObject.getBoundingClientRect().top;
              var left = data.object[0].getBoundingClientRect().left - parentObject.getBoundingClientRect().left;
              var bottom = parentObject.getBoundingClientRect().bottom - data.object[0].getBoundingClientRect().bottom;
              var right = parentObject.getBoundingClientRect().right - data.object[0].getBoundingClientRect().right;

                $('#selectedBorders').show();
                $('#selectedBorders').css({top:top,left:left,right:right,bottom:bottom});

            }
        });

        $rootScope.$on('dashboardRefreshItemSelected', function (event, data) {

              var top = selectedData.object[0].getBoundingClientRect().top - parentObject.getBoundingClientRect().top;
              var left = selectedData.object[0].getBoundingClientRect().left - parentObject.getBoundingClientRect().left;
              var bottom = parentObject.getBoundingClientRect().bottom - selectedData.object[0].getBoundingClientRect().bottom;
              var right = parentObject.getBoundingClientRect().right - selectedData.object[0].getBoundingClientRect().right;

                $('#selectedBorders').show();
                $('#selectedBorders').css({top:top,left:left,right:right,bottom:bottom});

        });

        $scope.onSelectContainer = function()
        {
          if ($scope.designerMode)
              {
              $rootScope.$emit('dashboardItemSelected', {type:'dash-container',object:element,WSTObject:$scope.dashboard});
              $scope.selected = true;
              $scope.selectedBand = undefined;
              if ($scope.onSelect)
                  $scope.onSelect();
            }
        }




    }
  }
  });
