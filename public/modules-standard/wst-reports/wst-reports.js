console.log('loading reports')
app.config(function($stateProvider)
{
        $stateProvider.state('/reports', {
            url: '/reports',
            templateUrl: 'wst-reports/views/index.html',
            controller: 'reportsCtrl',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "reports",
                                    files: [
                                      'wst-reports/directives/reportNameModal.js',
                                      'wst-reports/controllers/reports.js'
                                    ],
                                    serie: true
                                }
                            );
                        }
                    }
        });

});
