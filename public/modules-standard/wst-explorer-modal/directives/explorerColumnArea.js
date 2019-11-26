'use strict';

app.directive('wstExplorerColumnArea', function($compile, $rootScope,queryModel) {
    return {
        transclude: true,
        scope: {
            /*report: '=',
            onChange: '=',
            onSelectColumn: '='*/
            query: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/explorerColumnArea.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {
            //$scope.query = queryModel.query();

            $scope.onDrop = function (data, event, type, group) {

                  var customObjectData = data['json/custom-object'];

                  $scope.addColumn(customObjectData,type);
            };

            $scope.addColumn = function(ngModelItem,type)
            {
                var agg = undefined;
                var aggLabel = '';


                if (ngModelItem.aggregation == 'none')
                    {
                        delete(ngModelItem.aggregation);
                    }

                if (ngModelItem.aggregation)
                    {
                    agg = ngModelItem.aggregation;
                    aggLabel = ' ('+ngModelItem.aggregation+')';
                    }

                if (ngModelItem.defaultAggregation == 'none' || ngModelItem.defaultAggregation == 'original')
                    {
                        delete(ngModelItem.defaultAggregation);
                    }

                if (ngModelItem.defaultAggregation)
                    {
                    agg = ngModelItem.defaultAggregation;
                    aggLabel = ' ('+ngModelItem.defaultAggregation+')';
                    }

                        var element = {
                                elementName: ngModelItem.elementName,
                                objectLabel: ngModelItem.elementLabel +aggLabel,
                                datasourceID:ngModelItem.datasourceID,
                                id:ngModelItem.id,
                                elementLabel:ngModelItem.elementLabel,
                                collectionID:ngModelItem.collectionID,
                                collectionName:ngModelItem.collectionName,
                                collectionSchema:ngModelItem.collectionSchema,
                                collectionType:ngModelItem.collectionType,
                                collectionSQL: ngModelItem.collectionSQL,
                                elementID: ngModelItem.elementID,
                                elementType: ngModelItem.elementType,
                                elementRole: ngModelItem.elementRole,
                                layerID: $scope.selectedLayerID,
                                filterType: 'equal',
                                filterPrompt: false,
                                filterTypeLabel:'equal',
                                format:ngModelItem.format,
                                values:ngModelItem.values,
                                aggregation: agg};

                          queryModel.addColumn($scope.query,element, function(){
                                  /*  if ($rootScope.interactiveMode)
                                        $scope.getDataForPreview();
                                    else
                                        $scope.prepareReport();*/
                          });


            }

            $scope.remove = function(column)
            {
                if ($scope.query.columns)
                    $rootScope.removeFromArray($scope.query.columns, column);

                for (var i in $scope.query.columns)
                    {
                        if ($scope.query.columns[i].elementID == column.elementID)
                            {

                                $scope.query.columns.splice(i,1);
                            }
                    }

                $rootScope.$emit('queryDefinitionChanged', {});
            }

            $scope.hideColumn = function(column,hidden)
                {
                    column['hidden'] = hidden;
                    //queryModel.hideColumn(column.elementID,hidden);

                        for( var i  in   $scope.query.columns)
                            {
                                if (  $scope.query.columns[i].elementID == elementID)
                                {
                                      $scope.query.columns[i].hidden = hidden;
                                      $rootScope.$emit('queryDefinitionChanged', {});
                                }

                            }


                }

            $scope.selectColumn = function(column)
            {
              $rootScope.$emit('explorerItemSelected', {type:'column',object:column,report:$scope.report});
            }
/*
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
*/
        }
  }

});
