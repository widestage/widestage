app.service('wstExplorerModal', ['$uibModal', function($uibModal) {

      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          template: '<div id="explorerModalContainer" class="row"> '
                      +'<div class="container-fluid"> '
                        +'<button class="btn btn-info save-button pull-right" ng-click="modalOptions.ok();" ng-i18next="Save"></button>'
                        +'<button class="btn btn-default pull-right" ng-click="modalOptions.close();" ng-i18next="Cancel"></button>'
                      +'</div>'
                    +'</div>'
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
              tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, $i18next,$ocLazyLoad,$compile,queryModel,reportModel,$timeout) {

                  $scope.modalOptions = tempModalOptions;

                  if ($scope.modalOptions.model)
                      $scope.model = $scope.modalOptions.model;

                  if ($scope.modalOptions.object)
                      {
                        $scope.properties = $scope.modalOptions.object.properties;
                      }
                  if ($scope.modalOptions.reportID)
                  {
                      $scope.reportID = $scope.modalOptions.reportID;


                          reportModel.getReportDefinition($scope.modalOptions.reportID,false,'explorer', function(theReport) {
                                $scope.report = theReport;
                                $scope.query = theReport.query;
                                loadFiles(function(){
                                  //$rootScope.$emit('queryDefinitionChanged', {});
                                /*  queryModel.getQueryData2($scope.query, function(data,sql){
                                          $scope.report.properties.columns = $scope.query.columns;
                                          $scope.report.query = $scope.query;
                                          $scope.report.query.data = data;
                                          $scope.report.query.sql = sql;
                                          reportModel.prepareReport($scope.report,'reportLayout','edit');
                                  */      $timeout(function() {
                                            $rootScope.$emit('queryDefinitionChanged', {});
                                          }, 1000);

                                  //});
                                });
                          });

                  } else {

                    var report = {};
                    report._id = 'XXXXXX';
                    report.draft = true;
                    report.badgeStatus = 0;
                    report.exportable = true;
                    report.badgeMode = 1;
                    report.properties = {};
                    report.properties.xkeys = [];
                    report.properties.ykeys = [];
                    report.properties.columns = [];
                    report.properties.pivotColumns = [];
                    report.properties.pivotRows = [];
                    report.properties.pivotMeasures = [];
                    report.properties.height = 300;

                    report.reportType = 'grid';
                    report.parentDiv = 'reportLayout';

                    queryModel.initQuery(function(qu){
                        report.query = qu;
                        $scope.query = qu;
                    });

                    $scope.report = report;
                    loadFiles(function(){
                    });
                  }

                  function loadFiles(done)
                  {
                   $ocLazyLoad.load({

                                  name: "explorer_directives",
                                  files: [
                                    'wst-explorer-modal/directives/explorerPropertiesVerticalGrid.js',
                                    'wst-explorer-modal/directives/explorerColumnProperties.js',
                                    'wst-explorer-modal/directives/explorerColumnArea.js',
                                    'wst-explorer-modal/directives/explorerOrderArea.js',
                                    'wst-explorer-modal/directives/explorerIndicatorProperties.js',
                                    'wst-explorer-modal/directives/views/explorerFilterArea.css',
                                    'wst-explorer-modal/directives/explorerFilterPromptModal.js',
                                    'wst-explorer-modal/directives/explorerFilterArea.js',
                                    'wst-explorer-modal/directives/views/explorerDropArea.css',
                                    'wst-explorer-modal/directives/explorerDropArea.js',
                                    'wst-explorer-modal/directives/views/explorerMainArea.css',
                                    'wst-explorer-modal/directives/explorerMainArea.js',
                                    'wst-explorer-modal/directives/views/elementsPanel.css',
                                    'wst-explorer-modal/directives/elementsPanel.js',
                                    'wst-explorer-modal/directives/propertiesC3Chart.js',
                                    'wst-explorer-modal/directives/propertiesGrid.js',
                                    'wst-explorer-modal/directives/views/explorer.css',
                                    'wst-explorer-modal/directives/explorer.js'
                                  ],
                                  serie: true

                          }).then(function() {
                                 var html = '<div class="explorer-body"><wst-elements-panel report="report" query="query"></wst-elements-panel><wst-explorer-main-area id="explorerMainArea" properties="properties" report="report"></wst-explorer-main-area></div>';

                                 var $directive = angular.element(html);
                                 $compile($directive)($scope);

                                 var panelBody = angular.element($('#explorerModalContainer'));

                                 if (panelBody)
                                 {
                                     panelBody.append($directive);
                                 }
                                 done();
                          });
                  }


                  $scope.readonly = $scope.modalOptions.readonly;

                  $scope.modalOptions.ok = function (result) {
                          $uibModalInstance.close($scope.report);

                  };


                  $scope.modalOptions.close = function (result) {
                      $uibModalInstance.dismiss('cancel');
                  };



              }
          }
          return $uibModal.open(tempModalDefaults).result;
          }
  }]);
