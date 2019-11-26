app.service('deleteLayerConfirm', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'wst-layers/directives/views/deleteLayerDirective.html'
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

          var tempModalDefaults = {};
          var tempModalOptions = {};

          //Map angular-ui modal custom defaults to modal defaults defined in service
          angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

          //Map modal.html $scope custom properties to defaults defined in service
          angular.extend(tempModalOptions, modalOptions, customModalOptions);

          if (!tempModalDefaults.controller) {
              tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, connection, $i18next,connectionModel) {

                  $scope.modalOptions = tempModalOptions;
                  if ($scope.modalOptions.layer)
                      {
                        $scope.layer = $scope.modalOptions.layer;

                        doChecks();
                      }


                      function doChecks() {
                          connection.get('/api/v3/admin/layers/'+$scope.layer._id+'/check', {}, function(data) {

                              for (var i in data.reports) {
                                  data.reports[i].deleteAction = "0";
                              }
                              for (var i in data.dashboards) {
                                  data.dashboards[i].deleteAction = "0";
                              }

                              $scope.deleteData = data;
                              $scope.deleteData.layerID = $scope.layer._id;

                          });
                      };

                      $scope.deleteConfirmed = function() {
                          connection.post('/api/v3/admin/layers/'+$scope.layer._id+'/delete', $scope.deleteData, function(data) {
                              if (data.result == 1)
                                    $uibModalInstance.close();
                          });
                      };



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
