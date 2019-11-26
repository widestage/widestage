app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider)
{
        $stateProvider.state('/companies/setup', {
            url: '/companies/setup?error',
            templateUrl: 'companies/views/setup.html',
            controller: 'companiesCtrl'
        });
}])


app.controller('companiesCtrl', function ($scope, connection, $http, $rootScope, $sessionStorage, $state) {

    $scope.checkErrors = function() {
         $scope.errors = {};

        if ($state.params.error) {
            if ($state.params.error == 'required-data') {
                $scope.errors.requiredData = true;
            }
        }
    };

	$scope.initForm = function() {
        $scope.checkErrors();

        connection.get('/api/company/get-company-data', {}, function(data) {
            var Company = data.items;

            var m = new Date().getMonth()+1, y = new Date().getFullYear();

            if (Company.usageStatistics && Company.usageStatistics[y] && Company.usageStatistics[y][m]) {
                Company.totalUsage = Company.usageStatistics[y][m].totalUsage;
                Company.numberOfExecutions = Company.usageStatistics[y][m].numberOfExecutions;
            }

            $scope._Company = Company;
        });
    };

    $scope.save = function() {
        if ($scope.selectedFile) {
            var fd = new FormData();

            fd.append('file', $scope.selectedFile);

        }

    	connection.post('/api/company/save-setup', $scope._Company, function(data) {
            if(data.result == 1) {
                $rootScope.user.companyData = $scope._Company;
                $sessionStorage.setObject('user', $rootScope.user);
                toastr.success("Company updated");

                $scope.checkErrors();
            }
    	});
    };

    $scope.upload = function(file) {
        if (file) {
            var fd = new FormData();

            fd.append('file', file);

            $http.post('/api/files/upload', fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function (data) {
                $scope._Company.customLogo = data.file.url;
            })
            .error(function (data, status) {

            });
        }
    };

});
