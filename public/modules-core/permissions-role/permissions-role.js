app.service('rolePermissionsModal', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'permissions-role/permissions-role.html'
      };

      var modalOptions = {
          closeButtonText: 'Close',
          actionButtonText: 'OK',
          headerText: 'Proceed?',
          bodyText: 'Perform this action?'
      };

      this.showModal = function (customModalDefaults, customModalOptions) {
          if (!customModalDefaults) customModalDefaults = {};
          customModalDefaults.backdrop = 'static';
          return this.show( customModalDefaults, customModalOptions);
      };

      this.show = function (customModalDefaults, customModalOptions) {
          //Create temp objects to work with since we're in a singleton service

          //Create temp objects to work with since we're in a singleton service

          var tempModalDefaults = {};
          var tempModalOptions = {};

          //Map angular-ui modal custom defaults to modal defaults defined in service
          angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

          //Map modal.html $scope custom properties to defaults defined in service
          angular.extend(tempModalOptions, modalOptions, customModalOptions);

          if (!tempModalDefaults.controller) {
              tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, connection, $i18next) {

                  $scope.modalOptions = tempModalOptions;


                  var roleID = $scope.modalOptions.roleID;

                  connection.get('/api/v3/permissions', {}, function(data) {
                      if(data.result == 1) {
                          $scope.AppGrants = data.items;

                          connection.get('/api/v3/permissions/roles/'+roleID, {}, function(rolePermissions) {
                                  if (rolePermissions.result == 1)
                                      {
                                        $scope.rolePermissions = rolePermissions.items;
                                        createMatrix(data.items,rolePermissions.items);

                                      }
                          });
                      }
                  });





                  function createMatrix(AppGrants,rolePermissions)
                  {
                       var matrix = [];
                       for (var r in AppGrants)
                            {
                                var AppGrant = {};
                                AppGrant.module = AppGrants[r].module;
                                AppGrant.label = AppGrants[r].label;
                                AppGrant.permissions = AppGrants[r].permissions;
                                for (var p in rolePermissions)
                                {
                                  if (rolePermissions[p].module == AppGrant.module)
                                  {
                                    for (var agp in AppGrant.permissions)
                                        {
                                            if (rolePermissions[p].permission == AppGrant.permissions[agp].name)
                                                {
                                                   AppGrant.permissions[agp].granted = rolePermissions[p].granted;
                                                }
                                        }
                                  }
                                }
                              matrix.push(AppGrant);
                            }
                      $scope.matrix = matrix;
                  }


                  $scope.savePermission = function(module,permission,model)
                  {
                        var value = !model.granted;


                        connection.post('/api/v3/permissions/roles/'+module+'/'+permission+'/'+roleID,{granted:value}, function(result)
                        {

                        });
                  }

                  function isGranted(role,permission,grants)
                  {
                      var value = false;
                      for (var g in grants)
                      {
                         if (grants[g].roleID == role && grants[g].permission == permission)
                            {
                            value = grants[g].granted;
                            }
                      }

                      return value;
                  }


                  $scope.readonly = $scope.modalOptions.readonly;

                  $scope.modalOptions.ok = function (result) {
                        $uibModalInstance.close();

                  };


                  $scope.modalOptions.close = function (result) {
                      $uibModalInstance.dismiss('cancel');
                  };


              }
          }
          return $uibModal.open(tempModalDefaults).result;
          }
  }]);
