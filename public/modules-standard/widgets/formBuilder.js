app.directive('formBuilder', function($compile, $rootScope,$ocLazyLoad,$i18next) {
    return {
        transclude: true,
        scope: {
            object: '=',
            definition: '='
        },

        template: '<div class="container-fluid"> </div>',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {



          $scope.$watch('definition', function() {
              if ($scope.definition)
              {
                  generateForm($scope.definition);
              }

          });

          $scope.valueList = [{ID:'1111',name:'HDFS'},{ID:'2222',name:'YARN'}]


          function generateForm(definition)
          {
              if (definition.tabs.length > 0)
                {
                  //generate all Tabs (sections)
                } else {
                  //There are no tabs
                  var $noTab = angular.element('<div class="col-md-12"></div>');
                  generateFieldsForThisTab(definition,$noTab,0);
                  var compiled = $compile($noTab)($scope)
                  element.append(compiled);
                  //$scope.$apply()
                }



          }

          function generateFieldsForThisTab(definition, tab,tabNumber)
          {
              for (var f in definition.fields)
              {
                  var theField = definition.fields[f];
                  if (theField.visible)
                  {
                      if (theField.column == 0)
                      {
                         var $row = angular.element('<div class="col-md-12"></div>');
                         $row.append(getFieldControl(theField));
                      } else {
                         var $row = angular.element('<div class="col-md-6"></div>');
                         $row.append(getFieldControl(theField));
                      }

                      tab.append($row);
                  }
              }



          }


          function getFieldControl(field)
          {
              var $formGroup = angular.element('<div class="form-group"></div>');
              var $formLabel = angular.element('<label for="'+field.name+'" class="control-label properties" ng-i18next="'+field.label+'"></label>');
              $formGroup.append($formLabel);

              $scope['values_'+field.name] = field.valueList;

              var required = '';
              if (field.required)
              required = ' required ';

              var defaultValue = '';
              if (field.defaultValue)
              defaultValue = ' value="'+field.defaultValue+'" ';


              //NUMBER
              if (field.control === 'inputNumber')
              {
                var min = '';
                if (field.minValue)
                min = ' min="'+field.minValue+'"';

                var max = '';
                if (field.maxValue)
                max = ' max="'+field.maxValue+'"';
                    var $inputElement = angular.element('<input type="number" id="'+field.name+'" name="'+field.name+'" class="form-control" ng-model="object.'+field.name+'" '+min+max+required+defaultValue+'>');
                    $formGroup.append($inputElement);
              }

              //STRING
              if (field.control === 'inputText')
              {

                    var $inputElement = angular.element('<input type="text" id="'+field.name+'" name="'+field.name+'" class="form-control" ng-model="object.'+field.name+'" '+required+defaultValue+'>');
                    $formGroup.append($inputElement);
              }

              //SELECT
              if (field.control === 'select')
              {
                    var html = '<select id="'+field.name+'" ng-model="object.'+field.name+'" style="width: 100%;">'
                               +'<option value="">---Please select---</option>'
                               +'<option value="obj.id" ng-repeat="obj in '+'values_'+field.name+'">{{obj.name}}</option>'
                               +'</select>'
                    var $inputElement = angular.element(html);
                    $formGroup.append($inputElement);
              }

              //MULTISELECT
              if (field.control === 'multiselect')
              {
                    var $inputElement = angular.element('<select2 multiple id="'+field.name+'" ng-model="object.'+field.name+'" s2-options="obj.ID as obj.name for obj in '+'values_'+field.name+'" options="{ allowClear: true }"></select2>');
                    $formGroup.append($inputElement);
              }

              return $formGroup;

          }


        }

      }
  });
