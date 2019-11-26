angular.module('wice').controller('adminLayerDesignerCtrl', function ($scope,$rootScope,connection,$stateParams,uuid2,layerElementForm) {


  connection.get('/api/v3/admin/layers/'+$stateParams.layerID, {}, function(data) {
      $scope._Layer = data.item;

      if (!$scope._Layer.model)
          {
          $scope._Layer.model = {};
          $scope._Layer.model.dialect = 'GENERIC';
          }

  });

  $rootScope.elementTypes = [
      {name:"string",value:"STRING"},
      {name:"decimal",value:"DECIMAL"},
      {name:"integer",value:"INTEGER"},
      {name:"float",value:"FLOAT"},
      {name:"boolean",value:"BOOLEAN"},
      {name:"date",value:"DATE"},
      {name:"array",value:"ARRAY"},
      {name:"object",value:"OBJECT"},
      {name:"binary",value:"BINARY"},
      {name:"other",value:"OTHER"}
  ];

  $rootScope.elementRoles = [
      {name:"Measure",value:"measure"},
      {name:"Dimmension",value:"dimension"}
  ];

  $rootScope.numberDefaultAggregation = [{name:"Raw (no aggregation)",value:"none"},
      {name:"SUM",value:"sum"},
      {name:"AVG",value:"avg"},
      {name:"MIN",value:"min"},
      {name:"MAX",value:"max"},
      {name:"COUNT",value:"count"},
      {name:"COUNT DISTINCT",value:"count_distinct"}
  ];

  $rootScope.stringDefaultAggregation = [{name:"Raw (no aggregation)",value:"none"},
      {name:"COUNT",value:"count"},
      {name:"COUNT DISTINCT",value:"count_distinct"}
  ];

  $scope.onDiagramChanged = function ()
  {

  }

  $scope.onDiagramSelect = function(selectType,selectID)
  {

  }

  $scope.elementAdd = function (element)
  {

      layerElementForm.showModal({size:'lg',backdrop:true}, {object:element,readonly:false}).then(function (theSelectedElement) {
                if (!$scope._Layer.objects)
                  $scope._Layer.objects = [];

              $scope._Layer.objects.push(theSelectedElement);
      });
  }

  $scope.save = function()
  {
    connection.post('/api/v3/admin/layers/'+$scope._Layer._id, $scope._Layer, function(data) {
      if (data.result = 1)
      {

      }

    });
  }

  $scope.onDeleteObject = function(object)
  {
      if (object.objectType = 'entity')
      {
          //for (var obj in $scope._Layer.objects)
          for (obj = $scope._Layer.objects.length-1; obj > -1; obj--)
          {
              if ($scope._Layer.objects[obj].collectionID == object.entityID)
                  $scope._Layer.objects.splice(obj,1);
          }
      }
      if (object.objectType = 'attribute')
      {
        //for (var obj in $scope._Layer.objects)
        for (obj = $scope._Layer.objects.length-1; obj > -1; obj--)
        {
          if ($scope._Layer.objects[obj].elementID == object.elementID)
              $scope._Layer.objects.splice(obj,1);
        }
      }

  }

});
