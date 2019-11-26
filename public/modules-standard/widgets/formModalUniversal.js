app.service('formModalUniversal', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'widgets/views/formModalUniversal.html',
          windowClass: 'mywclass'
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
              tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, $i18next,$compile) {

                  $scope.modalOptions = tempModalOptions;
                  if ($scope.modalOptions.model)
                      $scope.model = $scope.modalOptions.model;


                  if ($scope.modalOptions.object)
                      {

                            $scope.model = $scope.modalOptions.object.model;
                            if ($scope.modalOptions.object.directive)
                                var directive2inject = $scope.modalOptions.object.directive;
                            if ($scope.modalOptions.object.html)
                                var html2inject = $scope.modalOptions.object.html;

                      }

                setTimeout(function(){
                  if (directive2inject)
                      var html = '<'+directive2inject+'></'+directive2inject+'>';
                  if (html2inject)
                      var html = html2inject;

                  var $directive = angular.element(html);
                  $compile($directive)($scope);

                  var panelBody = angular.element($('#modalPanelBody'));

                  if (panelBody)
                  {
                      panelBody.append($directive);
                  }
                }, 100);

                  $scope.readonly = $scope.modalOptions.readonly;

                  $scope.modalOptions.ok = function (result) {
                        if ($scope.mode == 'new')
                        {
                          $uibModalInstance.close($scope.entity);
                        } else {
                          $uibModalInstance.close($scope.entity);
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
