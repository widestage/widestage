app.service('connectionForm', ['$uibModal', function($uibModal) {


    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'wst-connections/directives/views/connection-form.html'
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
                      $scope._DataSource = $scope.modalOptions.object;
                      $scope.mode = 'edit';
                    }
                  else
                    {
                      $scope._DataSource = {};
                      $scope._DataSource.status = 'Active';
                      $scope._DataSource.params = {};
                      $scope.mode = 'new';

                    }

                $scope.readonly = $scope.modalOptions.readonly;


                connection.get('/api/v3/admin/connections-drivers', {}, function(data) {
                            $scope._ConnectionTypes = data.items;
                });

                $scope.modalOptions.ok = function (result) {
                      if ($scope.mode == 'new')
                      {
                        if ($scope.selectedFile) {
                            var fd = new FormData();

                            fd.append('file', $scope.selectedFile);

                            $http.post('/api/data-sources/upload-config-file', fd, {
                                transformRequest: angular.identity,
                                headers: {'Content-Type': undefined}
                            })
                            .success(function (data) {

                            })
                            .error(function (data, status) {

                            });
                        }

                        var data = $scope._DataSource;

                        connection.post('/api/v3/admin/connections', data, function(data) {
                            if(data.result == 1) {
                                toastr.success("Connection saved");
                                $uibModalInstance.close(data.item);
                            }
                        });
                      } else {
                        connection.post('/api/v3/admin/connections/'+$scope._DataSource._id, $scope._DataSource, function(result) {
                            if(result.result == 1) {
                                toastr.success("Connection updated");
                                $uibModalInstance.close();
                            }
                        });
                      }


                };


                $scope.modalOptions.close = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.doTestConnection = function()
                {
                    $scope.testConnection = {};
                    var data = {};
                    $scope.testingConnection = true;
                    data.type = $scope._DataSource.type;
                    data.host = $scope._DataSource.params.connection.host;
                    data.port = $scope._DataSource.params.connection.port;
                    data.database = $scope._DataSource.params.connection.database;
                    data.userName = $scope._DataSource.params.connection.userName;
                    data.password = $scope._DataSource.params.connection.password;

                    if ($scope._DataSource.params.connection.file) data.file = $scope._DataSource.params.connection.file;

                    connection.get('/api/v3/admin/connection/test', data, function(result) {
                        if (result.result == 1) {
                            $scope.testConnection = {result:1,message:"Successful database connection."};
                            $scope.testingConnection = false;
                        } else {
                            $scope.testConnection = {result:0,message:"Database connection failed.",errorMessage:result.msg};
                            $scope.testingConnection = false;
                        }
                    });
                }

                $scope.upload = function(file) {
                    if (file) {

                        $scope._DataSource.params.connection.file = file.name;

                        $scope.selectedFile = file;
                    }
                };

            }
        }
        return $uibModal.open(tempModalDefaults).result;
        }
}]);
