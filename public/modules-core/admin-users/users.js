app.config(function($stateProvider) {

    $stateProvider.state('AdminUsersCtrlV3',{
        url:'/admin/users',
        templateUrl: 'admin-users/views/index.html',
        controller: 'AdminUsersCtrlV3',
        resolve: {
                    home: function($ocLazyLoad) {
                        return $ocLazyLoad.load(
                            {
                                name: "adminUsers.index",
                                files: [
                                    'admin-users/directives/invite-user-directive.js',
                                    'admin-users/directives/user-form.js',
                                    'admin-users/controllers/admin-users.js'
                                ],
                                serie: true
                            }
                        );
                    }
                }
    });

});
