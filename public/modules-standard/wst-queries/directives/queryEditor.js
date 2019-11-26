'use strict';

app.directive('wstQueryEditor', function($compile, $rootScope,connectionModel) {
    return {
        transclude: true,
        scope: {
            model: '=',
            properties: '=',
            onChange: '=',
            onSelect: '=',
            onElementAdd: '=',
            layer: '='
        },

        templateUrl: 'wst-queries/directives/views/queryEditor.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          $scope.runQuery = function()
          {
              var cursorStart = $('#sqlTextArea').prop('selectionStart');

              var cursorEnd = $('#sqlTextArea').prop('selectionEnd');

              var query = $scope.sqlText;

              if (cursorEnd > cursorStart)
              {
                  query = query.substring(cursorStart, cursorEnd);
              }

              if (query != undefined && query != '') {
                  var connectionID = $scope.selectedConnection;
                  datasourceModel.runQuery(connectionID, query, function (data) {
                      if (data.result == 1 && data.items) {
                          $scope.messagePanelVisible = false;
                          $scope.noRecordsPanelVisible = false;
                          refreshGrid(data.items);
                      } else {
                          $scope.messagePanelVisible = true;
                          $scope.errorMessage = data.msg;

                      }
                  });
              }
          }



          function refreshGrid(newData)
          {
              if (newData[0] == undefined ||  newData[0] == null)
              {
                  $scope.noRecordsPanelVisible = true;
              } else {
                  $scope.queryResult = newData;

                  var dataColumns = Object.keys(newData[0]);
                  var columnsDefinition = [];
                  for (var c in dataColumns) {
                      columnsDefinition.push({name: dataColumns[c], width: 200});
                  }
                  $scope.gridOpts.columnDefs = columnsDefinition;
                  $scope.gridOpts.data = $scope.queryResult;
              }
          }

          $scope.getTop100rows = function(entity)
          {
              $scope.gridOpts.columnDefs = [];
              $scope.gridOpts.data = undefined;
              var connectionID = $scope.selectedConnection;

              if ($scope.selectedConnectionType === 'MONGODB')
              {
                  var table_name = entity.table_name;
              } else {

                  if (entity.table_schema)
                      var table_name = entity.table_schema + '.' + entity.table_name;
                  else
                      var table_name = entity.table_name;
              }

              datasourceModel.getTop100(connectionID, table_name, function (data) {
                  if (data.result == 1  && data.items) {
                      $scope.messagePanelVisible = false;
                      $scope.noRecordsPanelVisible = false;
                      refreshGrid(data.items);
                  } else {
                      $scope.messagePanelVisible = true;
                      $scope.errorMessage = data.msg;
                  }
              });

          }

        }
      }
  });
