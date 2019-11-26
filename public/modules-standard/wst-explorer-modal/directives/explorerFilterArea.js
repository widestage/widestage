'use strict';

app.directive('wstExplorerFilterArea', function($compile, $rootScope,queryModel,wstExplorerFilterPromptModal) {
    return {
        transclude: true,
        scope: {
              query: '='
        },

        templateUrl: 'wst-explorer-modal/directives/views/explorerFilterArea.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {
          $scope.query = $scope.query;

          $scope.onDropFilter = function (data, event, type, group) {

              var customObjectData = data['json/custom-object'];
              onDrop($scope,data,event,type,group, function(){

              });


          }


          $scope.removeFilter = function(filter)
          {
              //$rootScope.removeFromArray($scope.selectedReport.properties.filters, filter);
              //queryModel.removeQueryItem(filter,'filter');
              $rootScope.removeFromArray($scope.query.groupFilters, filter);
              reorderFilters($scope.query);
              $rootScope.$emit('queryDefinitionChanged', {});
          }

          $scope.filterPromptsClick = function (filter) {
              $scope.selectedFilter = filter;
              if (!$scope.selectedFilter.promptTitle || $scope.selectedFilter.promptTitle == '')
                  $scope.selectedFilter.promptTitle = $scope.selectedFilter.objectLabel;

              wstExplorerFilterPromptModal.showModal({size:'md',backdrop:true}, {filter:$scope.selectedFilter,readonly:false}).then(function (theSelectedReports) {

              });
          };

          // Drop handler.
          function onDrop($scope, data, event, type, group, done) {
              var query = $scope.query;
              event.stopPropagation();
              /*if (lastDrop && lastDrop == 'onFilter') {
                  lastDrop = null;
                  return;
              }*/

              // Get custom object data.
              var customObjectData = data['json/custom-object']; // {foo: 'bar'}

              // Get other attached data.
              var uriList = data['text/uri-list']; // http://mywebsite.com/..


              if (type == 'column') {
                  if (!query.columns)
                       query.columns = [];
                  query.columns.push(customObjectData);

                  }

              if (type == 'order') {
                  customObjectData.sortType = -1;
                  query.order.push(customObjectData);
              }
              if (type == 'filter') {

                  var el = document.getElementById('filter-zone');
                  if (!query.groupFilters)
                       query.groupFilters = [];

                  if (query.groupFilters.length > 0)
                  {
                     customObjectData.condition = 'AND';
                     customObjectData.conditionLabel = 'AND';
                  }
                  query.groupFilters.push(customObjectData);


              }
              if (type == 'group') {

                  query.groupFilters.push(customObjectData);

              }


          };

          $scope.filterChanged = function()
          {
            $rootScope.$emit('queryDefinitionChanged', {});
          }


          function reorderFilters(query)
          {
              for (var i in query.groupFilters)
                      {
                          if (i == 0)
                              {
                                 delete(query.groupFilters[0].condition);
                                 delete(query.groupFilters[0].conditionLabel);
                              }
                          if (i != 0 && query.groupFilters[i].condition == undefined)
                              {
                                  query.groupFilters[i].condition = 'AND';
                                  query.groupFilters[i].conditionLabel = 'AND';
                              }
                      }



          }

        }
  }

});
