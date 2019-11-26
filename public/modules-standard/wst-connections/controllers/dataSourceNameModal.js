/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 05/05/15
 * Time: 11:53
 * To change this template use File | Settings | File Templates.
 */

app.service('dataSourceNameModal', ['$uibModal', function($uibModal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'data-source/views/dataSourceName.html',
        windowClass: "in dataSourceName_modal_window"
    };

    var modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Save',
        headerText: 'Data Source',
        bodyText: ''
    };



    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
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
            tempModalDefaults.controller = function ($scope, $uibModalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) {
                    $uibModalInstance.close(result);
                };
                $scope.modalOptions.close = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        }

        return $uibModal.open(tempModalDefaults).result;
    };


}]);
