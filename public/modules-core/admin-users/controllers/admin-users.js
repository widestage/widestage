angular.module('wice').controller('AdminUsersCtrlV3', function ($scope, connection, $q, $filter, $rootScope, inviteNewUserModal,userForm, PagerService, $i18next) {


  $scope.getUsers = function(page, search, fields) {
      var params = {};

      params.page = (page) ? page : 1;

      if (search) {
          $scope.search = search;
      }
      else if (page == 1) {
          $scope.search = '';
      }
      if ($scope.search) {
          params.search = $scope.search;
      }

      if (fields) params.fields = fields;

     connection.get('/api/v3/admin/users', params, function(data) {
          $scope.users = data.items;
          $scope.page = data.page;
          $scope.pages = data.pages;
          $scope.perPage = data.perPage;
          $scope.count = data.count;
          $scope.pager = PagerService.GetPager($scope.users.length, data.page,10,data.pages);
          for (var u in $scope.users)
          {
            if ($scope.users[u].roles.indexOf("SUPERADMIN") > -1)
                $scope.users[u].isSuperAdmin = true;
          }
      })

  };

  $scope.getUsersParams = function(params)
  {
      var params = (params) ? params : {};

      params.fields = ['userName','lastName','status'];

      connection.get('/api/v3/admin/users', params, function(data) {
          $scope.users = data.items;
          $scope.page = data.page;
          $scope.pages = data.pages;
          $scope.perPage = data.perPage;
          $scope.count = data.count;
          //$scope.pager = PagerService.GetPager($scope.items.length, data.page,10,data.pages);
      });
  };



  $scope.changeUserStatus = function(user)
  {
      if ($rootScope.isGranted('users','update'))
      {

          if (user.status == 'Active')
              var newStatus = 'Not active';
          if (user.status == 'Not active' || user.status == 'waiting-confirmation')
              var newStatus = 'Active';

          var data = {userID: user._id, status: newStatus}

          connection.post('/api/v3/admin/users/'+user._id+'/change-user-status', data, function(result) {
              if (result.result == 1) {
                  toastr.success($i18next.t("User status updated"));
                  user.status = newStatus;
              }
          });
      } else {
        toastr.error($i18next.t("You don´t have permissions to change the status of an user"));
      }
  }

  $scope.inviteUser = function() {

          inviteNewUserModal.showModal({size:'lg',backdrop:true}, {object:undefined,readonly:false}).then(function (result) {
                  $scope.users.push(result);
          });
  };

  $scope.newUser = function() {
          userForm.showModal({size:'lg',backdrop:true}, {object:undefined,readonly:false}).then(function (result) {
                  $scope.users.push(result);
          });
  };

  $scope.editUser = function(user) {
          userForm.showModal({size:'lg',backdrop:true}, {object:user,readonly:false}).then(function (result) {

          });
  };

  $scope.seeUser = function(user) {
          userForm.showModal({size:'lg',backdrop:true}, {object:user,readonly:true}).then(function (result) {

          });
  };



});
