app.service('inviteNewUserModal', ['$uibModal', function($uibModal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: '/admin-users/directives/views/invite-user-directive.html'
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
            tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, connection, $i18next) {

                $scope.modalOptions = tempModalOptions;
                if ($scope.modalOptions.object)
                    $scope.newUser = $scope.modalOptions.object;
                    else
                    $scope.newUser = {};

                $scope.newUser.messageSubject = $i18next.t('Invitation to join');
                        var body = '<p>'+$i18next.t('You have been invited to join')+'</p>';
                            body += '<br/>';
                            body += '<p><a href="{{accept-url}}">'+$i18next.t('Click here to accept the invitation')+'</a></p>';
                            body += '<br/>';
                            body += '<p>'+$i18next.t('If the link does not work, copy and paste this url')+':<p>';
                            body += '<p>{{accept-url}}<p>';
                            body += '<p>'+$i18next.t('If you do not want to accept it, just ignore this message')+'<p>';

                $scope.newUser.messageBody = body;

                $scope.readonly = false;

                $scope.modalOptions.ok = function (result) {
                                connection.post('/api/v3/auth/new-user-invite', $scope.newUser, function(data) {
                                    if (data.result == 1)
                                        $uibModalInstance.close(data.item);
                                });
                };


                $scope.modalOptions.close = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.htmlChanged = function(html)
                {
                    $scope.newUser.messageBody = html;
                }



            }
        }
        return $uibModal.open(tempModalDefaults).result;
    };

}]);
