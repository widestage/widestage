'use strict';

app.directive('layerElements', function($compile, $rootScope, connectionModel,connection, uuid2,layerElementForm) {
    return {
        transclude: true,
        scope: {
            layer: '='
        },

        templateUrl: "wst-layers/directives/views/layerElements.html",

        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function ($scope, element, attrs) {


          $scope.$watch('layer', function(val,old){
            if ($scope.layer)
              {
              $scope.elements = $scope.layer.objects;

              }
          });

          $scope.addFolder = function()
          {
              var elementID = uuid2.newguid();

              var element = {};
              element.elementLabel = 'my folder';
              element.elementRole = 'folder';
              element.elementID = elementID;
              element.editing = true;
              element.elements = [];
              $scope.layer.objects.push(element);
          }

          $scope.deleteSchemaElement = function(element)
          {

              var elementID = element.elementID;

              for (var e in $scope.layer.model.entities) {
                  for (var a in $scope.layer.model.entities[e].attributes) {
                      if ($scope.layer.model.entities[e].attributes[a].elementID == elementID) {
                          delete $scope.layer.model.entities[e].attributes[a]['elementRole'];
                      }
                  }
              }

              checkfordelete($scope.elements,elementID);
              //$scope.tabs.selected = 'elements';

          }

          function checkfordelete(elements,elementID)
          {

              for (var i in elements)
              {

                  if (elements[i].elementID == elementID)
                  {
                      unassingElementRole(elements[i]);
                      elements.splice(i,1);
                      return;
                  } else {
                      if (elements[i].elements)
                          if (elements[i].elements.length > 0)
                              checkfordelete(elements[i].elements,elementID);


                  }
              }
          }

          function unassingElementRole(element)
          {
              var elementID = element.elementID;

              for (var e in $scope.layer.model.entities)
              {
                  for (var a in $scope.layer.model.entities[e].attributes)
                  {
                      if ($scope.layer.model.entities[e].attributes[a].elementID == elementID)
                      {
                          delete $scope.layer.model.entities[e].attributes[a]['elementRole'];
                      }
                  }
              }

              if (element.elements)
                  if (element.elements.length > 0)
                  {
                      for (var i in element.elements)
                      {
                          unassingElementRole(element.elements[i])
                      }
                  }
          }

          $scope.editElement = function (element)
          {
              for (var e in $scope.layer.model.entities)
              {
                  if ( $scope.layer.model.entities[e].entityID == element.collectionID)
                  {
                      for (var a in $scope.layer.model.entities[e].attributes)
                      {
                          if ($scope.layer.model.entities[e].attributes[a].elementID == element.elementID)
                          {
                              layerElementForm.showModal({size:'lg',backdrop:true}, {object:$scope.layer.model.entities[e].attributes[a],readonly:false}).then(function (theModifiedElement) {
                                for (var e in $scope.layer.objects)
                                {
                                    if ( $scope.layer.objects[e].elementID == theModifiedElement.elementID)
                                    {
                                          $scope.layer.objects[e].elementRole =  theModifiedElement.elementRole;
                                          $scope.layer.objects[e].elementType =  theModifiedElement.elementType;
                                          $scope.layer.objects[e].elementLabel =  theModifiedElement.elementLabel;
                                          $scope.layer.objects[e].defaultAggregation =  theModifiedElement.defaultAggregation;
                                          $scope.layer.objects[e].values =  theModifiedElement.values;
                                          $scope.layer.objects[e].format =  theModifiedElement.format;
                                          $scope.layer.objects[e].associatedElements =  theModifiedElement.associatedElements;
                                    }
                                }
                              });
                          }
                      }
                  }
              }
          }

        }
      }
});
