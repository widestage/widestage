'use strict';

app.directive('ndPrompt', function($compile,queryModel) {
return {
    transclude: true,
    scope: {
        elementId: '@',
        label: '@',
        prompts: '=',
        valueField: '@',
        showField: '@',
        onChange: '=',
        ngModel: '=',
        description: '@',
        selectedValue: '@',
        filter: '=',
        afterGetValues: '=',
        isPrompt: '@'
    },

   templateUrl: "widgets/views/promptsDirective.html",

    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {
        switch (attrs['type']) {
            case "text":
                // append input field to "template"
            case "select":
                // append select dropdown to "template"
        }

      $scope.queryModel = queryModel;

      $scope.datePickOptions = {
          //dateDisabled: disabled,
          formatYear: 'yyyy',
          showWeeks: false,
          //maxDate: new Date(2020, 5, 22),
          //minDate: new Date(),
          startingDay: 1
        };

    $scope.dateFilterChanged = function(filter)
    {
      checkForOnChange(filter);
    }

    $scope.altInputFormats = ['M!/d!/yyyy'];


      $scope.setDatePatternFilterType = function(filter,option)
        {
          queryModel.setDatePatternFilterType(filter,option);
            var values = {};
            values.filterText1 = filter.filterText1;
            values.searchValue = filter.searchValue;
            values.filterValue = filter.filterValue;
            values.dateCustomFilterLabel = filter.dateCustomFilterLabel;
            values.filterText2 = filter.filterText2;

            $scope.onChange($scope.elementId,values);
        }



      $scope.getPrompt = function(elementID)
        {
        for (var p in $scope.prompts)
            {
            if ($scope.prompts[p].elementID == elementID)
                return $scope.prompts[p];

            }

        }

      $scope.clearFilter = function(filter)
      {

        filter.filterText1 = undefined;
        filter.searchValue = undefined;
        filter.filterValue = undefined;
        filter.dateCustomFilterLabel = undefined;
        filter.filterText2 = undefined;
        filter.filterLabel1 = undefined;
        filter.filterLabel2 = undefined;

        var values = {};
        values.filterText1 = filter.filterText1;
        values.searchValue = filter.searchValue;
        values.filterValue = filter.filterValue;
        values.dateCustomFilterLabel = filter.dateCustomFilterLabel;
        values.filterText2 = filter.filterText2;
        if ($scope.onChange)
            $scope.onChange($scope.filter.elementID,values);
      }

      $scope.getPromptAsArray = function(elementID)
        {
            for (var p in $scope.prompts)
                {
                    if ($scope.prompts[p].elementID == elementID)
                        {
                            var theResult = [];
                            theResult.push($scope.prompts[p]);
                            return theResult;
                        }
                }
        }

      $scope.promptChanged = function(elementId) {

        if ($scope.onChange)
            $scope.onChange($scope.filter.elementID,values);

        };

      $scope.onDateSet = function (newDate, oldDate, filter) {

          if (angular.isDate(newDate))
            {
                var year = newDate.getFullYear();
                var month = pad(newDate.getMonth()+1,2);
                var day = pad(newDate.getDate(),2);
                var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
                if (filter.filterType == 'in' || filter.filterType == 'notIn')
                {
                    if (!filter.filterText1)
                        filter.filterText1 = [];
                    filter.filterText1.push(theDate);
                } else
                    filter.filterText1 = theDate;

                filter.searchValue = theDate;
                filter.filterValue = theDate;
                filter.dateCustomFilterLabel = undefined;
            }



        checkForOnChange(filter);
    }

      $scope.onDateEndSet = function (newDate, oldDate, filter) {
        if (angular.isDate(newDate))
            {
                var year = newDate.getFullYear();
                var month = pad(newDate.getMonth()+1,2);
                var day = pad(newDate.getDate(),2);
                var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
                filter.filterText2 = theDate;
                filter.dateCustomFilterLabel = undefined;
            }
        checkForOnChange(filter);
    }
/*
    $scope.funcAsync = function(filter, search)
    {
        if (filter.filterType === 'not in' || filter.filterType === 'in')
           queryModel.getDistinctFiltered(filter,search, function(theData,sql){
               var elementID = 'wst'+filter.elementID.toLowerCase();
               filter.valueElementID = elementID.replace(/[^a-zA-Z ]/g,'');
               $scope.selectedFilter = filter;
               if ($scope.afterGetValues)
                   $scope.afterGetValues(filter,theData);
            });
    }
*/

$scope.select2Properties = {
                            ajax: {
                                url: 'https://api.github.com/orgs/select2/repos',
                                data: function (params) {
                                  var query = {
                                    search: params.term,
                                    type: 'public'
                                  }

                                  // Query parameters will be ?search=[term]&type=public
                                  return query;
                                }
                              }
                            }

    var isGettingTheDistinctData = false;

    $scope.getDistinctData = function(filter)
    {
      if ((!$scope.distinctData || $scope.distinctData.length == 0) && !isGettingTheDistinctData)
          {
              isGettingTheDistinctData = true;
              getDistinctValuesV2(filter,function(){
                    return $scope.distinctData;
              });
          } else {
            return $scope.distinctData;
          }

    }


    $scope.getDistinctValues = function(filter)
    {
        getDistinctValuesV2(filter, function(){

        });
    };

    function getDistinctValuesV2(filter,done)
    {
        $scope.showList = true;
        $scope.selectedFilter = filter;
        if (!$scope.distinctData || $scope.distinctData.length == 0)
            {
                var search = '';
                queryModel.getDistinct(filter, function(theData,sql,page,pages){
                      var elementID = 'wst'+filter.elementID.toLowerCase();
                        filter.valueElementID = elementID.replace(/[^a-zA-Z ]/g,'');
                        $scope.distinctData = [];
                        for (var i in theData)
                        {
                            $scope.distinctData.push({id:theData[i][filter.valueElementID],text:theData[i][filter.valueElementID]})
                        }
                    if ($scope.afterGetValues)
                        $scope.afterGetValues(filter,theData);

                        done();
                });
            }
    };

    $scope.selectSearchValue = function(selectedValue)
    {
        $scope.filter.searchValue = selectedValue;
        var searchValue = '';
        if ($scope.filter.filterType == 'in' || $scope.filter.filterType == 'notIn') {
            for (var i in $scope.filter.searchValue) {
                searchValue += $scope.filter.searchValue[i][$scope.filter.id];
                if (i < $scope.filter.searchValue.length-1) {
                    searchValue += ';';
                }
            }
        }
        else {
            searchValue = $scope.filter.searchValue;
        }

        $scope.filter.filterText1 = searchValue;
        $scope.filter.filterValue = searchValue;
        $scope.showList = false;

        var values = {};
        values.filterText1 = $scope.filter.filterText1;
        values.searchValue = $scope.filter.searchValue;
        values.filterValue = $scope.filter.filterValue;
        values.dateCustomFilterLabel = $scope.filter.dateCustomFilterLabel;

        if ($scope.onChange)
            $scope.onChange($scope.filter.elementID,values);

    }

    $scope.inputChanged = function(filter)
    {

    filter.searchValue = filter.filterText1;
    filter.filterValue = filter.filterText1;

        checkForOnChange(filter);
    }

    $scope.updateCondition = function(filter, condition) {
        filter.conditionType = condition.conditionType;
        filter.conditionLabel = condition.conditionLabel;
            //queryModel.updateCondition(filter, condition);
    };

    $scope.conditionTypes = queryModel.conditionTypes;

    $scope.getElementFilterOptions = function(elementType)
    {
        return queryModel.getElementFilterOptions(elementType);
    }

    $scope.setFilterType = function(filter, filterOption)
    {
        queryModel.setFilterType(filter, filterOption);
        if (filter.filterType == 'null' || filter.filterType == 'notNull')
            {
                  var values = {};
              values.filterText1 = filter.filterText1;
              values.searchValue = filter.searchValue;
              values.filterValue = filter.filterValue;
              values.dateCustomFilterLabel = filter.dateCustomFilterLabel;


              if ($scope.onChange)
                  $scope.onChange($scope.filter.elementID,values);

            }
    }


    function pad(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        while (s.length < size) s = "0" + s;
        return s;
    }

    function checkForOnChange(filter)
        {
            var values = {};
            values.filterText1 = filter.filterText1;
            values.searchValue = filter.searchValue;
            values.filterValue = filter.filterValue;
            values.dateCustomFilterLabel = filter.dateCustomFilterLabel;
            values.filterText2 = filter.filterText2;
          if ((filter.filterType == 'between' || filter.filterType == 'not between') && (filter.filterText2 != undefined && filter.filterText2 != '') )
              {
                if ($scope.onChange)
                    $scope.onChange($scope.filter.elementID,values);
              }
         if (filter.filterType != 'between' && filter.filterType != 'not between')
              {
                if ($scope.onChange)
                    $scope.onChange($scope.filter.elementID,values);
              }
        }

    }
  }



});
