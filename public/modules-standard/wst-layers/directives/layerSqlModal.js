app.service('layerSQLModal', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'wst-layers/directives/views/layerSqlModal.html'
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
              tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, connection, $i18next,connectionModel) {

                  $scope.modalOptions = tempModalOptions;
                  if ($scope.modalOptions.layer)
                      {
                        $scope.layer = $scope.modalOptions.layer;
                        $scope.selectedDts = $scope.layer.model.datasourceID;
                      }
                  if ($scope.modalOptions.connections)
                      {
                        $scope.connections = $scope.modalOptions.connections;
                        if ($scope.layer.model.datasourceID)
                        {
                        for (var c in $scope.connections)
                          {
                            if ($scope.connections[c]._id === $scope.layer.model.datasourceID)
                                {
                                  $scope.selectedConnection = $scope.connections[c];
                                }
                          }
                        } else {
                          $scope.datasourceHasToBeChoosed = true;

                        }

                      }

                  $scope.temporarySQLCollection = {};

                  $scope.executeSql = function()
                  {
                    if ($scope.layer.model.datasourceID && $scope.temporarySQLCollection.sqlQuery)
                    {
                      var params = {};
                      params.sqlQuery =  $scope.temporarySQLCollection.sqlQuery;
                      params.page = 1;
                      params.source = 'Layer - custom query dataset';
                      params.layerID = $scope.layer._id;
                      $scope.queryFaillure = false;
                      $scope.querySuccess = false;

                      connection.post('/api/v3/connection/'+$scope.layer.model.datasourceID+'/query', params, function(data) {
                            if (data.result == 1)
                              {
                                $scope.querySuccess = true;
                                $scope.addSQLSuccessMessage = $i18next.t('Query executed successfully');
                              } else {
                                $scope.queryFaillure = true;
                                $scope.addSQLErrorMessage = $i18next.t('Error executing query')+ ' ' + data.msg;
                              }

                      });
                  }
                  }

                  $scope.addSqlToLayer = function()
                  {
                    $scope.queryFaillure = false;
                    $scope.querySuccess = false;

                    if ($scope.layer.model.datasourceID && $scope.temporarySQLCollection.sqlQuery)
                      connectionModel.getSqlQuerySchema($scope.layer.model.datasourceID,$scope.temporarySQLCollection,function(result){
                          if (result.result === 1) {
                              var schema = result.schema;


                              var theNewEntity = {};
                              theNewEntity.datasourceID = schema.datasourceID;
                              theNewEntity.entityID = schema.entityID;
                              theNewEntity.entityType = schema.entityType;
                              theNewEntity.attributes = [];
                              theNewEntity.table_name = schema.table_name;
                              theNewEntity.sqlQuery = schema.sqlQuery;
                              for (var f in schema.attributes) {
                                  var theElement = {};
                                  theElement.collectionID = theNewEntity.entityID;
                                  theElement.collectionName = theNewEntity.table_name;
                                  theElement.collectionType = theNewEntity.entityType;
                                  theElement.collectionSQL = theNewEntity.sqlQuery;
                                  theElement.datasourceID = theNewEntity.datasourceID;
                                  theElement.elementID = schema.attributes[f].elementID;
                                  theElement.elementName = schema.attributes[f].elementName;
                                  theElement.elementLabel = schema.attributes[f].elementName;
                                  theElement.table_name = schema.attributes[f].table_name;
                                  theElement.data_type = schema.attributes[f].data_type;
                                  theElement.elementType = schema.attributes[f].elementType;
                                  theElement.length = schema.attributes[f].length;
                                  theElement.precission = schema.attributes[f].precission;
                                  theElement.scale = schema.attributes[f].scale;
                                  theElement.is_nullable = schema.attributes[f].is_nullable;
                                  theElement.isPK = schema.attributes[f].isPK;
                                  theNewEntity.attributes.push(theElement);
                              }
                              $rootScope.$emit('addEntity', theNewEntity);

                              $uibModalInstance.close();
                          } else {
                              $scope.queryFaillure = true;
                              $scope.addSQLErrorMessage = result.msg;
                          }
                      });
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
