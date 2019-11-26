app.config(function($stateProvider) {

    $stateProvider.state('AdminRolesCtrlV3',{
        url:'/admin/roles',
        templateUrl: 'admin-roles/views/index.html',
        controller: 'AdminRolesCtrlV3',
        resolve: {
                    home: function($ocLazyLoad) {
                        return $ocLazyLoad.load(
                            {
                                name: "adminRoles.index",
                                files: [
                                    'admin-roles/controllers/admin-roles.js'
                                ],
                                serie: true
                            }
                        );
                    }
                }
    });

});
