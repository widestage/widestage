console.log('loading reports view')
app.config(function($stateProvider)
{
        $stateProvider.state('/reports/:reportID/', {
            url: '/reports/:reportID',
            templateUrl: 'wst-reports-view/views/index.html',
            controller: 'reportsViewCtrl',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "reports",
                                    files: [
                                      'wst-reports-view/views/reportView.css',
                                      'wst-reports-view/controllers/reportsView.js'
                                    ],
                                    serie: true
                                }
                            );
                        }
                    }
        });

});
