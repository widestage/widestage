'use strict';

app.directive('wstExplorerMainArea', function($compile, $rootScope,queryModel,reportModel,uuid2) {
    return {
        transclude: true,
        scope: {
          //query: '=',
          report: '=',
          onChange: '=',
          properties: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/explorerMainArea.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          if ($scope.properties)
          {
            if ($scope.properties.showReportTypes)
                $scope.showReportTypes = $scope.properties.showReportTypes;

          } else {
            $scope.showReportTypes = true;
          }
/*
          var report = {};

          $scope.$watch('reportId', function(){
            if ($scope.reportId)
            {
              reportModel.getReportDefinition($scope.reportId,false, function(theReport) {
                    setReport(theReport);
              });
            }
          });
*/

/*
          report._id = 'XXXXXX';
          report.draft = true;
          report.badgeStatus = 0;
          report.exportable = true;
          report.badgeMode = 1;
          report.properties = {};
          report.properties.xkeys = [];
          report.properties.ykeys = [];
          report.properties.columns = [];
          report.properties.pivotColumns = [];
          report.properties.pivotRows = [];
          report.properties.pivotMeasures = [];
          report.properties.height = 300;

          report.reportType = 'grid';
          report.parentDiv = 'reportLayout';
          if (!$scope.query)
              {
                queryModel.initQuery(function(qu){
                    report.query = qu;
                    $scope.query = qu;
                })
              } else {
                report.query = $scope.query;
              }*/
          $scope.selectedReport = $scope.report;
          $scope.query = $scope.report.query;

          function setReport(theReport)
          {
            //theReport.query.params = {};
            $scope.selectedReport = theReport;
            $scope.query = theReport.query;
            //reportModel.setReport(theReport,'parentDiv','edit',function(){

            //})
            /*report = {};
            queryModel.initQuery();
            report._id = theReport._id;
            report.properties = theReport.properties;
            report.query = theReport.query;
            //$scope.selectedReport = report;
            //queryModel.loadQuery(theReport.query);
            //queryModel.detectLayerJoins();
            //$rootScope.$emit('queryDefinitionChanged', {});
            var theQuery = $rootScope.clone(theReport.query);
            //queryModel.loadQuery(theQuery);
            //queryModel.detectLayerJoins();
            queryModel.getQuery(function(modelQ){
              
            })*/

          }


          /* AL TRAER EL REPORT DESDE LA BBDD
          //queryModel.loadQuery(report.query);
          //queryModel.detectLayerJoins();

          */

          $scope.gridGetMoreData = function(reportID)
              {
                  $scope.page += 1;
                  reportModel.getReportDataNextPage($scope.selectedReport,$scope.page);
              }

          $scope.getQuery = function(queryID)
              {
                  return queryModel.query();
              }

          $scope.isGranted = function(module,permission)
          {
            return $rootScope.isGranted(module,permission);
          }

          $scope.reportName = function()
          {

                reportNameModal.showModal({size:'lg',backdrop:true}, {object:$scope.selectedReport,readonly:false}).then(function (theSelectedElement) {
                        if ($scope.mode != 'edit' && $scope.mode != 'explore')
                        {
                          reportModel.saveAsReport($scope.selectedReport,'add',function(){

                          });
                        }
                });
          }



              $scope.showOverlay = function (referenceId) {
                    /*  bsLoadingOverlayService.start({
                          referenceId: referenceId
                      });*/
                  };

              $scope.hideOverlay = function (referenceId) {
                  /*bsLoadingOverlayService.stop({
                      referenceId: referenceId
                  });*/
              };


              $scope.changeReportType = function(newReportType)
              {

                  if (newReportType == 'grid')
                  {
                      $scope.selectedReport.reportType = 'grid';

                  }
                  if (newReportType == 'vertical-grid')
                  {
                      $scope.selectedReport.reportType = 'vertical-grid';

                  }
                  if (newReportType == 'chart-bar')
                  {
                      $scope.selectedReport.reportType = 'chart-bar';

                  }
                  if (newReportType == 'chart-line')
                  {
                      $scope.selectedReport.reportType = 'chart-line';

                  }
                  if (newReportType == 'chart-area')
                  {
                      $scope.selectedReport.reportType = 'chart-area';

                  }
                  if (newReportType == 'chart-donut')
                  {
                      $scope.selectedReport.reportType = 'chart-donut';

                  }
                  if (newReportType == 'dxPivot')
                  {
                      $scope.selectedReport.reportType = 'dxPivot';

                  }
                  if (newReportType == 'dxGrid')
                  {
                      $scope.selectedReport.reportType = 'dxGrid';

                  }
                  if (newReportType == 'indicator')
                  {
                      $scope.selectedReport.reportType = 'indicator';
/*
                      if (!$scope.selectedReport.properties.style)
                          $scope.selectedReport.properties.style = 'style1';
                      if (!$scope.selectedReport.properties.backgroundColor)
                          $scope.selectedReport.properties.backgroundColor = '#fff';
                      if (!$scope.selectedReport.properties.reportIcon)
                          $scope.selectedReport.properties.reportIcon = 'fa-bolt';
                      if (!$scope.selectedReport.properties.reportIconBackgroundColor)
                          $scope.selectedReport.properties.reportIconBackgroundColor = '#40bbea';
                      if (!$scope.selectedReport.properties.mainFontColor)
                          $scope.selectedReport.properties.mainFontColor = '#000000';
                      if (!$scope.selectedReport.properties.auxFontColor)
                          $scope.selectedReport.properties.auxFontColor = '#000000';
                      if (!$scope.selectedReport.properties.descFontColor)
                          $scope.selectedReport.properties.descFontColor = '#CCCCCC';
*/

                  }
                  if (newReportType == 'vectorMap')
                  {
                      $scope.selectedReport.reportType = 'vectorMap';

                  }

                  if (newReportType == 'gauge')
                  {
                      $scope.selectedReport.reportType = 'gauge';
/*
                      if (!$scope.selectedReport.properties.lines)
                          $scope.selectedReport.properties.lines = 20; // The number of lines to draw    12
                      if (!$scope.selectedReport.properties.angle)
                          $scope.selectedReport.properties.angle = 15; // The length of each line
                      if (!$scope.selectedReport.properties.lineWidth)
                          $scope.selectedReport.properties.lineWidth = 44; // The line thickness
                      if (!$scope.selectedReport.properties.pointerLength)
                          $scope.selectedReport.properties.pointerLength = 70;
                      if (!$scope.selectedReport.properties.pointerStrokeWidth)
                          $scope.selectedReport.properties.pointerStrokeWidth = 35;
                      if (!$scope.selectedReport.properties.pointerColor)
                          $scope.selectedReport.properties.pointerColor =  '#000000';
                      if (!$scope.selectedReport.properties.limitMax)
                          $scope.selectedReport.properties.limitMax = 'false';   // If true, the pointer will not go past the end of the gauge
                      if (!$scope.selectedReport.properties.colorStart)
                          $scope.selectedReport.properties.colorStart = '#6FADCF';   // Colors
                      if (!$scope.selectedReport.properties.colorStop)
                          $scope.selectedReport.properties.colorStop = '#8FC0DA';    // just experiment with them
                      if (!$scope.selectedReport.properties.strokeColor)
                          $scope.selectedReport.properties.strokeColor = '#E0E0E0';   // to see which ones work best for you
                      if (!$scope.selectedReport.properties.generateGradient)
                          $scope.selectedReport.properties.generateGradient = true;
                      if (!$scope.selectedReport.properties.minValue)
                          $scope.selectedReport.properties.minValue = 0;
                      if (!$scope.selectedReport.properties.maxValue)
                          $scope.selectedReport.properties.maxValue = 100;
                      if (!$scope.selectedReport.properties.animationSpeed)
                          $scope.selectedReport.properties.animationSpeed = 32;

*/
                  }

                  $rootScope.$emit('explorerItemSelected', {type:$scope.selectedReport.reportType,object:$scope.selectedReport});

                  //TODO: only generate the visualization not requery all data again
                  if ($scope.interactiveMode)
                      $scope.getDataForPreview();
                      else
                      reportModel.prepareReport($scope.selectedReport,'reportLayout',$scope.mode);

              }
        }
  }

  $scope.reportLayerClick = function()
  {
    $rootScope.$emit('explorerItemSelected', {type:$scope.selectedReport.reportType,object:$scope.selectedReport});


  }

});
