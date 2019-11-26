angular.module('wice').controller('reportsViewCtrl', function ($scope,$rootScope,$stateParams,reportModel,queryModel,connection,widgetsCommon,wstExplorerModal) {

$rootScope.$emit('$stateChangeSuccess');
$scope.dateModal = 'report/views/dateModal.html';
$scope.linkModal = 'report/views/linkModal.html';
$scope.repeaterTemplate = 'report/views/repeater.html';
$scope.columnFormatModal = 'report/views/columnFormatModal.html';
$scope.columnSignalsModal = 'report/views/columnSignalsModal.html';
$scope.showPrompts = true;
$scope.selectedReport = {};
$scope.selectedReport.query = {};
$scope.queryModel = queryModel;
$scope.mode = 'preview';

$scope.getPrompts = function()
    {
           return $scope.selectedReport.query.groupFilters;
    }

$scope.getReportDiv = function(params) {
        if ($stateParams.reportID)
            {
              $scope.showNotReportFound = false;
               reportModel.getReportDefinition($stateParams.reportID,false,'execute', function(report) {
                     if (report)
                        {

                            report.query.params = (params) ? params : {};
                            $scope.selectedReport = report;
                            reportModel.setReport(report,'reportLayout',$scope.mode,function() {
                                var theReports = [];
                                    theReports.push($scope.selectedReport);
                                    $scope.fromCache = (report.query.fromCache);
                            });

                        } else {
                            //TODO:No report found message
                            $scope.showNotReportFound = true;
                        }
                });

            }


    };

$scope.getQuery = function(queryID)
    {
        return queryModel.query();
    }

/********PUBLISH******/
$scope.publishReport = function()
    {
        publishObjectModal.showModal({}, {object:$scope.selectedReport,objectID:$scope.selectedReport._id,objectName:$scope.selectedReport.reportName,objectType:'report'}).then(function (result) {

        });
    }

$scope.onFilterChange = function(elementID, value)
{
  reportModel.setReport($scope.selectedReport,'reportLayout',$scope.mode,function() {
          $scope.fromCache = ($scope.selectedReport.query.fromCache);
  });

}

$scope.editReport = function()
{
  wstExplorerModal.showModal({size:'full',backdrop:false}, {reportID:$scope.selectedReport._id,object:{properties:{showReportTypes:true}},readonly:false}).then(function (theReport) {
    reportModel.saveAsReport(theReport,'edit',function(data){

    });
  });
}



$scope.processStructure = function(execute) {
        queryModel.processStructure($scope.selectedReport.query,execute,function(){

            reportModel.setReport($scope.selectedReport,'reportLayout',$scope.mode,function() {
                                //Done
                                $scope.hideOverlay('OVERLAY_reportLayout');
                                var theReports = [];
                                    theReports.push($scope.selectedReport);

                            });
        });
    }


/********END PUBLISH******/


$scope.getReportColumnDefs = function(reportID)
    {
        return $scope.selectedReport.properties.columnDefs;
    }

$scope.filterChanged = function(elementID,values)
{

        $scope.processStructure();
}

$scope.getElementProperties = function(theElement)
{

}

/*GRID DROPDOWN FUNCTIONS*/

$scope.textAlign = widgetsCommon.textAlign;

    $scope.fontSizes = widgetsCommon.fontSizes;

    $scope.fontWeights = widgetsCommon.fontWeights;

    $scope.fontStyles = widgetsCommon.fontStyles;

    $scope.colors = widgetsCommon.colors;

    $scope.signalOptions = widgetsCommon.signalOptions;

$scope.saveToExcel = function(reportHash)
    {
        reportModel.saveToExcel($scope,reportHash) ;
    }
$scope.orderColumn = function(columnIndex,desc,hashedID) {
        reportModel.orderColumn($scope.selectedReport,columnIndex,desc,hashedID);
    };

$scope.changeColumnStyle = function(columnIndex ,hashedID)
    {
        reportModel.changeColumnStyle($scope.selectedReport,columnIndex,hashedID);
        $scope.selectedColumn = reportModel.selectedColumn();
        $scope.selectedColumnHashedID  = reportModel.selectedColumnHashedID();
        $scope.selectedColumnIndex  = reportModel.selectedColumnIndex();
    }
 $scope.setColumnFormat = function()
    {
       reportModel.repaintReport($scope.selectedReport,$scope.mode);
    }

 $scope.changeColumnColor = function(color)
    {
        if ($scope.selectedColumn.columnStyle)
        $scope.selectedColumn.columnStyle.color = color;
    }

    $scope.changeColumnBackgroundColor = function(color)
    {
        if ($scope.selectedColumn.columnStyle)
        $scope.selectedColumn.columnStyle['background-color'] = color;
    }

    $scope.gridGetMoreData = function(reportID)
    {
        $scope.page += 1;
        reportModel.getReportDataNextPage($scope.selectedReport,$scope.page);
    }


    $scope.getPublicReportDiv = function() {
        var reportID = $('#reportID').attr('value');

        $scope.reportID = reportID;


        if (reportID) {
               reportModel.getReportDefinition(reportID,false,'execute', function(report) {
                    if (report)
                        {
                            $scope.selectedReport = report;
                            reportModel.setReport(report,'reportLayout',$scope.mode,function() {
                                var theReports = [];
                                    theReports.push($scope.selectedReport);
                            });

                        } else {
                            //TODO:No report found message
                        }
                });
            }
    };

    $scope.addReportToFavourites = function(report) {
        connection.post('/api/add-to-my-favourites', {type: 'reports', id: report._id}, function(data) {
            if (data.result == 1) {
                report.favourite = true;
            }
        });

    };
    $scope.removeReportFromFavourites = function(report) {
        connection.post('/api/remove-from-my-favourites', {type: 'reports', id: report._id}, function(data) {
            if (data.result == 1) {
                report.favourite = false;
            }
        });
    };



});
