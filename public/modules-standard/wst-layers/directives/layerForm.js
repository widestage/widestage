app.service('layerForm', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'wst-layers/directives/views/layerForm.html'
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
                        $scope.layer = $scope.modalOptions.object;
                        $scope.mode = 'edit';
                      }
                    else
                      {
                        $scope.Layer = {};
                        $scope.Layer.status = 'Draft';

                        $scope.mode = 'new';

                      }

                  $scope.readonly = $scope.modalOptions.readonly;




                  $scope.modalOptions.ok = function (result) {
                        if ($scope.mode == 'new')
                        {
                          var  data = $scope.Layer;
                          connection.post('/api/v3/admin/layers', data, function(data) {
                              if(data.result == 1) {
                                  toastr.success("Layer saved");
                                  $uibModalInstance.close(data.item);
                              }
                          });
                        } else {
                          connection.post('/api/v3/admin/layers/'+$scope.Layer._id, $scope.Layer, function(result) {
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





              }
          }
          return $uibModal.open(tempModalDefaults).result;
          }
  }]);
