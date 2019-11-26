console.log('loading dashboards-wiew');
app.config(function($stateProvider)
{
        $stateProvider.state('/dashboard/:dashboardID', {
            url: '/dashboard/:dashboardID',
            templateUrl: 'wst-dashboards-view/views/view.html',
            controller: 'dashboardsViewCtrl',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "dashboardsNew",
                                    files: [
                                      'wst-dashboards/views/style.css',
                                      'wst-dashboards/directives/dashWidgetBand/dashWidgetBand.js',
                                      'wst-dashboards/directives/dashWidget/dashWidget.js',
                                      'wst-dashboards/directives/dashWidgetContainer/dashWidgetContainer.js',
                                      'wst-dashboards-view/views/dashboardView.css',
                                      'wst-dashboards-view/controllers/dashboards-view.js'
                                    ],
                                    serie: true
                                }
                            );
                        }
                    }
        });

});
