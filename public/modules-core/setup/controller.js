app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) 
{
        $stateProvider.state('/setup', {
            url: '/setup',
            templateUrl: 'setup/views/index.html',
            controller: 'setupCtrl'
        });
}]);

app.controller('setupCtrl', function ($scope,connection,$stateParams) {

    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'css'
    };

    $scope.saveCustomCSS = function()
    {
        connection.post('/api/company/save-custom-css', {customCSS:$scope.customCSS}, function(data) {

            });

    }


});
