app.service('userForm', ['$uibModal', function($uibModal) {


    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: '/admin-users/directives/views/user-form.html'
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
                if ($scope.modalOptions.object)
                    {
                      var user = $scope.modalOptions.object;
                      connection.get('/api/v3/admin/users/'+user._id, {}, function(data) {
                          if(data.result == 1) {
                            $scope._User = data.item;
                            $scope.mode = 'edit';
                          }
                        });
                    }
                  else
                    {
                      $scope._User = {};
                      $scope._User.roles = [];
                      $scope._User.status = 'Active';
                      $scope._User.sendPassword = true;
                      $scope.mode = 'new';

                    }

                $scope.readonly = $scope.modalOptions.readonly;

                connection.get('/api/v3/roles/get-roles', {}, function(data) {
                    if(data.result == 1) {
                        $scope.roles = data.items;
                    }
                  });

                  $scope.isSUPERADMIN = $rootScope.isSUPERADMIN;



                function checkForNewUser()
                {
                    var isOk = true;
                    $scope.alertMessage = '';

                    /*if (!$scope._User.userName)
                    {
                        $scope.alertMessage = 'You have to introduce the user nick for the new user';
                        isOk = false;
                        return;
                    }*/

                    if ($scope._User.sendPassword == false)
                    {
                        if (!$scope._User.pwd1)
                        {
                                $scope.alertMessage = 'You have to introduce a password';
                                isOk = false;
                                return isOk;
                        } else {
                            if ($scope._User.pwd1 != $scope._User.pwd2)
                            {
                                $scope.alertMessage = 'Passwords do not match';
                                isOk = false;
                                return isOk;
                            }
                        }
                    } else {
                        if (!$scope._User.email)
                        {
                            $scope.alertMessage = 'You have to introduce a valid email to send the generated password to the user';
                            isOk = false;
                            return;
                        }
                    }

                    if (isOk == true)
                    {
                      return isOk;
                    }
                }

                $scope.checkForDuplicateUserNick = function()
                {
                   //TODO:
                }

                $scope.checkForDuplicateUserEmail = function()
                {
                   //TODO:
                }

                $scope.modalOptions.ok = function (result) {
                      if ($scope.mode == 'new')
                      {
                        if (checkForNewUser())
                          {
                            connection.post('/api/v3/admin/users', $scope._User, function(data) {
                                if (data.result == 1)
                                    $uibModalInstance.close($scope._User);
                            });
                          }
                      } else {
                        connection.post('/api/v3/admin/users/'+$scope._User._id, $scope._User, function(data) {
                            if (data.result == 1)
                                $uibModalInstance.close();
                        });
                      }


                };


                $scope.modalOptions.close = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };

            }
        }
        return $uibModal.open(tempModalDefaults).result;
        }
}]);
