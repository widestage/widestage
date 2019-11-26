'use strict';

app.directive('propertiesC3Chart', function($compile, $rootScope,queryModel,reportModel) {
    return {
        transclude: true,
        scope: {
            report: '=',
            onChange: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/propertiesC3Chart.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          $scope.$watch('report', function(val,old){
              if ($scope.report && $scope.report.properties && $scope.report.properties.chart)
              {
                $scope.axis_x_show = $scope.report.properties.chart.axis_x_show;
                $scope.axis_y_show = $scope.report.properties.chart.axis_y_show;
                $scope.axis_y2_show = $scope.report.properties.chart.axis_y2_show;
                $scope.axis_rotated = $scope.report.properties.chart.axis_rotated;
                $scope.legend_show = $scope.report.properties.chart.legend_show;
                $scope.tooltip_show = $scope.report.properties.chart.tooltip_show;
                $scope.chart = $scope.report.properties.chart;
              } else {

              }
        });


        $scope.getDataColumns = function()
        {
            if ($scope.report && $scope.report.properties && $scope.report.properties.chart)
                return $scope.report.properties.chart.dataColumns;
        }

        $scope.changeChartColumnType = function(column,type)
        {
            column.type = type;
            //sync in the report
            for (var chartDataColumn in $scope.report.properties.chart.dataColumns)
            {
                if (column.elementID == $scope.report.properties.chart.dataColumns[chartDataColumn].elementID)
                    $scope.report.properties.chart.dataColumns[chartDataColumn].type = type;
            }
            $scope.report.properties.chart.refresh();
        }

      }
    }
});
