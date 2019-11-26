app.directive('dashWidgetBand', function($compile, $rootScope,$ocLazyLoad,$timeout) {
    return {
        transclude: true,
        scope: {
            band: '=',
            designerMode: '=',
            properties: '=',
            selected: '=',
            onSelect: '='
        },
        template: '<div class="container-fluid wst-dash-widget-band"  ng-class="{design: designerMode == true, selected: selected == true}">'
                      +'<div ng-if="band.blocks.length == 0 && designerMode" class="empty-band" ng-i18next="Empty band"></div>'
                      +'<div class="col-md-{{12/band.blocks.length}} wst-widget-column" ng-repeat="block in band.blocks">'
                          +'<dash-widget block="block" on-delete="blockDeleted" designer-mode="designerMode"></dash-widget>'
                      +'</div>'
                  +'</div>',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {


        $scope.$watch('band', function(val,old){
              if ($scope.band.properties)
              {
                if ($scope.band.properties.css)
                {
                    for (var property in $scope.band.properties.css)
                        {
                        if (property == 'background_image')
                            {
                                element.css({'background-image':'url('+$scope.band.properties.css[property]+')'});
                            } else
                              applyProperty(property,$scope.band.properties.css[property]);
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

        element.bind("click", function(e) {

                  if ($scope.designerMode)
                  {
                      if (!$scope.band.properties)
                          $scope.band.properties = {};

                      $rootScope.$emit('dashboardItemSelected', {type:'widget-band',object:element,WSTObject:$scope.band});
                      if ($scope.onSelect)
                         $scope.onSelect($scope.band);

                     e.preventDefault();
                     e.stopPropagation();
                     $scope.$apply();
                  }


        });

        element.bind("mouseover", function(e) {
          e.preventDefault();
          e.stopPropagation();
          if ($scope.designerMode)
          {
            var top = element[0].getBoundingClientRect().top - element[0].offsetParent.getBoundingClientRect().top;
            //var top = element[0].getBoundingClientRect().top;
            var left = element[0].getBoundingClientRect().left - element[0].offsetParent.getBoundingClientRect().left;
            var bottom = element[0].offsetParent.getBoundingClientRect().bottom - element[0].getBoundingClientRect().bottom;
            var right = element[0].offsetParent.getBoundingClientRect().right - element[0].getBoundingClientRect().right;

              //$(element).addClass("designer-over");
              $('#hoverBorders').show();
              $('#hoverBorders').css({top:top,left:left,right:right,bottom:bottom});

          }


        });

        element.bind("mouseout", function(e) {
          e.preventDefault();
          e.stopPropagation();
          if ($scope.designerMode)
              //$(element).removeClass("designer-over");
              $('#hoverBorders').hide();

        });


        function rebuildBand()
        {
          element.empty();

          var widgetCode = '';

          for (var i in $scope.reports)
          {
            if(!widgetCode)
               widgetCode = '';

            widgetCode = widgetCode + '<div class="col-md-'+ 12/$scope.reports.length+' wst-widget-column">'
                                    +          '<dash-widget report-id="\''+$scope.reports[i]._id+'\'"></dash-widget>'
                                    + '</div>';
          }

          var $widget = angular.element(widgetCode);
          $compile($widget)($scope);
          element.append($widget);

        }

        $scope.blockDeleted = function(blockID)
        {
            for (var b in $scope.band.blocks)
            {

                if ($scope.band.blocks[b].id == blockID)
                    {

                      $scope.band.blocks.splice(b,1);
                      return;
                    }

            }
        }

    }
  }
  });
