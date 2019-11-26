console.log('loading spaces')
app.config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('/admin/public-space', {
            url: '/admin/public-space',
            templateUrl: 'wst-spaces/views/index.html',
            controller: 'spacesCtrl'
        });
        $stateProvider.state('/admin/public-space/:extra', {
            url: '/admin/public-space/:extra',
            templateUrl: 'wst-spaces/views/index.html',
            controller: 'spacesCtrl'
        });

}]);
