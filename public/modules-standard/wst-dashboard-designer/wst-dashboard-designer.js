console.log('loading dashboard designer');
app.config(function($stateProvider)
{
        $stateProvider.state('/dashboards/designer/:mode/:dashboardID', {
            url: '/dashboards/designer/:mode/:dashboardID',
            templateUrl: 'wst-dashboard-designer/views/index.html',
            controller: 'dashboardDesignerCtrl',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "dashboardDesigner",
                                    files: [
                                      'wst-dashboards/views/style.css',
                                      'wst-dashboards/directives/dashNameModal/dashNameModal.js',
                                      'wst-dashboards/directives/reportListModal/reportListModal.js',
                                      'wst-dashboard-designer/directives/dashProperties.js',
                                      'wst-dashboard-designer/directives/dashBandProperties.js',
                                      'wst-dashboard-designer/directives/dashWidgetProperties.js',
                                      'wst-dashboards/directives/dashWidgetBand/dashWidgetBand.js',
                                      'wst-dashboards/directives/dashWidget/dashWidget.js',
                                      'wst-dashboards/directives/dashWidgetContainer/dashWidgetContainer.js',
                                      'wst-dashboard-designer/directives/views/dashboardDesigner.css',
                                      'wst-dashboard-designer/directives/dashboardDesignerMainArea.js',
                                      'wst-dashboard-designer/directives/dashboardDesignerPropertiesPanel.js',
                                      'wst-dashboard-designer/controllers/dashboardDesigner.js'
                                    ],
                                    serie: true,
                                    cache: false
                                }).then(function(){

                                });
                        }
                    }
        });

});
