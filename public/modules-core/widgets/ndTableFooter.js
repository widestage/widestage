app.directive('ndTableFooter', function($rootScope) {
    return {
        restrict: 'E',
        scope: {
            pages: "=",
            page: "=",
            perPage: '=',
            count: "=",
            find: "="
        },
        templateUrl: "/widgets/views/ndTableFooter.html",
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {
                var page = false;
                var perPage = false;
                var count = false;

                scope.__ = $rootScope.__;

                function formatData() {
                    if (page && perPage && count) {
                        scope.from = ((Number(scope.page)*Number(scope.perPage))-Number(scope.perPage))+1;
                        scope.to = (Number(scope.page)*Number(scope.perPage) > Number(scope.count)) ? Number(scope.count) : Number(scope.page)*Number(scope.perPage);
                    }
                }

                scope.goToPage = function(pageNum) {
                    if (pageNum < 1) return;
                    if (pageNum > Number(scope.pages)) return;

                    scope.page = pageNum;

                    scope.find({page: Number(scope.page)});
                };
                scope.prevPage = function(params) {
                    if (Number(scope.page) <= 1) return;

                    Number(scope.page--);

                    scope.find({page: Number(scope.page)});
                };
                scope.nextPage = function(params) {
                    if (Number(scope.page) >= Number(scope.pages)) return;

                    Number(scope.page++);

                    scope.find({page: Number(scope.page)});
                };
                
                scope.getPagesArray = function(num) {
                        return new Array(num);   
                }

                scope.$watch('page', function(){
                    page = true;
                    formatData();
                    scope.top = Number(scope.page)+5;
                    scope.bottom = Number(scope.page)-5;
                });
                scope.$watch('perPage', function(){
                    perPage = true;
                    formatData();
                });
                scope.$watch('count', function(){
                    count = true;
                    formatData();
                });

            };
        }
    };
});
