app.service('changePassword', ['$uibModal', function($uibModal) {


    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'account/directives/views/changePassword.html'
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

                    var strongRegularExp = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$_%\^&\*])(?=.{8,})");
                    var mediumRegularExp = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

              $scope.checkpwdStrength = {
                      "width": "15px",
                      "height": "15px",
                      "border-radius": "15px",
                      "background-color": "red"
                    };
              $scope.isWeak = true;

              $scope.validationInputPwdText = function(value) {
                      if (strongRegularExp.test(value)) {
                        $scope.checkpwdStrength["background-color"] = "green";
                        $scope.isWeak = false;
                      } else if (mediumRegularExp.test(value)) {
                        $scope.checkpwdStrength["background-color"] = "orange";
                        $scope.isWeak = false;
                      } else {
                        $scope.checkpwdStrength["background-color"] = "red";
                        $scope.isWeak = true;
                      }
                    };

                $scope.passwordAlertMsg = $i18next.t("Passwords are not equal");

                $scope.readonly = $scope.modalOptions.readonly;

                $scope.modalOptions.ok = function (result) {

                  connection.post('/api/v3/users/change-my-password', {pwd1:$scope.pwd1,pwd2:$scope.pwd2}, function(data) {
                      if (data.result == 1) {
                          toastr.success("Password updated");
                          $uibModalInstance.close();
                      }
                  });



                };


                $scope.modalOptions.close = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };

            }
        }
        return $uibModal.open(tempModalDefaults).result;
        }
}]);
