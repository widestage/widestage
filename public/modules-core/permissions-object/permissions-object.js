app.service('objectPermissionsModal', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'permissions-object/permissions-object.html'
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


                  if ($scope.modalOptions.entity)
                      $scope.entity = $scope.modalOptions.entity;

                  if ($scope.modalOptions.object)
                      {

                      }

                  var objectID = $scope.modalOptions.objectID;

                  $scope.objectPermissionLabel = $i18next.t($scope.modalOptions.objectLabel);

                  if ($scope.modalOptions.objectName)
                      {
                        var roles = undefined;
                        var permissions = undefined;

                        connection.get('/api/v3/roles/get-roles', {}, function(data) {
                            if(data.result == 1) {
                                roles = data.items;
                                connection.get('/api/v3/objects/'+$scope.modalOptions.objectName, {}, function(data) {
                                    if(data.result == 1) {
                                        permissions = data.item.permissions;
                                        $scope.permissions = data.item.permissions;


                                        connection.get('/api/v3/permissions/'+$scope.modalOptions.objectName+'/'+objectID, {}, function(data) {
                                            if(data.result == 1) {
                                                createMatrix(roles,permissions,data.grants);
                                            }
                                        });
                                    }
                                });
                            }
                        });

                      }



                  function createMatrix(roles,permissions,grants)
                  {
                       var matrix = [];
                       for (var r in roles)
                            {
                                var role = {};
                                role.ID = roles[r]._id;
                                role.name = roles[r].name;
                                role.permissions = [];
                                for (var p in permissions)
                                {
                                    var permission = {};
                                    permission.name = permissions[p].name;
                                    permission.granted = isGranted(role.ID,permission.name,grants);
                                    role.permissions.push(permission);
                                }
                              matrix.push(role);
                            }
                      $scope.matrix = matrix;
                  }


                  $scope.savePermission = function(role,permission,model)
                  {
                        var value = !model.granted;


                        connection.post('/api/v3/permissions/roles/'+$scope.modalOptions.objectName+'/'+permission+'/'+role+'/'+objectID,{granted:value}, function(result)
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
