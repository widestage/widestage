app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider)
{
    $stateProvider.state('/home', {
                url: '/home',
                templateUrl: 'home/views/index.html',
                controller: 'homeCtrl'
            });

}]);

app.controller('homeCtrl', ['$scope', '$rootScope','$sessionStorage','connection','$i18next','userSettings' ,function ($scope, $rootScope,$sessionStorage, connection,$i18next,userSettings ) {

    $scope.dashboardsNbr = 3;
    $scope.reportsNbr = 10;
    $scope.notificationsNbr = 0;
    $scope.alertsNbr = 0;
    $scope.subPage = 'js/report/list.html';
    //$scope.data = $rootScope.user.companyData.publicSpace;

    var exitStr = $i18next.t('Exit');
    var thanksStr = $i18next.t('Thanks');

    $rootScope.IntroOptions = {
                showStepNumbers: false,
                exitOnOverlayClick: true,
                exitOnEsc:true,
                nextLabel: '<strong ng-i18next="Next"></strong>',
                prevLabel: '<span style="color:green" ng-i18next="Previous"></span>',
                skipLabel: exitStr,
                doneLabel: thanksStr,
                scrollToElement: true
            };


    connection.get('/api/get-my-counts', {}, function(data) {
            $rootScope.counts = data;
            //$homeGuidedTour.getIntraOptions();
        });

    connection.get('/api/get-my-favourites', {}, function(data) {

            $scope.favourites = data.favourites;
    });


    //$rootScope.layoutOptions.sidebar.isVisible = false;
    $rootScope.$emit('$stateChangeSuccess');

    connection.get('/api/get-my-other-data', {}, function(data) {
        var user = data.items;
        $rootScope.user.contextHelp = user.contextHelp;
    });

    connection.get('/api/get-my-last-executions', {}, function(data) {
        $scope.lastExecutions = [];
        $scope.mostExecutions = [];

        for ( var l in data.items.theLastExecutions)
            {
                if (l < 10)
                {
                    data.items.theLastExecutions[l].lastDateMoment =  moment(data.items.theLastExecutions[l].lastDate).fromNow();
                    $scope.lastExecutions.push(data.items.theLastExecutions[l]);
                    }
            }
        for ( var m in data.items.theMostExecuted)
            {
                if (m < 10)
                {
                    $scope.mostExecutions.push(data.items.theMostExecuted[m]);
                }
            }

    });




    $scope.collapseAll = function () {
        $scope.$broadcast('angular-ui-tree:collapse-all');
      };

      $scope.expandAll = function () {
        $scope.$broadcast('angular-ui-tree:expand-all');
      };

    $scope.logOut = function()
    {
        logout();
    }

    $scope.getCounts = function()
    {
     /*   connection.get('/api/get-counts', {}, function(data) {
            $rootScope.counts = data;

        });*/
    }

    $scope.refreshHome = function()
    {
        connection.get('/api/get-my-objects', {}, function(data) {
            $rootScope.userObjects = data.items;
            $rootScope.user.canPublish = data.userCanPublish;
        });

        connection.get('/api/get-my-counts', {}, function(data) {
            $rootScope.counts = data;
        });
    }

    $scope.search = function()
    {

    }

    $scope.notShowHomeContextHelp = userSettings.getUserSetting('notShowHomeContextHelp');

    $scope.doNotShowHomeContextHelp = function()
    {
        userSettings.setUserSetting('notShowHomeContextHelp',true);
        $scope.notShowHomeContextHelp = true;
    }

}]);
