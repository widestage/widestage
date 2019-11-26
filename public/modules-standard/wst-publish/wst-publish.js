app.directive('wstPublishButton', function($compile, $rootScope, objectPublishModal, $i18next) {
    return {
        transclude: true,
        scope: {
            objectType: '=',
            objectId: '=',
            objectLabel: '=',
            objectParentFolder: '=',
            objectIsPublic: '=',
            object: '='
        },

        template: '<li><a  ng-click="publish()" ><i class="fa fa-globe"></i>{{publishLabel}}</a></li>',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs ) {

              $scope.publishLabel = $i18next.t('Publish');

              $scope.isSUPERADMIN = $rootScope.user.isSUPERADMIN;
              $scope.publish = function()
              {
                //objectPublishModal.showModal
                objectPublishModal.showModal({}, {object:$scope.object,objectType:$scope.objectType,objectId:$scope.objectId,objectLabel:$scope.objectLabel,objectParentFolder:$scope.objectParentFolder,objectIsPublic:$scope.objectIsPublic}).then(function (result) {

                });
              }

        }
      }
});


app.service('objectPublishModal', ['$uibModal', function($uibModal) {
          var modalDefaults = {
              backdrop: true,
              keyboard: true,
              modalFade: true,
              templateUrl: 'wst-publish/views/publishModal.html'
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
                  tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, connection, $i18next, $rootScope) {

                      $scope.modalOptions = tempModalOptions;

                      if ($scope.modalOptions.object)
                          {
                                $scope.object = $scope.modalOptions.object;
                          }

                      $scope.objectType = $scope.modalOptions.objectType;
                      $scope.objectId = $scope.modalOptions.objectId;
                      $scope.objectLabel = $scope.modalOptions.objectLabel;
                      $scope.objectParentFolder = $scope.modalOptions.objectParentFolder;
                      $scope.objectIsPublic = $scope.modalOptions.objectIsPublic;

                      $scope.isSUPERADMIN = $rootScope.user.isSUPERADMIN;
                      $scope.userObjects = $rootScope.userObjects;

                      if ($scope.userObjects == undefined)
                      {
                        connection.get('/api/get-my-objects', {}, function(data) {
                            $rootScope.userObjects = data.items;
                            $scope.userObjects = data.items;
                            $rootScope.user.canPublish = data.userCanPublish;
                        });
                      }



                      var objectID = $scope.modalOptions.objectID;


                      $scope.selectThisFolder = function(folderID)
                          {
                              if ($scope.objectType == 'report')
                                  var url = '/api/v3/reports/publish/';
                              if ($scope.objectType == 'dashboard')
                                  var url = '/api/v3/dashboards/publish/';

                              connection.post(url+$scope.objectId+'/'+folderID, {}, function(data) {
                                    if (data.result == 1)
                                      {
                                          $scope.object.parentFolder = folderID;
                                          $scope.object.isPublic = true;
                                          $scope.objectParentFolder = folderID;
                                          $scope.objectIsPublic = true;
                                          $uibModalInstance.close();
                                      }
                              });


                          }

                          $scope.unpublish = function()
                              {
                                  if ($scope.objectType == 'report')
                                      var url = '/api/v3/reports/unpublish/';
                                  if ($scope.objectType == 'dashboard')
                                      var url = '/api/v3/dashboards/unpublish/';


                                  connection.post(url+$scope.objectId, {}, function(data) {
                                        if (data.result == 1)
                                          {
                                              $scope.object.parentFolder = undefined;
                                              $scope.object.isPublic = false;
                                              $scope.objectParentFolder = undefined;
                                              $scope.objectIsPublic = false;
                                              $uibModalInstance.close();
                                          }
                                  });


                              }

                      $scope.collapseAll = function () {
                          $scope.$broadcast('angular-ui-tree:collapse-all');
                      };

                      $scope.expandAll = function () {
                        $scope.$broadcast('angular-ui-tree:expand-all');
                      };


                      $scope.readonly = $scope.modalOptions.readonly;

                      $scope.modalOptions.ok = function (result) {
                            $uibModalInstance.close();

                      };


                      $scope.modalOptions.close = function (result) {
                          $uibModalInstance.dismiss('cancel');
                      };


                  }
              }
              return $uibModal.open(tempModalDefaults).result;
              }
      }]);
