angular.module('wice').controller('dashboardsViewCtrl', function ($scope, connection, $stateParams) {


  connection.get('/api/v3/dashboards/'+$stateParams.dashboardID, {mode:'execute'}, function(data) {
      $scope.selectedDash = data.item;
      if (!$scope.selectedDash)
          $scope.showNotDashFound = true;
  });


});
