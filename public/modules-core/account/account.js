app.config(function($stateProvider) {

    $stateProvider.state('AccountCtrlV3',{
        url:'/my-account',
        templateUrl: 'account/views/view.html',
        controller: 'MyAccountCtrl',
        resolve: {
                    home: function($ocLazyLoad) {
                        return $ocLazyLoad.load(
                            {
                                name: "my-account",
                                files: [
                                    'account/directives/changePassword.js',
                                    'account/controllers/controller.js'
                                ],
                                serie: true
                            }
                        );
                    }
                }
    });

});
