app.directive('dashBandProperties', function($compile, $rootScope, $i18next, reportListModal, $timeout, uuid2) {
    return {
        transclude: true,
        scope: {
            band: '=',
            htmlObject: '=',
            onDelete: '='
        },

        templateUrl: 'wst-dashboard-designer/directives/views/dashBandProperties.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {


          $scope.addReport = function()
          {
            reportListModal.showModal({size:'lg',backdrop:true}, {object:$scope.selectedReport,readonly:false}).then(function (theSelectedReports) {
                  for (var r in theSelectedReports)
                  {
                      var found = false;
                        for (var b in $scope.band.blocks)
                        {
                            if (theSelectedReports[r]._id == $scope.band.blocks[b].id)
                                found = true;
                        }
                      if (!found)
                        {
                            var theBlock = {};
                            theBlock.id = uuid2.newguid();
                            theBlock.reportID = theSelectedReports[r]._id;
                            theBlock.title = theSelectedReports[r].reportName;
                            theBlock.properties = {};
                            theBlock.properties.css = {};
                            theBlock.properties.css.background_color = '#ffffff';
                            theBlock.properties.report_height = 200;
                            theBlock.properties.showHeader = true;
                            theBlock.type = 'report';
                            if (!$scope.band.blocks)
                                $scope.band.blocks = [];

                            $scope.band.blocks.push(theBlock);
                            $timeout(function() {
                              $rootScope.$emit('dashboardRefreshItemSelected', {type:'widget-band',object:element,WSTObject:$scope.band});

                            }, 500);
                        }
                  }
            });
          }

          $scope.onPropertyChanged = function(property,value)
          {
            if (property == 'height' || property == 'margin' || property == 'margin-top' || property == 'margin-bottom' || property == 'margin-left' || property == 'margin-right'  )
                $rootScope.$emit('dashboardRefreshItemSelected', {type:'widget-band',object:element,WSTObject:$scope.band});

          }

          $scope.delete = function()
          {
             if ($scope.onDelete)
                $scope.onDelete('widget-band',$scope.band.id);
          }


        }
      }
});
