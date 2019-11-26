

app.directive('inlineHelpPanel', function($rootScope,$location) {
    return {
        transclude: true,
        scope: {
            path: '=',
            language: '='
        },

        templateUrl: "/support/directives/views/inlineHelpPanel.html",

        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function ($scope, element, attrs) {

          /*
          use $location.path();
          To know exactly where the user is and then make a search in our online help system
          */


        }
      }
  });
