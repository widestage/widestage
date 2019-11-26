app.service('reportListModal', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'wst-dashboards/directives/reportListModal/reportListModal.html'
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

                  getReports();

                  $scope.selectedReports = [];

                  $scope.modalOptions.ok = function (result) {
                      $uibModalInstance.close($scope.selectedReports);
                  };


                  $scope.modalOptions.close = function (result) {
                      $uibModalInstance.dismiss('cancel');
                  };

                  function getReports()
                  {
                    var params = {};

                    params.page = -1;

                    params.fields = ['reportName','reportType','description'];

                    connection.get('/api/v3/reports', params, function(data) {
                        $scope.reports = data.items;
                    });
                  }

                  $scope.addReport = function(report)
                  {
                        $scope.selectedReports.push(report);
                        $scope.reports.splice($scope.reports.indexOf(report),1);
                  }

                  $scope.removeReport = function(report)
                  {
                      $scope.reports.push(report);
                      $scope.selectedReports.splice($scope.selectedReports.indexOf(report),1);
                  }


              }
          }
          return $uibModal.open(tempModalDefaults).result;
          }
  }]);
