console.log('loading explorer')
app.config(function($stateProvider)
{
        $stateProvider.state('/explore', {
            url: '/explore',
            templateUrl: 'wst-explorer/views/explorer.html',
            controller: 'explorerCtrlPage',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "explorer",
                                    files: [
                                      'wst-explorer-modal/directives/explorerPropertiesVerticalGrid.js',
                                      'wst-explorer-modal/directives/explorerColumnProperties.js',
                                      'wst-explorer-modal/directives/explorerColumnArea.js',
                                      'wst-explorer-modal/directives/explorerOrderArea.js',
                                      'wst-explorer-modal/directives/explorerIndicatorProperties.js',
                                      'wst-explorer-modal/directives/explorerFilterPromptModal.js',
                                      'wst-explorer-modal/directives/views/explorerFilterArea.css',
                                      'wst-explorer-modal/directives/explorerFilterArea.js',
                                      'wst-explorer-modal/directives/views/explorerDropArea.css',
                                      'wst-explorer-modal/directives/explorerDropArea.js',
                                      'wst-explorer-modal/directives/views/explorerMainArea.css',
                                      'wst-explorer-modal/directives/explorerMainArea.js',
                                      'wst-explorer-modal/directives/views/elementsPanel.css',
                                      'wst-explorer-modal/directives/elementsPanel.js',
                                      'wst-explorer-modal/directives/propertiesC3Chart.js',
                                      'wst-explorer-modal/directives/propertiesGrid.js',
                                      'wst-explorer-modal/directives/views/explorer.css',
                                      'wst-explorer/controllers/explorer.js'
                                    ],
                                    serie: true
                                }
                            );
                        }
                    }
        });

        $stateProvider.state('/explore/:explorer_service', {
            url: '/explore/:explorer_service',
            templateUrl: 'wst-explorer/views/explorer.html',
            controller: 'explorerCtrl',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "explorer",
                                    files: [
                                      'wst-explorer-modal/directives/explorerPropertiesVerticalGrid.js',
                                      'wst-reports/directives/reportNameModal.js',
                                      'wst-explorer/directives/explorerColumnProperties.js',
                                      'wst-explorer/directives/explorerColumnArea.js',
                                      'wst-explorer/directives/explorerOrderArea.js',
                                      'wst-explorer-modal/directives/explorerIndicatorProperties.js',
                                      'wst-explorer-modal/directives/explorerFilterPromptModal.js',
                                      'wst-explorer/directives/views/explorerFilterArea.css',
                                      'wst-explorer/directives/explorerFilterArea.js',
                                      'wst-explorer/directives/views/explorerDropArea.css',
                                      'wst-explorer/directives/explorerDropArea.js',
                                      'wst-explorer/directives/views/explorerMainArea.css',
                                      'wst-explorer/directives/explorerMainArea.js',
                                      'wst-explorer/directives/views/elementsPanel.css',
                                      'wst-explorer-modal/directives/propertiesC3Chart.js',
                                      'wst-explorer-modal/directives/propertiesGrid.js',
                                      'wst-explorer/directives/elementsPanel.js',
                                      'wst-explorer/views/explorer.css',
                                      'wst-explorer/controllers/explorer.js'
                                    ],
                                    serie: true
                                }
                            );
                        }
                    }
        });

});
