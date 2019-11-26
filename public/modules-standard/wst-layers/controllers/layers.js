
angular.module('wice').controller('adminLayerCtrl', function ($scope,$rootScope,connection,$stateParams,uuid2,$timeout,PagerService,$window, $uibModal, layerForm,deleteLayerConfirm) {

    $scope.sqlModal = 'layer/views/sqlModal.html';

    $rootScope.$emit('$stateChangeSuccess');
/*
    $scope.elementTypes = [
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

    $scope.numberDefaultAggregation = [{name:"Raw (no aggregation)",value:""},
        {name:"SUM",value:"sum"},
        {name:"AVG",value:"avg"},
        {name:"MIN",value:"min"},
        {name:"MAX",value:"max"},
        {name:"COUNT",value:"count"},
        {name:"COUNT DISTINCT",value:"count_distinct"}
    ];
    $scope.stringDefaultAggregation = [{name:"Raw (no aggregation)",value:""},
        {name:"COUNT",value:"count"},
        {name:"COUNT DISTINCT",value:"count_distinct"}
    ];
*/

    //$scope.selectedDts = {};

    //$scope.elementModal = 'layer/views/elementModal.html';

    $scope.getLayers = function(page, search, fields)
    {
        //$rootScope.layoutOptions.sidebar.isVisible = true;

        var params = {};

        params.page = (page) ? page : 1;

        if (search) {
            $scope.search = search;
        }
        else if (page == 1) {
            $scope.search = '';
        }
        if ($scope.search) {
            params.search = $scope.search;
        }

        if (fields) params.fields = fields;

        connection.get('/api/v3/admin/layers', params, function(data) {
            $scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.pager = PagerService.GetPager($scope.items.length, data.page,10,data.pages);
        });
    };

    $scope.newLayer = function() {
            layerForm.showModal({size:'lg',backdrop:true}, {object:undefined,readonly:false}).then(function (result) {
                    $scope.items.push(result);
            });
    };






$scope.delete = function(layer) {
  deleteLayerConfirm.showModal({}, {layer:layer}).then(function (result) {
    for (var i in $scope.items) {
        if ($scope.items[i]._id == layer._id) {
            $scope.removeFromArray($scope.items, $scope.items[i]);
            break;
        }
      }
  });
}


    $scope.changeLayerStatus = function(layer)
    {
      if ($rootScope.isGranted('Layers','update'))
      {
            if (layer.status == 'Draft')
                var newStatus = 'Active';
            if (layer.status == 'Active')
                var newStatus = 'Not active';
            if (layer.status == 'Not active')
                var newStatus = 'Active';

            var data = {status: newStatus}

            connection.post('/api/v3/admin/layers/'+layer._id+'/status', data, function(result) {
                if(result.result == 1) {
                    layer.status = newStatus;
                    toastr.success("Layer status updated");
                }
            });
        }
    }




});
