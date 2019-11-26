app.config(function($stateProvider) {

    $stateProvider.state('adminConnectionsCtrlV3',{
        url:'/admin/connections',
        templateUrl: 'wst-connections/views/index.html',
        controller: 'AdminConnectionsCtrlV3',
        resolve: {
                    home: function($ocLazyLoad) {
                        return $ocLazyLoad.load(
                            {
                                name: "adminConnections.index",
                                files: [
                                    'wst-connections/directives/connection-form.js',
                                    'wst-connections/controllers/connections.js'
                                ],
                                serie: true
                            }
                        );
                    }
                }
    });

});

/*
app.config(['$stateProvider', '$urlRouterProvider','$translateProvider', function($stateProvider, $urlRouterProvider,$translateProvider)
{
        $stateProvider.state('/connections', {
            url: '/connections',
            templateUrl: 'wst-connections/views/list.html',
            controller: 'PROdataSourceCtrl'
        });

        $stateProvider.state('/datasources/:extra', {
            url: '/datasources/:extra',
            templateUrl: 'wst-connections/views/list.html',
            controller: 'PROdataSourceCtrl'
        });

        $stateProvider.state('/data-sources/:dataSourceID/', {
            url: '/data-sources/:dataSourceID',
            templateUrl: 'wst-connections/views/edit.html',
            controller: 'PROdataSourceCtrl'
        });

        $stateProvider.state('/data-sources/edit/:dataSourceID/', {
            url: '/data-sources/edit/:dataSourceID',
            templateUrl: 'wst-connections/views/edit.html',
            controller: 'PROdataSourceCtrl'
        });

        $stateProvider.state('/data-sources/statistics/:dataSourceID/', {
            url: '/data-sources/statistics/:dataSourceID',
            templateUrl: 'wst-connections/views/statistics.html',
            controller: 'PROdataSourceCtrl'
        });

        $stateProvider.state('/data_sources/new/:newDataSource/', {
            url: '/data_sources/new/:newDataSource',
            templateUrl: 'wst-connections/views/edit.html',
            controller: 'PROdataSourceCtrl'
        });

        $stateProvider.state('/datasources/new/:newDataSource/:extra', {
            url: '/datasources/new/:newDataSource/:extra',
            templateUrl: 'wst-connections/views/edit.html',
            controller: 'PROdataSourceCtrl'
        });
}])
*/
