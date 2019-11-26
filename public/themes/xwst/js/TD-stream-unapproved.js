app.directive('streamUnapproved', function($rootScope, connection){
    return {
        transclude: true,
        scope: {
        },

        template: '<span ng-if="unApprovedPosts > 0" class="badge badge-danger ng-binding ng-scope" ng-bind="unApprovedPosts">{{unApprovedPosts}}</span>',

        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function ($scope, element, attrs) {
                connection.get('/api/v3/admin/stream/get-unapproved', {}, function(data) {
                    console.log('unapproved ', data.count)
                    $scope.unApprovedPosts = data.count;
                    $rootScope.unApprovedPosts = data.count;
                });
    
			}
		}
});
