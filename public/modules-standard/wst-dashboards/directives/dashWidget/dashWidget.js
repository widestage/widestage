app.directive('dashWidget', function($compile, $rootScope, reportModel, bsLoadingOverlayService, queryModel) {
    return {
        transclude: true,
        scope: {
            block: '=',
            designerMode: '=',
            onDelete: '='
        },

        templateUrl: '/wst-dashboards/directives/dashWidget/views/dashWidget.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          $rootScope.$on('queryDefinitionChanged', function (event, data) {
                  var report = $scope.selectedReport;
                  $scope.showOverlay('OVERLAY_reportLayout');

                  if (report.properties.chart)
                      report.properties.chart.size_height = $scope.block.properties.report_height;

                  $scope.reportName = report.reportName;
                  reportModel.setReport(report,'reportLayout_'+report._id,$scope.mode,function() {
                      $scope.hideOverlay('OVERLAY_reportLayout');
                          $scope.fromCache = (report.query.fromCache);
                  })
          });


          element.bind("click", function(e) {

                    if ($scope.designerMode)
                    {
                        if (!$scope.block.properties)
                            $scope.block.properties = {};

                        $rootScope.$emit('dashboardItemSelected', {type:'widget',object:element,WSTObject:$scope.block});
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
              var top = element[0].getBoundingClientRect().top - element[0].offsetParent.offsetParent.getBoundingClientRect().top;
              //var top = element[0].getBoundingClientRect().top;
              var left = element[0].getBoundingClientRect().left - element[0].offsetParent.offsetParent.getBoundingClientRect().left;
              var bottom = element[0].offsetParent.offsetParent.getBoundingClientRect().bottom - element[0].getBoundingClientRect().bottom;
              var right = element[0].offsetParent.offsetParent.getBoundingClientRect().right - element[0].getBoundingClientRect().right;

                //$(element).addClass("designer-over");
                $('#hoverBorders').show();
                $('#hoverBorders').css({top:top,left:left,right:right,bottom:bottom});

            }
              //  $(element).addClass("designer-over");


          });

          element.bind("mouseout", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if ($scope.designerMode)
            $('#hoverBorders').show();
                //$(element).removeClass("designer-over");

          });


        if (!$scope.block.properties)
          {
              $scope.block.properties = {};
              $scope.block.properties.showHeader = true;
              $scope.block.properties.css = {};

              $scope.block.properties.css.height = 200;
              $scope.block.properties.css.background_color = '#ffffff'
          }

        $scope.$watch('block', function(val,old){

              $scope.properties = $scope.block.properties;
              if ($scope.block.properties)
              {
                if ($scope.block.properties.css)
                {
                    for (var property in $scope.block.properties.css)
                        {
                            if (property == 'background_image')
                                {
                                  element.css({'background-image':'url('+$scope.block.properties.css[property]+')'});
                                } else
                                  applyProperty(property,$scope.block.properties.css[property]);
                        }
                }

              }

              if ($scope.block.type == 'report')
              {
                  var theReportID = $scope.block.reportID || $scope.block.id;
                  getReportDiv(theReportID,false);
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

        $scope.deleteBlock = function()
        {
            if ($scope.onDelete)
                $scope.onDelete($scope.block.id);
        }


        function getReportDiv(reportID,reload) {
                if (reportID)
                    {
                      $scope.showNotReportFound = false;
                       $scope.showOverlay('OVERLAY_reportLayout');
                       reportModel.getReportDefinition(reportID,false,'dash', function(report) {
                             if (report)
                                {

                                    $scope.selectedReport = report;


                                    if (report.properties.chart)
                                        report.properties.chart.size_height = $scope.block.properties.report_height;

                                    $scope.reportName = report.reportName;
                                    reportModel.setReport(report,'reportLayout_'+reportID,$scope.mode,function() {
                                        $scope.hideOverlay('OVERLAY_reportLayout');
                                            $scope.fromCache = (report.query.fromCache);
                                    });

                                    if (!reload)
                                        $rootScope.$emit('dashboardReport', {report: report});

                                } else {
                                    //TODO:No report found message
                                    $scope.showNotReportFound = true;
                                }
                        });

                    }


            };


        $scope.showOverlay = function (referenceId) {
                    bsLoadingOverlayService.start({
                        referenceId: referenceId
                    });
                };

        $scope.hideOverlay = function (referenceId) {
                bsLoadingOverlayService.stop({
                    referenceId: referenceId
                });
            };

        $scope.getQuery = function(queryID) {
              return $scope.selectedReport.query;
        };

        $scope.widgetProperties = function()
        {
              var properties = {};
              properties.height = $scope.properties.height;
              properties.backgroundColor = $scope.properties.backgroundColor;
              /*
              dashWidgetPropertiesModal.showModal({size:'md',backdrop:true}, {object:properties,readonly:false}).then(function (theSelectedReports) {
                $scope.properties.height = properties.height;
                $scope.properties.backgroundColor = properties.backgroundColor;
                element.css('backgroundColor',properties.backgroundColor);
                $scope.selectedReport.properties.height = $scope.properties.height;
                reportModel.repaintReport($scope.selectedReport,$scope.mode);

              });
              */
        }







    }
  }
  });
