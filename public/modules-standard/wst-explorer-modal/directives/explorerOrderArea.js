'use strict';

app.directive('wstExplorerOrderArea', function($compile, $rootScope,queryModel) {
    return {
        transclude: true,
        scope: {
            /*model: '=',
            properties: '=',
            onChange: '=',
            onSelect: '=',
            onElementAdd: '=',
            layer: '=',*/
            query: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/explorerOrderArea.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {
          //$scope.query = queryModel.query();


          $scope.onDropOrder = function (data, event, type, group) {

                var customObjectData = data['json/custom-object'];

                $scope.addOrderColumn(customObjectData,type);

          };


          $scope.addOrderColumn = function(ngModelItem,type)
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
                              sortType: -1,
                              aggregation: agg};

                        addOrderColumn($scope.query,element, function(){

                        });


          }

          $scope.sortTypeClicked = function(field, sortType)
          {
              field.sortType = sortType;
              $rootScope.$emit('queryDefinitionChanged', {});
          }

          $scope.removeOrder = function(order)
              {
                  $rootScope.removeFromArray($scope.query.order, order);
                  for (var i in $scope.query.order)
                      {
                          if ($scope.query.order[i].elementID == order.elementID)
                              {

                                  $scope.query.order.splice(i,1);
                              }
                      }

                  $rootScope.$emit('queryDefinitionChanged', {});
              }

          function addOrderColumn(query,element,done) {

                  if (!query.order)
                           query.order = [];

                  var found = false;

                  for (var i in query.order)
                       {
                          if (query.order[i].elementID == element.elementID)
                              found = true;
                       }
                  if (!found)
                  {

                      query.order.push(element);

                      $rootScope.$emit('queryDefinitionChanged', {});
                      done();

                  } else {
                    toastr.error('That column already exists in order');
                    done();
                  }
              };

        }
  }

});
