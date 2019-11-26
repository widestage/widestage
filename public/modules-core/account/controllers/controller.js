angular.module('wice').controller('MyAccountCtrl', function ($scope, connection ,$rootScope, changePassword) {

    $scope._User = $rootScope.user;

    connection.get('/api/v3/roles/get-roles', {}, function(data) {
        if(data.result == 1) {
            $scope.roles = data.items;
        }
      });

    $scope.changeMyPassword = function()
    {
      changePassword.showModal({size:'sm',backdrop:true}, {object:undefined,readonly:false}).then(function (result) {

      });
    }

    $scope.isSuperAdmin = function()
    {
      if ($scope._User.roles.indexOf("SUPERADMIN") > -1)
        return true
        else {
          return false;
        }
    }



})
