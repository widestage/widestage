'use strict';

app.directive('wstColor', function($compile) {
return {
    transclude: true,
    scope: {
        onChangeColor: '&',
        label: '@',
        ngModel: '=',
        ngDisabled: '='
    },

   template: '<div class="input-group">'
                +'<div class="form-control" style="height:32px;padding:5px">'
                    +'<span style="height:20px;width: 25px;background-color:{{selectedColor}};position: absolute;" ></span>'
                +'</div>'
                +'<span  class="input-group-addon icp icp-dd btn btn-primary dropdown-toggle iconpicker-element" data-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" style="height:32px;" ng-disabled="{{ngDisabled}}" >'
                    +'<span class="caret"></span>'
                +'</span>'
                    +'<div class="dropdown-menu iconpicker-container dropdown-menu-right dropdown-menu-bottomRight" style="min-width:120px"><div class="iconpicker-popover popover fade in inline" style="top: auto; right: auto; bottom: auto; left: auto; max-width: none;"><div class="arrow"></div><div class="popover-content"><div class="iconpicker">'
                    +'<button class="btn btn-info" ng-click="clearColor()" >clear</button>'
                    +'<div class="iconpicker-items">'
                     +'<a role="button" ng-click="changeColor(color)" class="iconpicker-item" ng-repeat="color in colors" style="background-color: {{color}}"></a>'
                    +'</div></div></div></div></div>'
            +'</div>',
    require: 'ngModel',
    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    compile: function (element, attrs) {

        return function ($scope, element, attrs, controller) {


        $scope.colors = ['transparent','#FFFFFF','#CCCCCC','#FFFF00','#FF0000','#00FF00','#0000FF','#999999','#000000','#000033','#000066','#000099','#0000CC','#003300','#D24D57', '#F22613', '#D91E18', '#96281B', '#EF4836', '#D64541', '#C0392B', '#CF000F', '#E74C3C', '#DB0A5B', '#F64747', '#F1A9A0', '#D2527F', '#E08283', '#F62459', '#E26A6A', '#DCC6E0', '#663399', '#674172', '#AEA8D3', '#913D88', '#9A12B3', '#BF55EC', '#BE90D4', '#8E44AD', '#9B59B6', '#446CB3', '#E4F1FE', '#4183D7', '#59ABE3', '#81CFE0', '#52B3D9', '#C5EFF7', '#22A7F0', '#3498DB', '#2C3E50', '#19B5FE', '#336E7B', '#22313F', '#6BB9F0', '#1E8BC3', '#3A539B', '#34495E', '#67809F', '#2574A9', '#1F3A93', '#89C4F4', '#4B77BE', '#5C97BF', '#4ECDC4', '#A2DED0', '#87D37C', '#90C695', '#26A65B', '#03C9A9', '#68C3A3', '#65C6BB', '#1BBC9B', '#1BA39C', '#66CC99', '#36D7B7', '#C8F7C5', '#86E2D5', '#2ECC71', '#16a085', '#3FC380', '#019875', '#03A678', '#4DAF7C', '#2ABB9B', '#00B16A', '#1E824C', '#049372', '#26C281', '#FDE3A7', '#F89406', '#EB9532', '#E87E04', '#F4B350', '#F2784B', '#EB974E', '#F5AB35', '#D35400', '#F39C12', '#F9690E', '#F9BF3B', '#F27935', '#E67E22', '#ececec', '#6C7A89', '#D2D7D3', '#EEEEEE', '#BDC3C7', '#ECF0F1', '#95A5A6', '#DADFE1', '#ABB7B7', '#F2F1EF', '#BFBFBF', '#E6E2AF', '#A7A37E', '#EFECCA', '#046380', '#002F2F', '#468966', '#FFF0A5', '#FFB03B', '#B64926', '#8E2800', '#1E1E20'];

        $scope.$watch('ngModel', function(){
          $scope.selectedColor = $scope.ngModel;
        });

     $scope.changeColor = function(color)
     {

          $scope.selectedColor = color;
          $scope.ngModel = color;
            setTimeout(function() {
              $scope.$apply();
              if ($scope.onChangeColor)
                  $scope.onChangeColor();
                }, 0);
     }

     $scope.clearColor = function()
     {
         $scope.selectedColor = null;
         $scope.ngModel = null;
         if ($scope.onChangeColor)
             $scope.onChangeColor();
     }

     $scope.changeInput = function()
     {
         $scope.ngModel = $scope.selectedColor;
         controller.$setViewValue($scope.ngModel);
     }


        };
    }
}
});
