'use strict';

app.directive('wstElementsPanel', function($compile, $rootScope,queryModel,userSettings,connection) {
    return {
        transclude: true,
        scope: {
            query: '=',
            report: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/elementsPanel.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          var selectedLayer = undefined;
/*
          if ($scope.query.selectedLayerID)
              $scope.selectedLayerID = $scope.query.selectedLayerID
          else
             $scope.selectedLayerID = userSettings.getUserSetting('lastSelectedLayerID');
             */

            $scope.tabs = [];
            $scope.tabs.selected = 'elements';

            $rootScope.interactiveMode = userSettings.getUserSetting('interactiveMode');
            if (!$rootScope.interactiveMode)
                  $rootScope.interactiveMode = false;

            $scope.changeInteractiveMode = function()
            {
                userSettings.setUserSetting('interactiveMode',$scope.interactiveMode);
                $rootScope.interactiveMode = $scope.interactiveMode;
            }

            $scope.interactiveMode = $rootScope.interactiveMode;

            //$scope.query = queryModel.query();

            getLayers(function(layers){
              $scope.layers = layers;

              var defaultUserSelectedLayer = userSettings.getUserSetting('lastSelectedLayerID');

              if ($scope.query.selectedLayerID)
                  defaultUserSelectedLayer = $scope.query.selectedLayerID;

              for (var l in layers)
                  {
                    if (layers[l]._id == defaultUserSelectedLayer)
                      {
                        $scope.selectedLayerID = defaultUserSelectedLayer;
                      }
                  }

              if (!$scope.selectedLayerID && $scope.query.selectedLayerID)
                  $scope.layerIsNotActive = true;

              if ($scope.selectedLayerID)
                  changeLayer($scope.query,$scope.selectedLayerID);
            });






            $scope.changeLayer = function(selectedLayerID)
            {
                changeLayer($scope.query,selectedLayerID);

            }


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
                          });


            }

            $rootScope.$on('queryDefinitionChanged', function (event, data) {
                    if (!$scope.layers)
                    {
                      getLayers(function(layers){
                        $scope.layers = layers;
                        detectLayerJoins($scope.layers,$scope.query);
                      });
                    } else {
                      detectLayerJoins($scope.layers,$scope.query);
                    }

            });

            $rootScope.$on('explorerItemSelected', function (event, data) {
                  $scope.tabs.selected = 'properties';
                  $scope.selectedItemType = data.type;
                  $scope.selectedObject = data.object;
                  $scope.selectedReport = data.report;

            });

            function setSelectedLayer(query,layer,done)
            {
                selectedLayer = layer;
                $scope.selectedLayerID = layer._id;
                $scope.query.selectedLayerID = layer._id;
                $scope.elements = layer.objects;
                calculateIdForAllElements($scope.elements);
                userSettings.setUserSetting('lastSelectedLayerID',$scope.selectedLayerID);
            }

            function changeLayer(query,selectedLayerID)
            {

                connection.get('/api/v3/layers/'+selectedLayerID, {}, function(data) {
                    if (data.result == 1)
                      {
                        setSelectedLayer(query,data.item);
                      }
                });
            }

            function getLayers(done) {

                if (!$scope.layers || $scope.layers.length == 0)
                    {

                        connection.get('/api/v3/layers', {page:0}, function(data) {
                            if (data.result == 1)
                                {
                                    calculateIdForAllElements($scope.elements);
                                    done(data.items);
                                }
                        });
                    }
            };

            function calculateIdForAllElements(elements)
            {
                for (var e in elements)
                {
                        if (elements[e].collectionID)
                        {
                        var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;
                        elements[e].id = elementID;
                        }

                    if (elements[e].elements)
                        calculateIdForAllElements(elements[e].elements);
                }
            }


            function detectLayerJoins(layers,query)
            {
                if (layers && layers.length > 0)
                    {
                checkChoosedElements(query);

                queryModel.generateQuery(query);



                    //this function enables and disables elements in the layer if there is a join between the elements in the report and the element in the layer...
                    var reportCollections = [];
                    var selectableCollections = [];

                    for (var i in query.datasources) {
                        for (var c in query.datasources[i].collections) {
                             reportCollections.push(query.datasources[i].collections[c].collectionID);
                             selectableCollections.push(query.datasources[i].collections[c].collectionID);
                        }
                    }

                if (!selectedLayer)
                    {
                        for (var i in layers)
                            {
                                if (layers[i]._id == query.selectedLayerID)
                                    {
                                        selectedLayer = layers[i];


                                    }
                            }
                    }

                      if (selectedLayer)
                        {

                            if (selectedLayer.model && selectedLayer.model.joins)
                            for (var j in selectedLayer.model.joins)
                            {

                                for (var c in reportCollections)
                                {
                                    if (selectedLayer.model.joins[j].sourceParentID == reportCollections[c])
                                    {

                                             if (selectableCollections.indexOf(selectedLayer.model.joins[j].sourceParentID) == -1)
                                                 selectableCollections.push(selectedLayer.model.joins[j].sourceParentID);

                                             if (selectableCollections.indexOf(selectedLayer.model.joins[j].targetParentID) == -1)
                                                 selectableCollections.push(selectedLayer.model.joins[j].targetParentID);
                                    }

                                    if (selectedLayer.model.joins[j].targetParentID == reportCollections[c])
                                    {

                                        if (selectableCollections.indexOf(selectedLayer.model.joins[j].sourceParentID) == -1)
                                            selectableCollections.push(selectedLayer.model.joins[j].sourceParentID);

                                        if (selectableCollections.indexOf(selectedLayer.model.joins[j].targetParentID) == -1)
                                            selectableCollections.push(selectedLayer.model.joins[j].targetParentID);
                                    }
                                }
                            }

                            if (selectableCollections.length == 0)
                                enableAllElements($scope.elements);
                            else
                                detectLayerJoins4Elements($scope.elements,selectableCollections);

                          }
                    }

            }

            function checkChoosedElements(query)
            {
                if (query.columns && query.columns.length > 1)
                {
                    for( var e=query.columns.length -1;e>=0;e--)
                    {
                        if (thereIsAJoinForMe(query,query.columns[e]) == 0)
                        {
                            query.columns.splice(e,1);
                        }
                    }
                }
            }

            function enableAllElements(elements)
            {
                for (var e in elements)
                {
                    if (elements[e].elementRole != 'folder')
                    {
                            elements[e].enabled = true;
                    }

                    if (elements[e].id == undefined)
                    {
                        if (elements[e].collectionID)
                            {
                               var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;
                                if (elements[e].aggregation)
                                  elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName+elements[e].aggregation;
                                elements[e].id = elementID;
                            }

                    }

                    if (elements[e].elements)
                        enableAllElements(elements[e].elements);
                }
            }

            function detectLayerJoins4Elements(elements,selectableCollections)
            {
                for (var e in elements)
                {
                    if (elements[e].elementRole != 'folder')
                    {
                        if (selectableCollections.indexOf(elements[e].collectionID) == -1)
                        {
                            elements[e].enabled = false;
                         } else {
                            elements[e].enabled = true;
                        }

                    }
                    if (elements[e].elements)
                        detectLayerJoins4Elements(elements[e].elements,selectableCollections);

                }
            }

            function thereIsAJoinForMe(query,element)
            {
                var found = 0;
                for (var i in query.columns)
                {
                     if (element.elementID != query.columns[i].elementID)
                     {
                         if (joinExists(element.collectionID,query.columns[i].collectionID) || (element.collectionID == query.columns[i].collectionID))
                            found = found+1;
                     }
                }

                return found;
            }

            function joinExists(collection1,collection2)
            {
                var found = false;


                if (!selectedLayer || !selectedLayer.model || !selectedLayer.model.joins) return false;


                if (collection1 != collection2)
                {
                    for (var j in selectedLayer.model.joins)
                    {
                        if ((selectedLayer.model.joins[j].sourceParentID == collection1 && selectedLayer.model.joins[j].targetParentID == collection2) ||
                            (selectedLayer.model.joins[j].sourceParentID == collection2 && selectedLayer.model.joins[j].targetParentID == collection1))
                        {
                            found = true;
                        }
                    }
                } else
                    found = true;

                return found;
            }




        }
      }
  });
