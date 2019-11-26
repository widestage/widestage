app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) 
{
        $stateProvider.state('/logout', {
            url: '/logout',
            templateUrl: 'logout/views/index.html',
            controller: 'logOutCtrl'
        });
}]);


app.controller('logOutCtrl', function ($scope,$http,$sessionStorage, $localStorage) {
    $http({method: 'POST', url: '/api/logout'}).
        success(function(data, status, headers, config) {
            $sessionStorage.setObject('user', undefined);
            $sessionStorage.removeObject('user');
            $localStorage.setObject('user', undefined);
            $localStorage.removeObject('user');
            console.log('successfull logout');
            window.location.href = "/logout";
        }).
        error(function(data, status, headers, config) {
            $sessionStorage.setObject('user', undefined);
            $sessionStorage.removeObject('user');
            $localStorage.setObject('user', undefined);
            $localStorage.removeObject('user');
        });
});
