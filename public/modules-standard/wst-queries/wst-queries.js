app.config(function($stateProvider){

        $stateProvider
            .state('sqlEditor', {
                url: "/q",
                templateUrl: "wst-queries/views/index.html",
                controller: 'queriesCtrl',
                resolve: {
                            home: function($ocLazyLoad) {
                                return $ocLazyLoad.load(
                                    {
                                        name: "sqlEditor.index",
                                        files: [
                                            'wst-queries/controllers/queries.js'
                                        ],
                                        serie: true
                                    }
                                );
                            }
                        }
            });

        $stateProvider
            .state('queriesList', {
                url: "/queries",
                templateUrl: "wst-queries/views/list.html",
                controller: 'queriesCtrl',
                resolve: {
                            home: function($ocLazyLoad) {
                                return $ocLazyLoad.load(
                                    {
                                        name: "queriesList.index",
                                        files: [
                                            'wst-queries/controllers/queries.js'
                                        ],
                                        serie: true
                                    }
                                );
                            }
                        }
            });
})
