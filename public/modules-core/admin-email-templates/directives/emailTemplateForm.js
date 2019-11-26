app.service('emailTemplateForm', ['$uibModal', function($uibModal) {


    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'admin-email-templates/directives/views/emailTemplateForm.html'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show( customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service

        //Create temp objects to work with since we're in a singleton service

        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, connection, $i18next) {

                $scope.modalOptions = tempModalOptions;
                if ($scope.modalOptions.template)
                    {
                      connection.get('/api/v3/admin/email/templates/'+$scope.modalOptions.template._id, {}, function(data) {
                            $scope.template = data.item;
                            $scope.mode = 'edit';
                      });

                    }
                  else
                    {
                      $scope.template = {};
                      $scope.template.type = 1;
                      $scope.template.translations = [];
                      $scope.template.tags = [];
                      $scope.mode = 'new';

                    }

                if ($scope.modalOptions.wstDeveloper)
                    $scope.wstDeveloper = true;

                $scope.readonly = $scope.modalOptions.readonly;

                $scope.tagsCatalog = [
                  {name:'User First Name', value:'*|TAG:USERFIRSTNAME|*'},
                  {name:'User Last Name', value:'*|TAG:USERLASTNAME|*'},
                  {name:'User code', value:'*|TAG:USERCODE|*'},
                  {name:'User email', value:'*|TAG:USEREMAIL|*'},
                  {name:'Change Password URL', value:'*|TAG:CHANGEPWDURL|*'},
                  {name:'New User Password', value:'*|TAG:NEWUSERPASSWORD|*'},
                  {name:'Server URL', value:'*|TAG:SERVERHOSTURL|*'}

                ]


                $scope.newTag = function ()
                {
                  $scope.newTag = {};
                  $scope.addingNewTag = true;
                }

                $scope.saveTag = function ()
                {
                  if ($scope.newTag.name && $scope.newTag.value)
                      {
                          $scope.template.tags.push($scope.newTag);
                          $scope.addingNewTag = false;
                          $scope.newTag = undefined;
                      }
                }

                $scope.deleteTag = function (tag)
                {
                  for( var i in $scope.template.tags){
                     if ( $scope.template.tags[i].value === tag.value) {
                       $scope.template.tags.splice(i, 1);
                       break;
                       return;
                     }
                  }
                }

                $scope.htmlChanged = function(html)
                {
                    $scope.template.body = html;
                }




                $scope.modalOptions.ok = function (result) {
                      if ($scope.mode == 'new')
                      {
                            connection.post('/api/v3/admin/email/templates', $scope.template, function(data) {
                                if (data.result == 1)
                                    $uibModalInstance.close(data.item);
                            });

                      } else {
                        connection.post('/api/v3/admin/email/templates/'+$scope.template._id, $scope.template, function(data) {
                            if (data.result == 1)
                                $uibModalInstance.close();
                        });
                      }


                };


                $scope.modalOptions.close = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };

            }
        }
        return $uibModal.open(tempModalDefaults).result;
        }
}]);
