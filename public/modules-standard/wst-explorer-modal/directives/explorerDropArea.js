'use strict';

app.directive('wstExplorerDropArea', function($compile, $rootScope,queryModel,bsLoadingOverlayService,reportModel) {
    return {
        transclude: true,
        scope: {
            report: '=',
            onChange: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/explorerDropArea.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {
          //$scope.query = queryModel.query();
          $scope.query = $scope.report.query;
          //$scope.queries = queryModel.queries();
          $scope.selectedReport = $scope.report;



          $rootScope.$on('queryDefinitionChanged', function (event, data) {
                  if ($rootScope.interactiveMode)
                  {
                    queryModel.processStructure($scope.query,true,function(isReady){
                        if (isReady)
                            getDataForPreview(false);
                      });
                  }
          });


          $scope.processStructure = function(execute, params) {
            queryModel.processStructure($scope.query,execute,function(){
                  getDataForPreview((params) ? params : false);
              });
          }

          function getDataForPreview(params)
          {
              $scope.gettingData = true;
              bsLoadingOverlayService.start({referenceId: 'reportLayout'});

              //$scope.queries.push($scope.query);
              queryModel.getQueryData2($scope.query, function(data,sql){
                      $scope.sql = sql;
                      $scope.report.properties.columns = $scope.query.columns;
                      $scope.report.query = $scope.query;
                      $scope.report.query.params = (params) ? params : {};
                      $scope.report.query.data = data;
                      $scope.report.query.sql = sql;

                      //reportModel.repaintReport($scope.report,'edit');
                      reportModel.prepareReport($scope.report,'reportLayout','edit');
                      //done(sql);
                      //hideOverlay(parentDiv);
                      if ($scope.onChange)
                          $scope.onChange($scope.query);


              });
          }

        }
  }

});
