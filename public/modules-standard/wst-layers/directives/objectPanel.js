'use strict';

app.directive('wstObjectPanel', function($compile, $rootScope,connectionModel,layerSQLModal) {
    return {
        transclude: true,
        scope: {
            model: '=',
            properties: '=',
            onChange: '=',
            onSelect: '=',
            onElementAdd: '=',
            layer: '='
        },

        templateUrl: 'wst-layers/directives/views/objectPanel.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

            $scope.tabs = [];
            $scope.tabs.selected = 'elements';



            $scope.$watch('layer', function(val,old){

                if ($scope.layer)
                {
                    $scope._Layer = $scope.layer;

                }
            });

            $scope.onAddedDatasetToLayer = function(dataset,datasourceID)
            {

                if (!$scope.layer.model.datasourceID)
                {
                    $scope.layer.model.datasourceID = datasourceID;
                }
            }



            $rootScope.$on('entityDiagramObjectSelected', function (event, data) {

              var selectType = data.type;
                //unSelect();
                if (data.id) {
                    var selectID = data.id;
                    $scope.selectedItem = data.type;

                    $scope.selectedID = data.id;
                    $scope.tabs.selected = 'properties';
                    if (selectType == 'join') {
                        for (var j in $scope.layer.model.joins) {
                            if ($scope.layer.model.joins[j].joinID == selectID) {
                                $scope.theSelectedElement = $scope.layer.model.joins[j];
                            }
                        }
                    }
                    if (selectType == 'entity') {
                        for (var e in $scope.layer.model.entities) {
                            if ($scope.layer.model.entities[e].entityID == selectID) {
                                $scope.theSelectedElement = $scope.layer.model.entities[e];
                            }
                        }
                    }

                    if (selectType == 'attribute') {
                        for (var e in $scope.layer.model.entities) {
                            for (var a in $scope.layer.model.entities[e].attributes) {

                                if ($scope.layer.model.entities[e].attributes[a].elementID == selectID) {
                                    $scope.theSelectedElement = $scope.layer.model.entities[e].attributes[a];
                                }
                            }
                        }
                    }

                    if (selectType == 'comment') {
                        for (var e in $scope.layer.model.comments) {
                            if ($scope.layer.model.comments[e].commentID == selectID) {
                                $scope.theSelectedElement = $scope.layer.model.comments[e];
                            }
                        }
                    }

                    //$scope.theSelectedElement = join;

                } else {
                    if (data.type == 'model')
                    {
                        $scope.selectedItem = selectType;
                        $scope.selectedID = $scope.layer._id;
                        $scope.theSelectedElement = $scope.layer;
                        $scope.tabs.selected = 'properties';
                    }
                }
                $scope.$apply();

            });

            $scope.deleteObject = function(object,objectType)
            {
                $scope.tabs.selected = 'elements';
            }

            $scope.setConnections = function(connections)
            {
              $scope.connections = connections;

                  if ($scope.layer.model.datasourceID)
                  {
                      for (var c in $scope.connections)
                        {
                          if ($scope.connections[c]._id === $scope.layer.model.datasourceID)
                              {
                                $scope.selectedConnection = $scope.connections[c];
                              }
                        }
                  }
            }

            $scope.addSQL = function()
            {
                layerSQLModal.showModal({size:'md',backdrop:true}, {layer:$scope.layer,connections:$scope.connections,readonly:false}).then(function (theSQLQuery) {

                });
            }


        }
      }
  });
