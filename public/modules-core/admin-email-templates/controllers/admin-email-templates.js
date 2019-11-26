angular.module('wice').controller('adminEmailTemplatesCtrl', function ($scope,connection,$stateParams,$http,emailTemplateForm ) {

      $scope.language = $stateParams.language;
      $scope.contentID = $stateParams.contentID;
      getTemplates();

      $scope.wstDeveloper = false;


      $scope.save = function()
      {
            connection.post('/api/v3/admin/help/content/'+$scope.language+'/'+$scope.contentID, {content:$scope.htmlContent}, function(data) {

            });

      }

      function getTemplates(params)
      {
        var params = (params) ? params : {};

        params.fields = ['code','name'];

        connection.get('/api/v3/admin/email/templates', params, function(data) {
              $scope.templates = data.items;
              $scope.page = data.page;
              $scope.pages = data.pages;
              $scope.perPage = data.perPage;
              $scope.count = data.count;
        });
      }

      $scope.editTemplate = function (template)
      {
        emailTemplateForm.showModal({size:'lg',backdrop:true}, {template:template,wstDeveloper:$scope.wstDeveloper,readonly:false}).then(function (result) {
                //template.name = result.name;
                //template.code = result.code;
        });
      }

      $scope.newTemplate = function ()
      {
        emailTemplateForm.showModal({size:'lg',backdrop:true}, {template:undefined,wstDeveloper:$scope.wstDeveloper,readonly:false}).then(function (result) {
                $scope.templates.push(result);
        });
      }

      function getTemplate()
      {

        connection.get('/api/v3/admin/email/templates/'+$stateParams.templateID, {}, function(data) {
              $scope.template = data.item;
        });
      }



      /*
      "companyID": "5355504552555345522d2d2d",
      "name" : "Password changed",
      "description" : "your password has been changed notification",
      "subject" : "Widestage - Your password has been changed",
      "body" : "<a href=\"http://widestage.com\"> <img src=\"https://s3.amazonaws.com/weelia/uploads/dbteam/Logo-widestage-small.5c506c1f130101af64aec60d.png\" alt=\"Widestage logo\" width=\"200\"></a>\n<h2 style=\"color: #202020;text-align: left;\">Your password has been changed</h2><h3 style=\"color: #606060;text-align: left;\"></h3><p>Your password has been changed, if you just changed your password, ignore this message.. <br><br><strong>If you did not change your password, contact your administrator as soon as possible...</strong></p>\n\n<br>\n<br>\n<br>\n<strong>Best Regards</strong>\n<br>\nYour Widestage team\n",
      "__v" : 0,
      "code" : "passwordChanged",
      "type" : 1,
      "translations" : [],
      "tags" : [ ]


      */

});
