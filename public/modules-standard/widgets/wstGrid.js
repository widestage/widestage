app.directive('wstGrid', function($compile, $rootScope,$i18next,queryModel,dataToExcel) {
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

          $scope.orderColumn = function(columnIndex,desc,hashedID) {
                  orderColumn(columnIndex,desc,hashedID);
          };

          $scope.saveToExcel = function()
          {
            queryModel.getQueryAsAFile($scope.report.query,$scope.report.reportName,function(result){

            });
          }

          function orderColumn(columnIndex, desc,hashedID) {
              //Used when ordering by column in grid
              var theColumn = $scope.report.query.columns[columnIndex];
              if (desc == true)
                  theColumn.sortType = 1;
              else
                  theColumn.sortType = -1;
              $scope.report.query.order = [];
              $scope.report.query.order.push(theColumn);
              queryModel.getQueryData2($scope.report.query, function(data,sql,query){

                      $scope.report.query.data = data;

              });
          };

          function init()
          {
            var report = $scope.report;
            if(!report.properties)
                report.properties = {};
            if(!report.properties.grid)
                report.properties.grid = {};

            if (!report.properties.grid.background_color) report.properties.grid.background_color = "#FFFFFF";
            if (!report.properties.grid.height) report.properties.grid.height = 400;
            if (!report.properties.grid.header_height) report.properties.grid.header_height = 30;
            if (!report.properties.grid.header_font_size) report.properties.grid.header_font_size = 12;
            if (!report.properties.grid.header_font_color) report.properties.grid.header_font_color = "#000";
            if (!report.properties.grid.header_background_color) report.properties.grid.header_background_color = "#FFFFFF";
            if (!report.properties.grid.header_bottom_line_height) report.properties.grid.header_bottom_line_height = 4;
            if (!report.properties.grid.header_bottom_line_color) report.properties.grid.header_bottom_line_color = "#999999";

            if (!report.properties.grid.row_height) report.properties.grid.row_height = 20;
            if (!report.properties.grid.row_font_size) report.properties.grid.row_font_size = 12;
            if (!report.properties.grid.row_font_color) report.properties.grid.row_font_color = "#000";


            if (!report.properties.grid.row_bottom_line_color) report.properties.grid.row_bottom_line_color = "#CCCCCC";
            if (!report.properties.grid.row_bottom_line_height) report.properties.grid.row_bottom_line_height = 1;
            if (!report.properties.grid.row_column_line_width) report.properties.grid.row_column_line_width = 0;

            report.properties.grid.refresh = function()
                {
                  if (report.query)
                  {
                              var htmlCode = getHTML();
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

              report.properties.grid.refresh();
          }


          function getHTML()
              {
                      var report = $scope.report;
                      var mode = $scope.mode;

                      if (report.id == undefined)
                          var id = report._id;
                          else
                          var id = report.id;

                      hashedID = report.query.id;
                      var theProperties = report.properties.grid;
                      var pageBlock = "page-block";


                      if (mode == 'preview')
                          {
                             pageBlock = "";
                          }


                      var reportStyle = 'width:100%;padding-left:0px;padding-right:0px;';
                      var headerStyle = 'width:100%;padding-left:0px;background-color:#ccc;position:absolute;top:0px;';
                      var rowStyle = 'width:100%;padding:0px';
                      var columnDefaultStyle = 'height:40px;overflow:hidden;padding-left:2px; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;';
                      var backgroudStyle = 'background-color:transparent;';
                      if (!theProperties.background_color) theProperties.background_color = "#FFFFFF";
                      if (!theProperties.header_height) theProperties.header_height = 30;
                      if (!theProperties.header_font_size) theProperties.header_font_size = 12;
                      if (!theProperties.header_font_color) theProperties.header_font_color = "#000";
                      if (!theProperties.header_background_color) theProperties.header_background_color = "#FFFFFF";
                      if (!theProperties.header_bottom_line_height) theProperties.header_bottom_line_height = 4;
                      if (!theProperties.header_bottom_line_color) theProperties.header_bottom_line_color = "#999999";

                      if (!theProperties.row_height) theProperties.row_height = 20;
                      if (!theProperties.row_font_size) theProperties.row_font_size = 12;
                      if (!theProperties.row_font_color) theProperties.row_font_color = "#000";


                      if (!theProperties.row_bottom_line_color) theProperties.row_bottom_line_color = "#CCCCCC";
                      if (!theProperties.row_bottom_line_height) theProperties.row_bottom_line_height = 1;
                      if (!theProperties.row_column_line_width) theProperties.row_column_line_width = 0;

                      if (!theProperties.gridTop) theProperties.gridTop = 0;
                      if (!theProperties.height) theProperties.height = 400;


                      //margins
                      //paddings

                      if (theProperties)
                          {
                              backgroudStyle += 'background-color:'+theProperties.background_color+';';
                              //reportStyle += 'height:'+theProperties.height+'px;';

                              var theRepeatHeight = theProperties.height - theProperties.header_height;
                              repeatHeight = 'height:'+theRepeatHeight+'px;';

                              columnDefaultStyle += 'height:'+theProperties.row_height+'px;';
                              columnDefaultStyle += 'line-height:'+theProperties.row_height+'px;';
                              //var paddingTop = (theProperties.row_height - theProperties.row_font_size) /2;
                              //columnDefaultStyle += 'padding-top:'+paddingTop+'px;';

                              headerStyle += 'background-color:'+theProperties.header_background_color+';';
                              headerStyle += 'height:'+theProperties.header_height+'px;';
                              headerStyle += 'line-height:'+theProperties.header_height+'px;';
                              headerStyle += 'border-bottom: '+theProperties.header_bottom_line_height+'px solid '+theProperties.header_bottom_line_color+';';
                              headerStyle += 'top:'+theProperties.gridTop+'px;';
                              headerStyle += 'font-size:'+theProperties.header_font_size+'px;';
                              headerStyle += 'color:'+theProperties.header_font_color+';';

                              columnDefaultStyle += 'border-bottom: '+theProperties.row_bottom_line_height+'px solid '+theProperties.row_bottom_line_color+';';
                              columnDefaultStyle += 'border-right: '+theProperties.row_column_line_width+'px solid '+theProperties.row_bottom_line_color+';';
                              columnDefaultStyle += 'font-size:'+theProperties.row_font_size+'px;';
                              columnDefaultStyle += 'color:'+theProperties.row_font_color+';';
                          }


                      //var htmlCode = '<div '+pageBlock+' id="REPORT_'+id+'" ndType="extendedGrid" class="container-fluid report-container" style="'+reportStyle+'">';
                      var htmlCode = '<div id="REPORT_'+id+'" ndType="extendedGrid" class="container-fluid report-container no-padding" style="'+reportStyle+'">';

                      columns = report.properties.columns;

                      var visibleColumns = 0;
                      for (var c in columns)
                      {
                          if (!columns[c].hidden)
                              visibleColumns++;
                      }

                      if (visibleColumns > 4)
                          colWidth = 'width:'+100/visibleColumns+'%;float:left;';
                      else
                          colClass = 'col-xs-'+12/visibleColumns;

                      //header
                      htmlCode += '<div page-block ndType="gridHeader" class="container-fluid no-padding" style="'+headerStyle+'">';
                      for(var i = 0; i < columns.length; i++)
                      {
                          if (!columns[i].hidden)
                              htmlCode += getHeaderColumn(columns[i],i);
                      }
                      htmlCode += '</div>';

                      //var bottom = getCalculusRows()*theProperties.summary_row_height;
                      //TODO:summary_row_height
                      var bottom = getCalculusRows()*20;

                      htmlCode += '<div vs-repeat style="width:100%;overflow-y: scroll;border: 1px solid #ccc;align-items: stretch;position: absolute;bottom: '+bottom+'px;top: '+(theProperties.header_height+theProperties.gridTop)+'px;'+backgroudStyle+'" scrolly="gridGetMoreData(\''+id+'\')">';

                      htmlCode += '<div ndType="repeaterGridItems" class="repeater-data container-fluid" ng-repeat="item in (getQuery(\''+hashedID+'\').data) ? getQuery(\''+hashedID+'\').data : getQuery(\''+hashedID+'\').data | filter:theFilter | orderBy:getReport(\''+hashedID+'\').predicate:getReport(\''+hashedID+'\').reverse  " style="'+rowStyle+'"  >';

                      for(var i = 0; i < columns.length; i++)
                      {
                          if (!columns[i].hidden)
                              htmlCode += getDataCell(columns[i],id,i,columnDefaultStyle);

                      }

                      htmlCode += '</div>';

                      htmlCode += '<div ng-if="getQuery(\''+hashedID+'\').data.length == 0 || getQuery(\''+hashedID+'\').data.length == 0" >No data found</div>';

                      htmlCode += '</div>';

                      htmlCode += '<div class="repeater-data" style="bottom: 0px;position: absolute;left: 0px;right: 0px;">';
                              for(var i in columns)
                              {
                                  //var elementName = columns[i].collectionID.toLowerCase()+'_'+columns[i].elementName;
                                  var elementID = 'wst'+columns[i].elementID.toLowerCase();
                                  var elementName = elementID.replace(/[^a-zA-Z ]/g,'');
                                  //var elementName = 'wst'+columns[i].elementID.toLowerCase();
                                  if (columns[i].aggregation)
                                      //elementName = columns[i].collectionID.toLowerCase()+'_'+columns[i].elementName+columns[i].aggregation;
                                      elementName = elementName+columns[i].aggregation;
                                  htmlCode += '<div class=" calculus-data-column '+colClass+' " style="text-align:right;font-weight:bolder;'+colWidth+'"> '+calculateForColumn(report,i,elementName)+' </div>';
                              }
                      htmlCode += '</div> </div>';
                      return htmlCode;

              }

              $scope.getQuery = function(queryID)
              {
                  return $scope.report.query;
              }

              function getCalculusRows()
              {
                var rows = 0;
                for (var c in columns)
                    {
                      var thisColRows = 0;
                      if (columns[c].operationSum)
                          thisColRows = thisColRows+1;
                      if (columns[c].operationAvg)
                          thisColRows = thisColRows+1;
                      if (columns[c].operationCount)
                          thisColRows = thisColRows+1;
                      if (columns[c].operationMin)
                          thisColRows = thisColRows+1;
                      if (columns[c].operationMax)
                          thisColRows = thisColRows+1;

                      if (thisColRows > rows)
                          rows = thisColRows

                    }

                return rows;
              }



              function getHeaderColumn(column,columnIndex)
              {

                     var htmlCode = '';
                     //var elementName = "'"+column.id+"'";
                     var elementID = 'wst' + column.elementID.toLowerCase();
                     var elementName = elementID.replace(/[^a-zA-Z ]/g, '');
                     if (column.aggregation)
                     //elementName = "'"+column.collectionID.toLowerCase()+'_'+column.elementName+column.aggregation+"'";
                         elementName = "'" + elementName + column.aggregation + "'";
                     var elementNameAux = elementName;
                     if (column.elementType === 'DATE')
                         elementNameAux = "'" + 'wst' + column.elementID + '_original' + "'";

                      var defaultAligment = '';
                      if (column.elementType === 'DECIMAL' || column.elementType === 'INTEGER' || column.elementType === 'FLOAT' )
                          defaultAligment = 'text-align: right;'

                      htmlCode += '<div  class="' + colClass + ' report-repeater-column-header no-padding" style="' + defaultAligment + colWidth + '"><table style="table-layout:fixed;width:100%"><tr><td style="overflow:hidden;white-space: nowrap;width:100%;">' + getColumnDropDownHTMLCode(column, columnIndex, elementName, column.elementType) + '</td></tr></table> </div>';

                     return htmlCode;

              }


              function getDataCell(column,gridID,columnIndex,columnDefaultStyle)
              {
                      var htmlCode = '';

                          //var elementName = column.collectionID.toLowerCase()+'_'+column.elementName;
                          var elementID = 'wst'+column.elementID.toLowerCase();
                          var elementName = elementID.replace(/[^a-zA-Z ]/g,'');
                          //var elementName = 'wst'+column.elementID.toLowerCase();
                          //var elementID = column.elementID;

                          if (column.aggregation)
                              //elementName = column.collectionID.toLowerCase()+'_'+column.elementName+column.aggregation;
                              elementName = elementName+column.aggregation;

                          var theValue = '<div style="overflow:hidden;height:100%;">{{item.'+elementName+'}}</div>';
                          if (column.elementType === 'DECIMAL' || column.elementType === 'INTEGER' || column.elementType === 'FLOAT' )
                               theValue = '<div style="overflow:hidden;height:100%;">{{item.'+elementName+' | number}}</div>';

                          if (column.signals)
                          {
                              var theStyle = '<style>';
                              var theClass = '';
                              for (var s in column.signals)
                              {

                                  theStyle += ' .customStyle'+s+'_'+columnIndex+'{color:'+column.signals[s].color+';background-color:'+column.signals[s]['background-color']+';font-size:'+column.signals[s]['font-size']+';font-weight:'+column.signals[s]['font-weight']+';font-style:'+column.signals[s]['font-style']+';}';
                                  var theComma = '';
                                  if (s > 0)
                                      theComma = ' , ';

                                  var operator = '>'

                                  switch(column.signals[s].filter) {
                                      case "equal":
                                          operator = ' == ' + column.signals[s].value1
                                          break;
                                      case "diferentThan":
                                          operator = ' != '  + column.signals[s].value1
                                          break;
                                      case "biggerThan":
                                          operator = ' > '  + column.signals[s].value1
                                          break;
                                      case "biggerOrEqualThan":
                                          operator = ' >= '  + column.signals[s].value1
                                          break;
                                      case "lessThan":
                                          operator = ' < '  + column.signals[s].value1
                                          break;
                                      case "lessOrEqualThan":
                                          operator = ' <= ' + column.signals[s].value1
                                          break;
                                      case "between":
                                          operator = ' >= ' + column.signals[s].value1 + ' && {{item.'+elementName+'}} <= ' + column.signals[s].value2
                                          break;
                                      case "notBetween":
                                          operator = ' < ' + column.signals[s].value1 + ' || {{item.'+elementName+'}}  > ' + column.signals[s].value2
                                          break;
                                  }

                                  theClass += theComma+ 'customStyle'+s+'_'+columnIndex+' : {{item.'+elementName+'}} '+operator;
                              }
                              htmlCode += theStyle +'</style>'

                              if (column.elementType === 'DECIMAL' || column.elementType === 'INTEGER' || column.elementType === 'FLOAT' )
                                  theValue = '<div ng-class="{'+theClass+'}" style="overflow:hidden;height:100%;" >{{item.'+elementName+' | number}}</div>';
                              else
                                  theValue = '<div ng-class="{'+theClass+'}" style="overflow:hidden;height:100%;" >{{item.'+elementName+'}}</div>';

                          }

                          if (column.link)
                          {
                              if (column.link.type == 'report')
                              {
                                 if (column.elementType === 'DECIMAL' || column.elementType === 'INTEGER' || column.elementType === 'FLOAT' )
                                 theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/reports/'+column.link._id+'/'+column.link.promptElementID+'/{{item.'+elementName+'}}">{{item.'+elementName+' | number}}</a>'
                                 else
                                  theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/reports/'+column.link._id+'/'+column.link.promptElementID+'/{{item.'+elementName+'}}">{{item.'+elementName+'}}</a>'
                              }
                              if (column.link.type == 'dashboard')
                              {
                                  if (column.elementType === 'DECIMAL' || column.elementType === 'INTEGER' || column.elementType === 'FLOAT' )
                                  theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/dashboards/'+column.link._id+'/'+column.link.promptElementID+'/{{item.'+elementName+'}}">{{item.'+elementName+' | number}}</a>'
                                  else
                                  theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/dashboards/'+column.link._id+'/'+column.link.promptElementID+'/{{item.'+elementName+'}}">{{item.'+elementName+'}}</a>'
                              }
                          }

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

                          var defaultAligment = '';
                          if (column.elementType === 'DECIMAL' || column.elementType === 'INTEGER' || column.elementType === 'FLOAT' )
                              defaultAligment = 'text-align: right;'
                              //with popover
                             /* htmlCode += '<div id="ROW_'+gridID+'" class="repeater-data-column '+colClass+' popover-primary" style="'+columnDefaultStyle+columnStyle+colWidth+defaultAligment+'" popover-trigger="mouseenter" popover-placement="top" popover-title="'+column.objectLabel+'" popover="{{item.'+elementName+'}}" ng-click="cellClick(\''+hashedID+'\',item,'+'\''+elementID+'\''+','+'\''+elementName+'\''+')">'+theValue+' </div>';
                             */
                              //without popover
                              htmlCode += '<div id="ROW_'+gridID+'" class="repeater-data-column '+colClass+'" style="'+columnDefaultStyle+columnStyle+colWidth+defaultAligment+'" ng-click="cellClick(\''+hashedID+'\',item,'+'\''+elementID+'\''+','+'\''+elementName+'\''+')">'+theValue+' </div>';

                  return htmlCode;

              }


              function calculateForColumn(report,columnIndex,elementName)
              {
                  var htmlCode = '';

                  if (columns[columnIndex].operationSum === true)
                  {
                      htmlCode += '<div  style=""><span class="calculus-label">SUM:</span><span class="calculus-value"> '+numeral(calculateSumForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
                  }

                  if (columns[columnIndex].operationAvg === true)
                  {
                      htmlCode += '<div  style=""><span class="calculus-label">AVG:</span><span class="calculus-value"> '+numeral(calculateAvgForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
                  }

                  if (columns[columnIndex].operationCount === true)
                  {
                      htmlCode += '<div  style=""><span class="calculus-label">COUNT:</span><span class="calculus-value"> '+numeral(calculateCountForColumn(columnIndex,elementName)).format('0,0')+'</span> </div>';
                  }

                  if (columns[columnIndex].operationMin === true)
                  {
                      htmlCode += '<div  style=""><span class="calculus-label">MIN:</span><span class="calculus-value"> '+numeral(calculateMinimumForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
                  }
                  if (columns[columnIndex].operationMax === true)
                  {
                      htmlCode += '<div  style=""><span class="calculus-label">MAX:</span><span class="calculus-value"> '+numeral(calculateMaximumForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
                  }

                  return htmlCode;

              }


              function calculateSumForColumn(columnIndex,elementName)
              {
                  var value = 0;

                  for (var row in $scope.report.query.data)
                  {
                      var theRow = $scope.report.query.data[row];

                      if (theRow[elementName])
                          if (theRow[elementName] != undefined)
                              value += Number(theRow[elementName]);
                  }
                  return value;
              }

              function calculateCountForColumn(columnIndex,elementName)
              {
                  var founded = 0;
                  for (var row in $scope.report.query.data)
                  {
                      var theRow = $scope.report.query.data[row];
                      if (theRow[elementName])
                          if (theRow[elementName] != undefined)
                          {
                              founded += 1;
                          }
                  }
                  return founded;
              }

              function calculateAvgForColumn(columnIndex,elementName)
              {
                  var value = 0;
                  var founded = 0;

                  for (var row in $scope.report.query.data)
                  {
                      var theRow = $scope.report.query.data[row];

                      if (theRow[elementName])
                          if (theRow[elementName] != undefined)
                          {
                              founded += 1;
                              value += Number(theRow[elementName]);
                          }
                  }
                  return value/founded;
              }

              function calculateMinimumForColumn(columnIndex,elementName)
              {
                  var lastValue = undefined;

                  for (var row in $scope.report.query.data)
                  {
                      var theRow = $scope.report.query.data[row];

                      if (theRow[elementName])
                          if (theRow[elementName] != undefined)
                          {
                              if (lastValue == undefined)
                                  lastValue = theRow[elementName];

                              if (theRow[elementName] < lastValue)
                                  lastValue = theRow[elementName];
                          }
                  }
                  return lastValue;

              }

              function calculateMaximumForColumn(columnIndex,elementName)
              {
                  var lastValue = undefined;

                  for (var row in $scope.report.query.data)
                  {
                      var theRow = $scope.report.query.data[row];

                      if (theRow[elementName])
                          if (theRow[elementName] != undefined)
                          {
                              if (lastValue == undefined)
                                  lastValue = theRow[elementName];

                              if (theRow[elementName] > lastValue)
                                  lastValue = theRow[elementName];
                          }
                  }
                  return lastValue;
              }

              function getColumnDropDownHTMLCode(column, columnIndex,elementName,columnType)
              {
                  if (column.elementType == 'DATE')
                  {
                      var elementID = 'wst'+column.elementID.toLowerCase();
                      var elementName = elementID.replace(/[^a-zA-Z ]/g,'');
                      //elementName = "'"+column.collectionID.toLowerCase()+'_'+column.elementName+'_original'+"'";
                      elementName = "'"+elementName+'_original'+"'";
                  }

                  var columnPropertiesBtn = '<div class="btn-group" dropdown="" style="position:unset;"> '
                      +'<button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="margin-bottom: 0px;background-color:transparent;padding:2px;font-size:inherit">'
                      + column.objectLabel
                      +' <span class="caret"></span>'
                      +'</button>'
                      +'<ul class="dropdown-menu dropdown-white multi-level" role="menu">'
                      +'<li><a ng-click="reverse = true; orderColumn('+columnIndex+',false,'+quotedHashedID()+')" ><i class="fas fa-sort-up"></i> <span ng-i18next="Sort Ascending"></span></a></li>'
                      +'<li><a ng-click="reverse = false; orderColumn('+columnIndex+',true,'+quotedHashedID()+')" ><i class="fas fa-sort-down"></i> <span ng-i18next="Sort Descending"></span></a></li>'
                      +'<li class="divider"></li>'
                      +'<li><a ng-click="saveToExcel()"><i class="fas fa-file-excel"></i>  <span ng-i18next="Export table to excel"></span></a></li>'
                      +'<li class="divider"></li>'
                      +'<li><input class="find-input pull-right" type="search" ng-model="theFilter" placeholder="Column filter..." aria-label="Column filter..." style="margin:5px;" /></li>'
                      +'</ul>'
                      +'</div>';

                  return  columnPropertiesBtn;
              }


        }

      }
});
