app.directive('explorerColumnProperties', function($compile, $rootScope, $i18next,widgetsCommon) {
    return {
        transclude: true,
        scope: {
            column: '=',
            report: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/explorerColumnProperties.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          var noAggLabel = $i18next.t('No aggregation');

          $scope.fieldsAggregations = {
              'number': [
                  {name: 'Sum', value: 'sum'},
                  {name: 'Avg', value: 'avg'},
                  {name: 'Min', value: 'min'},
                  {name: 'Max', value: 'max'},
                  {name: 'Count', value: 'count'},
                  {name: 'Count Distinct', value: 'count_distinct'},
                  {name:  noAggLabel, value:''}
              ],
              'date': [
                  {name: 'Min', value: 'min'},
                  {name: 'Max', value: 'max'},
                  {name: noAggLabel, value:''}
              ],
              'string': [
                  {name: 'Count', value: 'count'},
                  {name: 'Count Distinct', value: 'count_distinct'},
                  {name: noAggLabel, value:''}
              ]
          };

          $scope.fontStyles = widgetsCommon.fontStyles;
          $scope.fontWeights = widgetsCommon.fontWeights;
          $scope.textAligns = widgetsCommon.textAligns;

          $scope.hiddenChanged = function()
          {
            $rootScope.$emit('queryDefinitionChanged', {});
          }

          $scope.lineStr = $i18next.t('line');


          $scope.dateExtracts = [
            {name: $i18next.t('Day'), value:'day'},
            {name: $i18next.t('Month'),value:'month'},
            {name: $i18next.t('Year'),value:'year'},
            {name: $i18next.t('Month-Year'),value:'month-year'}
          ]


          $scope.aggChanged = function(column)
          {
            if (column.aggregation == 'raw' || column.aggregation == 'original' || column.aggregation == '')
                {
                    column.objectLabel = column.elementLabel;
                } else {
                    column.objectLabel = column.elementLabel + ' ('+column.aggregation+')';
                }
                $rootScope.$emit('queryDefinitionChanged', {});
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
