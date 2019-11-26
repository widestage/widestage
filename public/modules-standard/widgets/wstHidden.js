'use strict';

app.directive('wstHidden', function($compile) {
return {
    transclude: true,
    scope: {
        onChange: '=',
        ngModel: '='
    },

   templateUrl: "widgets/views/wstHidden.html",

    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {
        switch (attrs['type']) {
            case "text":
                // append input field to "template"
            case "select":
                // append select dropdown to "template"
        }

      $scope.hiddenIn = [];

      $scope.items = [
                        {name:'Large Desktop', value:'hiddenLG'},
                        {name:'Desktop', value:'hiddenMD'},
                        {name:'Tablet', value:'hiddenSM'},
                        {name:'Phone', value:'hiddenXS'},
                        {name:'Printer', value:'hiddenPrint'}
                     ];

      $scope.$watch('ngModel', function(){
            $scope.hiddenIn = $scope.ngModel;
            /*$scope.hiddenLG = $scope.ngModel.hiddenLG;
            $scope.hiddenMD = $scope.ngModel.hiddenMD;
            $scope.hiddenSM = $scope.ngModel.hiddenSM;
            $scope.hiddenXS = $scope.ngModel.hiddenXS;
            $scope.hiddenPrint = $scope.ngModel.hiddenPrint;
            */
      });

      $scope.onSelect = function()
      {
          $scope.ngModel = $scope.hiddenIn;
          $scope.onChange($scope.hiddenIn);
      }

      $scope.onRemove = function()
      {
          $scope.ngModel = $scope.hiddenIn;
          $scope.onChange($scope.hiddenIn);
      }



    }
}
});
