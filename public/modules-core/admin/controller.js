app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) 
{
    $stateProvider.state('/admin', {
            url: '/admin',
            templateUrl: 'admin/views/index.html',
            controller: 'adminCtrl'
        });
}]);


app.controller('adminCtrl', ['$scope', '$rootScope',function ($scope, $rootScope) {

    $rootScope.layoutOptions.sidebar.isVisible = true;

}]);