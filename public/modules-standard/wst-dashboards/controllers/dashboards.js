angular.module('wice').controller('dashboardsCtrl', function ($scope, connection, $stateParams, dashboardNameModal, PagerService,$i18next,confirmModal) {
//  https://github.com/dtpublic/malhar-angular-dashboard

$scope.getDashboards = function(params)
{

    var params = (params) ? params : {};

    params.fields = ['dashboardName','status','description'];

    connection.get('/api/v3/dashboards', params, function(data) {
        $scope.items = data.items;
        $scope.page = data.page;
        $scope.pages = data.pages;
        $scope.perPage = data.perPage;
        $scope.count = data.count;
        //$scope.pager = PagerService.GetPager($scope.items.length, data.page,10,data.pages);
    });
};


$scope.deleteDash =function(dash)
{
  $scope.deleteItem = dash;
  var title = $i18next.t('Delete Dashboard');
  var body = $i18next.t('Are you sure you want to delete this dashboard? ');
  var typeNeeded = true;
  var typeLabel = $i18next.t('Please, type DELETE to confirm');
  var typeWord = $i18next.t('DELETE');
      confirmModal.showModal({}, {title:title,body:body,typeNeeded:typeNeeded,typeLabel:typeLabel,typeWord:typeWord}).then(function (result) {
            connection.post('/api/v3/dashboards/'+dash._id+'/delete', {}, function(data) {
                  if (data.result == 1) {
                      $scope.removeFromArray($scope.items, $scope.deleteItem);
                  }
              });
      });
}



});
