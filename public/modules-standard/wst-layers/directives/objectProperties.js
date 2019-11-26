app.directive('objectProperties', function($rootScope,$compile,icons) {
return {
    transclude: true,
    scope: {
        onChange: '=',
        onDelete: '&',
        objectType: '=',
        object: '=',
        elementTypes: '=',
        stringDefaultAggregation: '=',
        numberDefaultAggregation: '=',
        layer: '=',
        onRemoveElementFromLayer: '=',
        onAddElementToLayer: '=',
        connections: '='
    },

   templateUrl: "wst-layers/directives/views/objectProperties.html",
        // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {


      $scope.elementTypes = $rootScope.elementTypes;
      $scope.elementRoles = $rootScope.elementRoles;
      $scope.numberDefaultAggregation = $rootScope.numberDefaultAggregation;
      $scope.stringDefaultAggregation = $rootScope.stringDefaultAggregation;


        $scope.delete = function()
        {
            //$scope.onDelete($scope.object,$scope.objectType);
            deleteObject();
        }

        $scope.changeJoinMultiplicity = function(multiplicity)
        {
            //$scope.object.multiplicity = multiplicity;
            $scope.onChange('multiplicity',multiplicity);
        }

        $scope.publishElement = function()
        {
            $scope.onAddElementToLayer($scope.object);
        }

        $scope.removeElement = function()
        {
          deleteElement($scope.object);
          if ($scope.onRemoveElementFromLayer)
            $scope.onRemoveElementFromLayer($scope.object);
        }

        $scope.onElementChanged = function(element)
        {
              for (var e in $scope.layer.objects)
              {
                  if ( $scope.layer.objects[e].elementID == element.elementID)
                  {
                        $scope.layer.objects[e].elementRole =  element.elementRole;
                        $scope.layer.objects[e].elementType =  element.elementType;
                        if ($scope.layer.objects[e].elementType == 'DECIMAL' || $scope.layer.objects[e].elementType == 'INTEGER' || $scope.layer.objects[e].elementType == 'FLOAT')
                            $scope.layer.objects[e].elementRole = 'measure';
                            else
                            $scope.layer.objects[e].elementRole = 'dimension';
                        $scope.layer.objects[e].elementLabel =  element.elementLabel;
                        $scope.layer.objects[e].defaultAggregation =  element.defaultAggregation;
                        $scope.layer.objects[e].values =  element.values;
                        $scope.layer.objects[e].format =  element.format;
                        $scope.layer.objects[e].associatedElements =  element.associatedElements;
                  }
              }
       }

       function deleteObject()
        {
            if ($scope.objectType == 'entity')
                {
                  deleteAllEntityElements();
                }
            $rootScope.$emit('deletedObject', {object:$scope.object,objectType:$scope.objectType});
            $scope.onDelete($scope.object,$scope.objectType);

        }

        function deleteAllEntityElements()
        {
          var entityID = $scope.object.entityID;

          for (var s in $scope.layer.model.entities)
          {

            if ($scope.layer.model.entities[s].entityID == entityID)
            {
              for (var e in $scope.layer.model.entities[s].attributes)
              {
                    checkfordelete($scope.layer.objects,$scope.layer.model.entities[s].attributes[e].elementID);
              }
            }
          }
        }




        function deleteElement(element)
        {
            var elementID = element.elementID;

            for (var s in $scope.layer.model.entities)
            {
                for (var e in $scope.layer.model.entities[s].attributes)
                {
                    if ($scope.layer.model.entities[s].attributes[e].elementID == elementID)
                    {
                        delete $scope.layer.model.entities[s].attributes[e]['elementRole'];
                    }
                }
            }


            checkfordelete($scope.layer.objects,elementID);
        }

        function checkfordelete(elements,elementID)
        {

            for (var i in elements)
            {

                if (elements[i].elementID == elementID)
                {
                    //unassingElementRole(elements[i]);
                    elements.splice(i,1);
                    return;
                } else {
                    if (elements[i].elements)
                        if (elements[i].elements.length > 0)
                            checkfordelete(elements[i].elements,elementID);


                }
            }
        }
/*
        function unassingElementRole(element)
        {
            var elementID = element.elementID;

            for (var s in $scope._Layer.params.schema)
            {
                for (var e in $scope._Layer.params.schema[s].elements)
                {
                    if ($scope._Layer.params.schema[s].elements[e].elementID == elementID)
                    {
                        delete $scope._Layer.params.schema[s].elements[e]['elementRole'];
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


        */





    }

}

});
