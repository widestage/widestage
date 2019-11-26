angular.module('wice').controller('reportsCtrl', function ($scope,$rootScope,connection,$stateParams,uuid2,$timeout,PagerService,wstExplorerModal,queryModel,reportNameModal,reportModel,$i18next,confirmModal) {



  $scope.getReports = function(params)
  {
      var params = (params) ? params : {};

      params.fields = ['reportName','status','description','reportType'];

      connection.get('/api/v3/reports', params, function(data) {
          $scope.items = data.items;
          $scope.page = data.page;
          $scope.pages = data.pages;
          $scope.perPage = data.perPage;
          $scope.count = data.count;
          //$scope.pager = PagerService.GetPager($scope.items.length, data.page,10,data.pages);
      });
  };


  $scope.newReport = function()
  {
    wstExplorerModal.showModal({size:'full',backdrop:false}, {object:{properties:{showReportTypes:true}},readonly:false}).then(function (theReport) {

        reportNameModal.showModal({size:'lg',backdrop:true}, {object:theReport,readonly:false}).then(function (theSelectedElement) {
                  reportModel.saveAsReport(theReport,'new',function(data){
                      $scope.items.push({_id:data.item._id,reportName:data.item.reportName,reportType:data.item.reportType,status:'Active'});
                  });
        });
    });
  }

  $scope.editReport = function(report)
  {
    wstExplorerModal.showModal({size:'full',backdrop:false}, {reportID:report._id,object:{properties:{showReportTypes:true}},readonly:false}).then(function (theReport) {
      reportModel.saveAsReport(theReport,'edit',function(data){

      });
    });
  }


  $scope.deleteReport =function(report)
  {
    $scope.deleteItem = report;
    var title = $i18next.t('Delete Report');
    var body = $i18next.t('Are you sure you want to delete this report? , ALL DASHBOARDS USING THIS REPORT WILL BE AFFECTED!');
    var typeNeeded = true;
    var typeLabel = $i18next.t('Please, type DELETE to confirm');
    var typeWord = $i18next.t('DELETE');
        confirmModal.showModal({}, {title:title,body:body,typeNeeded:typeNeeded,typeLabel:typeLabel,typeWord:typeWord}).then(function (result) {
              connection.post('/api/v3/reports/'+report._id+'/delete', {}, function(data) {
                    if (data.result == 1) {
                        $scope.removeFromArray($scope.items, $scope.deleteItem);
                    }
                });
        });
  }

  $scope.changeReportStatus = function(report)
  {

    if ($rootScope.isGranted('Reports','update'))
    {
        if (report.status == 'Active' || report.status == 'Not active') //Other status like alert statuses (layer not active) can't be changed
        {
            if (report.status == 'Active')
                var newStatus = 'Not active';
            if (report.status == 'Not active')
                var newStatus = 'Active';

            var data = {status: newStatus}

            connection.post('/api/v3/reports/'+report._id+'/status', data, function(result) {
                if(result.result == 1) {
                    report.status = newStatus;
                    toastr.success($i18next.t("Report status updated"));
                }
            });
        }
    }
  }


});
