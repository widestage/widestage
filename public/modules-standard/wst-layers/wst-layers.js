app.config(function($stateProvider)
{
        $stateProvider.state('/layers', {
            url: '/admin/layers',
            templateUrl: 'wst-layers/views/index.html',
            controller: 'adminLayerCtrl',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "adminLayers.index",
                                    files: [
                                        'wst-layers/directives/deleteLayerdirective.js',
                                        'wst-layers/directives/layerForm.js',
                                        'wst-layers/controllers/layers.js'
                                    ],
                                    serie: true
                                }
                            );
                        }
                    }
        });

        $stateProvider.state('/layers/:layerID/designer', {
            url: '/layers/:layerID/designer',
            templateUrl: 'wst-layers/views/layerDesigner.html',
            controller: 'adminLayerDesignerCtrl',
            resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                {
                                    name: "adminConnections.index",
                                    files: [

                                        'wst-layers/views/layerDesigner.css',
                                        'wst-layers/directives/views/layerElements.css',
                                        'wst-layers/directives/layerElements.js',
                                        'wst-layers/directives/views/objectProperties.css',
                                        'wst-layers/directives/views/layerElementForm.css',
                                        'wst-layers/directives/layerSqlModal.js',
                                        'wst-layers/directives/layerElementForm.js',
                                        'wst-layers/directives/objectProperties.js',
                                        'wst-layers/directives/objectPanel.js',
                                        'wst-layers/controllers/layerDesigner.js'
                                    ],
                                    serie: true
                                }
                            );
                        }
                    }
        });
})
