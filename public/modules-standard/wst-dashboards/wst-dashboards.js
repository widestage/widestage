console.log('loading dashboards');
app.config(function($stateProvider)
{
        $stateProvider.state('/dashboards', {
            url: '/dashboards',
            templateUrl: 'wst-dashboards/views/index.html',
            controller: 'dashboardsCtrl',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "dashboards",
                                    files: [
                                      'wst-dashboards/views/style.css',
                                      'wst-dashboards/directives/dashNameModal/dashNameModal.js',
                                      'wst-dashboards/directives/reportListModal/reportListModal.js',
                                      'wst-dashboards/controllers/dashboards.js'
                                    ],
                                    serie: true
                                }
                            );
                        }
                    }
        });

});
