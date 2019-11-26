angular.module('wice').controller('spacesCtrl', function ($scope,$rootScope, connection, uuid2, $stateParams, $timeout, $i18next, formModalUniversal, objectPermissionsModal) {

    $rootScope.$emit('$stateChangeSuccess');

    if ($stateParams.extra == 'intro') {
            $timeout(function(){$scope.showIntro()}, 1000);
    }

    $scope.initIndex = function() {
        connection.get('/api/v3/admin/spaces', {}, function(data) {

            if (data.item && data.item.spaceDefinition)
            {
              $scope.space = data.item;
              if (!$scope.space.spaceDefinition)
                  {
                  $scope.space.spaceDefinition = {};
                  $scope.space.spaceDefinition.folders = [];
                  }
              $scope.mode = 'edit';
            } else {
              $scope.space= {};
              $scope.space.spaceDefinition = {};
              $scope.space.spaceDefinition.folders = [];
              //$scope.initialData = [];
              $scope.mode = 'new';
            }
        });
    };


    var html =  '<form name="myForm">'
                +'<div class="form-group">'
                +'<label for="folderName" class="control-label">Folder name</label>'
                +'<input type="text" class="form-control" name="folderName" id="folderName"  ng-model="model.name" required>'
                +'<span class="error" ng-show="myForm.folderName.$error.required">Name is required!</span>'
                +'</div>'
                +'</form>';

    $scope.newSubItem = function (scope) {
      var theModel = {};



      formModalUniversal.showModal({size:'small',backdrop:true}, {object:{model:theModel,html:html},readonly:false}).then(function (theSelectedModel) {
            var nodeData = scope.$modelValue;

            if (nodeData == undefined)
            {
                $scope.space.spaceDefinition.folders.push({
                    id:uuid2.newguid(),
                    title: theModel.name,
                    nodes: []
                })
            } else {

            nodeData.nodes.push({
                id: uuid2.newguid(),
                title: theModel.name,
                nodes: []
            });
            }
            saveSpace();

      });

    };

    function saveSpace()
    {
      var endPoint = '/api/v3/admin/spaces'
      if ($scope.space._id)
          {
          endPoint = '/api/v3/admin/spaces/'+$scope.space._id;
        } else {

        }

          $scope.space.spaceDefinition.description = 'public space definition';
          var space = $scope.space.spaceDefinition;

          connection.post(endPoint, {spaceDefinition:$scope.space.spaceDefinition}, function(data) {

            if (data.result === 1 && data.item && !$scope.space._id)
              {
                  $scope.space._id = data.item._id;
              }
          });
    }

    $scope.editFolder = function(folder)
    {
      var theModel = {};
      theModel.name = folder.title;


      formModalUniversal.showModal({size:'small',backdrop:true}, {object:{model:theModel,html:html},readonly:false}).then(function (theSelectedModel) {
            folder.title = theModel.name;
            saveSpace();
      });
    }

    $scope.setPermissions = function(folder)
    {
        objectPermissionsModal.showModal({}, {object:folder,objectID:folder.id,objectName:'public-space-folders',objectLabel:'Public space folder grants'}).then(function (result) {

        });
    }



    $scope.remove = function (scope) {
        scope.remove();
    };

    $scope.toggle = function (scope) {
        scope.toggle();
    };

});
