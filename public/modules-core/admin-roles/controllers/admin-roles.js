angular.module('wice').controller('AdminRolesCtrlV3', function ($scope, connection, $q, $filter, $rootScope, PagerService, $i18next, formModalUniversal, rolePermissionsModal) {


  $scope.getRoles = function(page, search, fields) {
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

     connection.get('/api/v3/admin/roles', params, function(data) {
          $scope.roles = data.items;
          $scope.page = data.page;
          $scope.pages = data.pages;
          $scope.pager = PagerService.GetPager($scope.roles.length, data.page,10,data.pages);
      })

  };

  var html =  '<form name="myForm">'
              +'<div class="form-group">'
              +'<label for="roleName" class="control-label">Role name</label>'
              +'<input type="text" class="form-control" name="roleName" id="roleName"  ng-model="model.name" required>'
              +'<span class="error" ng-show="myForm.roleName.$error.required">Name is required!</span>'
              +'</div>'
              +'<div class="form-group">'
              +'<label for="roleDesc" class="control-label">Description</label>'
              +'<input type="text" class="form-control" name="roleDesc" id="roleDesc"  ng-model="model.description">'
              +'</div>'
              +'</form>';


  $scope.newRole = function() {
    var role = {};

          formModalUniversal.showModal({size:'small',backdrop:true}, {object:{model:role,html:html},readonly:false}).then(function (theSelectedModel) {
            connection.post('/api/v3/admin/roles', role, function(data) {
                 $scope.roles.push(data.item);
             })
          });
  };

  $scope.editRole = function(role) {
        formModalUniversal.showModal({size:'small',backdrop:true}, {object:{model:role,html:html},readonly:false}).then(function (theSelectedModel) {
          connection.post('/api/v3/admin/roles/'+role._id, role, function(data) {
            
           })
          });
  };

  $scope.rolePermissions = function(roleID)
  {
    rolePermissionsModal.showModal({}, {roleID:roleID}).then(function (result) {

    });
  }



});
