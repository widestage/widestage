app.controller('PROdataSourceCtrl', function($scope, $controller, $stateParams, connection) {
    $controller('dataSourceCtrl', {$scope: $scope});

    $scope.getStatistics = function(params) {
        connection.get('/api/data-sources/find-one', {id: $stateParams.dataSourceID}, function(data) {
        	var DataSource = data.item;

        	var m = new Date().getMonth()+1, y = new Date().getFullYear();

            if (DataSource.usageStatistics && DataSource.usageStatistics[y] && DataSource.usageStatistics[y][m]) {
                DataSource.totalUsage = DataSource.usageStatistics[y][m].totalUsage; 
                DataSource.numberOfExecutions = DataSource.usageStatistics[y][m].numberOfExecutions;
            }

            $scope._dataSource = DataSource;
        });
    };
    
});
