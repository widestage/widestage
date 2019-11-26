'use strict';

app.directive('wiceHelp', function($compile,$location,$rootScope,connection,$http,$stateParams) {
return {
    transclude: true,
    scope: {

    },

   template: '<div class="container-fluid"><div class="container-fluid" ng-if="canEditContent"><a class="btn btn-success" href="#/admin/help/content/{{language}}/{{contentID}}" ng-click="editContent()" ng-i18next="Edit"></a></div><div id="helpHtmlContainer" class="container-fluid"></div></div>',
    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    compile: function (element, attrs) {

        return function ($scope, element, attrs, controller) {



          $scope.language = 'en';

          String.prototype.replaceAll = function(search, replacement) {
              var target = this;
              return target.replace(new RegExp(search, 'g'), replacement);
          };

          $scope.$on('$locationChangeStart', function(event, next, current) {
              $scope.actualPage = $location.path();
              $scope.contentID = $scope.actualPage.replaceAll('/','_');
              getContent();
          });

          $rootScope.$watch('user', function(){

                if ($rootScope.user)
                {
                    if ($rootScope.user.language)
                          $scope.language = $rootScope.user.language;

                      for (var m in $rootScope.user.installedModules)
                        {
                          if ($rootScope.user.installedModules[m] == 'adminHelp')
                              {
                                 if ($rootScope.user.isSUPERADMIN)
                                    {
                                      $scope.canEditContent = true;
                                    }
                              }
                        }
                  }


            });

            $rootScope.$watch('user.language', function(){
                      if ($rootScope.user.language)
                            {
                            $scope.language = $rootScope.user.language;
                            getContent();
                            }
              });

/*
            $scope.editGuidedTour = function()
            {
              guidedTourEditor.showModal({size:'small',backdrop:true}, {parentElement:'app-ui-view',readonly:false}).then(function (theSelectedModel) {

              });

            }
*/



          function getContent()
          {
            var htmlContainer = angular.element($('#helpHtmlContainer'));
///api/v3/help/:language/:document

            //$http.get('/help/'+$scope.language+'/'+$scope.contentID+'.html').then(function(response) {
            $http.get('/api/v3/help/'+$scope.language+'/'+$scope.contentID).then(function(response) {
                  var htmlCode = response.data.item;

                  htmlContainer.empty();
                  var $div = $(htmlCode);
                  htmlContainer.append($div);
                  angular.element(document).injector().invoke(function($compile) {
                      var scope = angular.element($div).scope();
                      $compile($div)(scope);
                  });
            }).catch(function(error) {
              htmlContainer.empty();
            })



          }







        }
      }
    }
});


app.service('helpModal', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          template: '<div class="container-fluid"><div class="container-fluid" ng-if="canEditContent"> {{actualPage}}<a class="btn btn-success" href="#/admin/help/content/{{language}}/{{contentID}}" ng-click="editContent()" ng-i18next="Edit"></a></div><div id="helpHtmlContainer" class="container-fluid"></div></div>'
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
              tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, $i18next) {

                  $scope.modalOptions = tempModalOptions;

                  $scope.language = 'en';

                  if ($scope.modalOptions.language)
                      {
                            $scope.language = $scope.modalOptions.language;
                      }
                  if ($scope.modalOptions.contentID)
                      {
                            $scope.contentID = $scope.modalOptions.contentID;
                      }

                  if ($rootScope.user)
                      {
                          if ($rootScope.user.language)
                                $scope.language = $rootScope.user.language;

                          for (var m in $rootScope.user.installedModules)
                              {
                                if ($rootScope.user.installedModules[m] == 'adminHelp')
                                    {
                                       if ($rootScope.user.isSUPERADMIN)
                                          {
                                            $scope.canEditContent = true;
                                          }
                                    }
                              }
                        }





                      function getContent()
                      {
                        var htmlContainer = angular.element($('#modalHelpHtmlContainer'));

                        $http.get('/help/'+$scope.language+'/'+$scope.contentID+'.html').then(function(response) {
                              var htmlCode = response.data;

                              htmlContainer.empty();
                              var $div = $(htmlCode);
                              htmlContainer.append($div);
                              angular.element(document).injector().invoke(function($compile) {
                                  var scope = angular.element($div).scope();
                                  $compile($div)(scope);
                              });
                        }).catch(function(error) {
                          htmlContainer.empty();
                        })
                      }


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
