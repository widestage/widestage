app.service('dashBandModal', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'wst-dashboards/directives/dashBandModal/dashBandModal.html'
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

                      }

                  $scope.readonly = $scope.modalOptions.readonly;

                  $scope.modalOptions.ok = function (result) {
                      $uibModalInstance.close($scope.selectedReports);
                  };

                  $scope.modalOptions.close = function (result) {
                      $uibModalInstance.dismiss('cancel');
                  };

                  $scope.bandTypes = [
                      {
                        name:'1 column band',
                        imageUrl:'/themes/xwst/assets/images/1col.png'
                      },
                      {
                        name:'2 column band',
                        imageUrl:'/themes/xwst/assets/images/2col.png'
                      },
                      {
                        name:'3 column band',
                        imageUrl:'/themes/xwst/assets/images/3col.png'
                      }

                  ]


              }
          }
          return $uibModal.open(tempModalDefaults).result;
          }
  }]);
