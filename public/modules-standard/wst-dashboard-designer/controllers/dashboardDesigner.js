angular.module('wice').controller('dashboardDesignerCtrl', function ($scope, connection, $compile,userSettings,$stateParams,dashboardNameModal,$i18next,$location) {


  $scope.mode = $stateParams.mode;

  if ($scope.mode == 'edit')
  {
      connection.get('/api/v3/dashboards/'+$stateParams.dashboardID, {mode:'designer'}, function(data) {
          $scope.selectedDash = data.item;
          if (!$scope.selectedDash)
              $scope.showNotDashFound = true;
      });
  } else {
    $scope.selectedDash = {};
    $scope.selectedDash.status = 'Active';
    $scope.selectedDash.bands = [];
  }


  $scope.save = function()
  {
      if ($scope.mode == 'new')
      {

        dashboardNameModal.showModal({size:'md',backdrop:true}, {object:$scope.selectedDash,readonly:false}).then(function (theSelectedElement) {
              connection.post('/api/v3/dashboards', $scope.selectedDash, function(data) {
                  if (data.result == 1) {
                      toastr.success($i18next.t("Dashboard created"));
                      $location.url('/dashboards');
                      $scope.mode = 'edit';
                  }
              });
        });
      } else {
          connection.post('/api/v3/dashboards/'+$scope.selectedDash._id, $scope.selectedDash, function(data) {
              if (data.result == 1) {
                  toastr.success($i18next.t("Dashboard updated"));
                  $location.url('/dashboard/'+$scope.selectedDash._id);
              }
          });
      }
  }


});
