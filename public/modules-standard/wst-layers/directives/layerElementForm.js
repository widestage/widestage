app.service('layerElementForm', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: 'wst-layers/directives/views/layerElementForm.html'
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
                  if ($scope.modalOptions.object)
                      {
                        $scope.originalElement = $scope.modalOptions.object;
                        $scope.selectedElement = $rootScope.clone($scope.originalElement);
                      }

                  $scope.dateFormats = [
                    {value:'YYYY-MM-DD'  ,name:'YYYY-MM-DD'},
                    {value:'YYYY.MM.DD'  ,name:'YYYY.MM.DD'},
                    {value:'YYYY/MM/DD'  ,name:'YYYY/MM/DD'},
                    {value:'DD-MM-YYYY'  ,name:'DD-MM-YYYY'},
                    {value:'DD/MM/YYYY'  ,name:'DD/MM/YYYY'},
                    {value:'DD.MM.YYYY'  ,name:'DD.MM.YYYY'},
                    {value:'dd MON YYYY'  ,name:'dd MON YYYY'},
                    {value:'MON dd YYYY'  ,name:'MON dd YYYY'},
                    {value:'MM/DD/YYYY'  ,name:'MM/DD/YYYY'},
                    {value:'MM-DD-YYYY'  ,name:'MM-DD-YYYY'}
                  ]

                  $scope.readonly = $scope.modalOptions.readonly;


                  $scope.modalOptions.ok = function (result) {
                      checkElementOk($scope.selectedElement,function(result){
                          if (result.result == 1) {
                                saveEditElement();
                                $uibModalInstance.close($scope.originalElement);
                          }
                      })

                  };


                  $scope.modalOptions.close = function (result) {
                      $uibModalInstance.dismiss('cancel');
                  };

                  function saveEditElement() {
                                            $scope.originalElement.elementRole = $scope.selectedElement.elementRole;
                                            $scope.originalElement.elementType = $scope.selectedElement.elementType;
                                            if ($scope.originalElement.elementType == 'DECIMAL' || $scope.originalElement.elementType == 'INTEGER' || $scope.originalElement.elementType == 'FLOAT')
                                                $scope.originalElement.elementRole = 'measure';
                                                else
                                                $scope.originalElement.elementRole = 'dimension';

                                            $scope.originalElement.elementLabel = $scope.selectedElement.elementLabel;
                                            if ($scope.selectedElement.defaultAggregation)
                                                $scope.originalElement.defaultAggregation = $scope.selectedElement.defaultAggregation;
                                            else
                                                $scope.originalElement.defaultAggregation = undefined;

                                            if ($scope.selectedElement.values)
                                                $scope.originalElement.values = $scope.selectedElement.values;
                                            if ($scope.selectedElement.format)
                                                $scope.originalElement.format = $scope.selectedElement.format;
                                            if ($scope.selectedElement.associatedElements)
                                                $scope.originalElement.associatedElements = $scope.selectedElement.associatedElements;
                  }

                  function  checkElementOk(element, done)
                  {
                      var isOk = true;
                      var message = '';

                      if (element.elementType == 'date')
                      {
                          if (element.extractFromString == true)
                          {
                              if (!element.yearPositionFrom ) //|| !angular.isNumber(element.yearPositionFrom))
                              {

                                  isOk = false;
                                  message = 'You have to setup a valid "FROM" position number to extract the year from the string';
                              }

                              if (angular.isNumber(element.yearPositionFrom))
                              {
                                  isOk = false;
                                  message = 'You have to setup a valid "FROM" position number to extract the year from the string';
                              }


                              if (!element.yearPositionTo || angular.isNumber(element.yearPositionTo))
                              {
                                  isOk = false;
                                  message = 'You have to setup a valid "TO" position number to extract the year from the string';
                              }

                              if (!element.monthPositionFrom || angular.isNumber(element.monthPositionFrom))
                              {
                                  isOk = false;
                                  message = 'You have to setup a valid "FROM" position number to extract the month from the string';
                              }

                              if (!element.monthPositionTo || angular.isNumber(element.monthPositionTo))
                              {
                                  isOk = false;
                                  message = 'You have to setup a valid "TO" position number to extract the month from the string';
                              }

                              if (!element.dayPositionFrom || angular.isNumber(element.dayPositionFrom))
                              {
                                  isOk = false;
                                  message = 'You have to setup a valid "FROM" position number to extract the day from the string';
                              }

                              if (!element.dayPositionTo || angular.isNumber(element.dayPositionTo))
                              {
                                  isOk = false;
                                  message = 'You have to setup a valid "TO" position number to extract the day from the string';
                              }


                          }
                      }

                      var theResult = {};
                      if (isOk == true)
                          theResult.result = 1;
                      else
                          theResult.result = 0;

                      theResult.message = message;

                      done(theResult);

                  }

              }
          }
          return $uibModal.open(tempModalDefaults).result;
          }
  }]);



  /*
  $scope.saveEditElement = function() {
      var element = $scope.selectedElement;

      checkElementOk(element, function (result) {

          if (result.result == 1) {
              for (var e in $scope._Layer.model.entities) {
                  if ($scope._Layer.model.entities[e].entityID == element.collectionID) {
                      for (var a in $scope._Layer.model.entities[e].attributes) {
                          if ($scope._Layer.model.entities[e].attributes[a].elementID == element.elementID) {
                              $scope._Layer.model.entities[e].attributes[a] = element;

                              $scope.layerSelectedElement.elementRole = element.elementRole;
                              $scope.layerSelectedElement.elementType = element.elementType;
                              $scope.layerSelectedElement.elementLabel = element.elementLabel;
                              if (element.defaultAggregation)
                                  $scope.layerSelectedElement.defaultAggregation = element.defaultAggregation;
                              else
                                  $scope.layerSelectedElement.defaultAggregation = undefined;

                              if (element.values)
                                  $scope.layerSelectedElement.values = element.values;
                              if (element.format)
                                  $scope.layerSelectedElement.format = element.format;
                              if (element.associatedElements)
                                  $scope.layerSelectedElement.associatedElements = element.associatedElements;
                              $scope.elementEditing = false;
                              $('#elementModal').modal('hide');
                          }
                      }
                  }
              }
          } else {
              $scope.elementEditingWarning = result.message;
          }
      });
  }


  function  checkElementOk(element, done)
      {
          var isOk = true;
          var message = '';

          if (element.elementType == 'date')
          {
              if (element.extractFromString == true)
              {
                  if (!element.yearPositionFrom ) //|| !angular.isNumber(element.yearPositionFrom))
                  {

                      isOk = false;
                      message = 'You have to setup a valid "FROM" position number to extract the year from the string';
                  }

                  if (angular.isNumber(element.yearPositionFrom))
                  {
                      isOk = false;
                      message = 'You have to setup a valid "FROM" position number to extract the year from the string';
                  }


                  if (!element.yearPositionTo || angular.isNumber(element.yearPositionTo))
                  {
                      isOk = false;
                      message = 'You have to setup a valid "TO" position number to extract the year from the string';
                  }

                  if (!element.monthPositionFrom || angular.isNumber(element.monthPositionFrom))
                  {
                      isOk = false;
                      message = 'You have to setup a valid "FROM" position number to extract the month from the string';
                  }

                  if (!element.monthPositionTo || angular.isNumber(element.monthPositionTo))
                  {
                      isOk = false;
                      message = 'You have to setup a valid "TO" position number to extract the month from the string';
                  }

                  if (!element.dayPositionFrom || angular.isNumber(element.dayPositionFrom))
                  {
                      isOk = false;
                      message = 'You have to setup a valid "FROM" position number to extract the day from the string';
                  }

                  if (!element.dayPositionTo || angular.isNumber(element.dayPositionTo))
                  {
                      isOk = false;
                      message = 'You have to setup a valid "TO" position number to extract the day from the string';
                  }


              }
          }

          var theResult = {};
          if (isOk == true)
              theResult.result = 1;
          else
              theResult.result = 0;

          theResult.message = message;

          done(theResult);

      }

  */
