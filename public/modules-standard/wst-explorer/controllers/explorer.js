angular.module('wice').controller('explorerCtrlPage', function ($scope, connection, $compile,userSettings,$stateParams,queryModel) {

  var report = {};
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

  queryModel.initQuery(function(qu){
      report.query = qu;
      $scope.query = qu;
  });

  $scope.report = report;

});
