angular.module('wice').controller('AdminConnectionsCtrlV3', function ($scope, $rootScope, connection, $stateParams,$timeout,PagerService,$http, connectionForm, $i18next, confirmModal) {



  $scope.getConnections = function(page, search, fields) {
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

      connection.get('/api/v3/admin/connections', params, function(data) {
          $scope.items = data.items;
          $scope.page = data.page;
          $scope.pages = data.pages;
          $scope.pager = PagerService.GetPager($scope.items.length, data.page,10,data.pages);
      });

  };

  $scope.getConnections = function(params)
  {
      var params = (params) ? params : {};

      params.fields = ['name','type','params.connection.host','params.connection.port','params.connection.database'];

      connection.get('/api/v3/admin/connections', params, function(data) {
          $scope.items = data.items;
          $scope.page = data.page;
          $scope.pages = data.pages;
          $scope.perPage = data.perPage;
          $scope.count = data.count;
      });
  }

  $scope.newConnection = function() {
          connectionForm.showModal({size:'lg',backdrop:true}, {object:undefined,readonly:false}).then(function (result) {
                  $scope.items.push(result);
          });
  };

  $scope.editConnection = function(dts) {

        connection.get('/api/v3/admin/connections/'+dts._id, {}, function(data) {
            if (data.result == 1 && data.item)
            {
              connectionForm.showModal({size:'lg',backdrop:true}, {object:data.item,readonly:false}).then(function (result) {

              });

            }
        });

  };

  $scope.deleteConnection =function(dts)
  {
    $scope.deleteItem = dts;
    var title = $i18next.t('Delete Connection');
    var body = $i18next.t('Are you sure you want to delete this connection? , ALL LAYERS, REPORTS AND DASHBOARDS USING THIS CONNECTION WILL BECOME INNACTIVE!');
        confirmModal.showModal({}, {title:title,body:body}).then(function (result) {
              connection.post('/api/v3/admin/connections/'+dts._id+'/delete', {}, function(data) {
                    if (data.result == 1) {
                        $scope.removeFromArray($scope.items, $scope.deleteItem);
                    }
                });
        });
  }

});
