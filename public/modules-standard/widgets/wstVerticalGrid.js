app.directive('wstVerticalGrid', function($compile, $rootScope,$i18next,queryModel,dataElements) {
    return {
        transclude: true,
        scope: {
            report: '=',
            mode: '='
        },

        template: '<div class="container-fluid no-padding"></div>',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {

          var colClass = '';
          var colWidth = '';
          var hashedID = '';
          var columns = [];
          var report = {};

          function quotedHashedID()
          {
              return "'"+hashedID+"'";
          }

          $scope.$watch('report', function() {
            if ($scope.report)
              {
                  init();
              }
          });

          function init()
          {
            var report = $scope.report;
            if(!report.properties)
                report.properties = {};
            if(!report.properties.verticalGrid)
                report.properties.verticalGrid = {};



            if (!report.properties.verticalGrid.background_color) report.properties.verticalGrid.background_color = "#FFFFFF";
            if (!report.properties.verticalGrid.height) report.properties.verticalGrid.height = 400;
            if (!report.properties.verticalGrid.header_height) report.properties.verticalGrid.header_height = 30;
            if (!report.properties.verticalGrid.header_font_size) report.properties.verticalGrid.header_font_size = 12;
            if (!report.properties.verticalGrid.header_font_color) report.properties.verticalGrid.header_font_color = "#000";
            if (!report.properties.verticalGrid.header_background_color) report.properties.verticalGrid.header_background_color = "#FFFFFF";
            if (!report.properties.verticalGrid.header_bottom_line_height) report.properties.verticalGrid.header_bottom_line_height = 4;
            if (!report.properties.verticalGrid.header_bottom_line_color) report.properties.verticalGrid.header_bottom_line_color = "#999999";

            if (!report.properties.verticalGrid.row_height) report.properties.verticalGrid.row_height = 20;
            if (!report.properties.verticalGrid.row_font_size) report.properties.verticalGrid.row_font_size = 12;
            if (!report.properties.verticalGrid.row_font_color) report.properties.verticalGrid.row_font_color = "#000";
            if (!report.properties.verticalGrid.row_background_color) report.properties.verticalGrid.row_background_color = "#fff";


            if (!report.properties.verticalGrid.row_bottom_line_color) report.properties.verticalGrid.row_bottom_line_color = "#CCCCCC";
            if (!report.properties.verticalGrid.row_bottom_line_height) report.properties.verticalGrid.row_bottom_line_height = 1;
            if (!report.properties.verticalGrid.row_column_line_width) report.properties.verticalGrid.row_column_line_width = 0;

            report.properties.verticalGrid.refresh = function()
                {
                  if (report.query)
                  {
                              var htmlCode = getVerticalGrid();
                              var el = element;
                              element.empty();
                              if (el)
                              {
                                  angular.element(el).empty();
                                  var $div = $(htmlCode);
                                  angular.element(el).append($div);
                                  angular.element(document).injector().invoke(function($compile) {
                                      var scope = angular.element($div).scope();
                                      $compile($div)($scope);
                                      //hideOverlay(report.parentDiv);
                                  });

                              }
                  }

              }

              report.properties.verticalGrid.refresh();
          }


          function getVerticalGrid()
              {
                var report = $scope.report;
                var mode = $scope.mode;

                      if (report.id == undefined)
                          var id = report._id;
                          else
                          var id = report.id;

                      hashedID = report.query.id;
                      var theProperties = report.properties.verticalGrid;
                      var pageBlock = "page-block";

                      if (mode == 'preview')
                          {
                             pageBlock = "";
                          }


                      var reportStyle = 'width:100%;padding-left:0px;padding-right:0px;';
                      var headerStyle = 'width:100%;padding-left:0px;background-color:#ccc;';
                      var rowStyle = 'width:100%;padding:0px';
                      var columnDefaultStyle = 'height:40px;overflow:hidden;padding:2px; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;';




                      if (theProperties)
                          {
                              reportStyle += 'background-color:'+theProperties.background_color+';';
                              //reportStyle += 'height:'+theProperties.height+'px;';
                              rowStyle += 'background-color:'+theProperties.background_color+';';

                              var theRepeatHeight = theProperties.height - theProperties.header_height;
                              repeatHeight = 'height:'+theRepeatHeight+'px;';

                              columnDefaultStyle += 'height:'+theProperties.row_height+'px;';
                              var paddingTop = (theProperties.row_height - 14) /2;
                              columnDefaultStyle += 'padding-top:'+paddingTop+'px;';

                              headerStyle += 'background-color:'+theProperties.header_background_color+';';
                              headerStyle += 'height:'+theProperties.header_height+'px;';
                              headerStyle += 'border-bottom: '+theProperties.header_bottom_line_height+'px solid '+theProperties.header_bottom_line_color+';';

                              columnDefaultStyle += 'border-bottom: '+theProperties.row_bottom_line_height+'px solid '+theProperties.row_bottom_line_color+';';
                              columnDefaultStyle += 'border-right: '+theProperties.row_column_line_width+'px solid '+theProperties.row_bottom_line_color+';';
                          }


                      var htmlCode = '<div '+pageBlock+' id="REPORT_'+id+'" ndType="extendedGrid" class="container-fluid report-container no-padding" style="'+reportStyle+'">';

                      columns = report.properties.columns;


                      htmlCode += '<div vs-repeat style="width:100%;overflow-y: auto;border: 1px solid #ccc;align-items: stretch;position: absolute;bottom: 0px;top: 0px;" scrolly="gridGetMoreData(\''+id+'\')">';

                      htmlCode += '<div ndType="repeaterGridItems" class="repeater-data container-fluid no-padding" ng-repeat="item in getQuery(\''+hashedID+'\').data | filter:theFilter | orderBy:getReport(\''+hashedID+'\').predicate:getReport(\''+hashedID+'\').reverse  " style="'+rowStyle+'"  >';

                      htmlCode += getRowData(columns,theProperties);

                      htmlCode += '</div>';

                      htmlCode += '<div ng-if="getQuery(\''+hashedID+'\').data.length == 0" >No data found</div>';

                      htmlCode += '</div>';


              htmlCode += '</div>';
                      return htmlCode;

              }


              $scope.getQuery = function(queryID)
                  {
                      return $scope.report.query;
                  }


          function getRowData(columns,theProperties)
              {
                  var htmlCode = '';

                  var rowHeaderStyle = 'line-height:'+theProperties.row_height+'px;height:'+theProperties.row_height+'px;font-size:'+theProperties.header_font_size+'px;color:'+theProperties.header_font_color+';background-color:'+theProperties.header_background_color+';'
                  var rowDataStyle = 'line-height:'+theProperties.row_height+'px;height:'+theProperties.row_height+'px;font-size:'+theProperties.row_font_size+'px;color:'+theProperties.row_font_color+';background-color:'+theProperties.row_background_color+';'
                  var rowField = 'height:'+(theProperties.row_height)+'px;'
                  var rowRecord = 'border-bottom:'+theProperties.row_bottom_line_height+'px solid '+theProperties.row_bottom_line_color+';'

                  htmlCode += '<div class="col-md-12 vertical-grid-record-container" style="'+rowRecord+'">';

                  for(var i = 0; i < columns.length; i++)
                      {

                          var column = columns[i];
                          
                              if (!column.hidden)
                              {
                                  htmlCode += '<div class="col-md-12 vertical-grid-column-container" style="'+rowField+'">';

                                      htmlCode += '<div class="col-md-3 vertical-grid-label-column" style="'+rowHeaderStyle+'">';
                                          htmlCode += dataElements.getElementLabel(columns[i]);
                                      htmlCode += '</div>';

                                      var columnStyle = '';
                                      if (column.columnStyle)
                                      {
                                        if (column.columnStyle.fontColor)
                                          columnStyle = columnStyle +'color:'+column.columnStyle.fontColor+';';
                                        if (column.columnStyle.backgroundColor)
                                          columnStyle = columnStyle +'background-color:'+column.columnStyle.backgroundColor+';';
                                        if (column.columnStyle.fontSize)
                                          columnStyle = columnStyle +'font-size:'+column.columnStyle.fontSize+'px;';
                                        if (column.columnStyle.fontStyle)
                                          columnStyle = columnStyle +'font-style:'+column.columnStyle.fontStyle+';';
                                        if (column.columnStyle.fontWeight)
                                          columnStyle = columnStyle +'font-weight:'+column.columnStyle.fontWeight+';';
                                        if (column.columnStyle.align)
                                          columnStyle = columnStyle +'text-align:'+column.columnStyle.align+';';
                                      }

                                      htmlCode += '<div class="col-md-9 vertical-grid-column-value" style="'+rowDataStyle+columnStyle+'">';
                                          htmlCode += dataElements.getElementValue(columns[i],'vertical-grid-data-column',$scope.report.query.id);
                                      htmlCode += '</div>';

                                  htmlCode += '</div>';
                            }
                      }

                  htmlCode += '</div>';

                  return htmlCode;
              }


        }

      }
});
