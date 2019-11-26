app.directive('wstChart', function($compile, $rootScope,$i18next,uuid2) {
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
        link: function($scope, element, attrs)  {

          $scope.$watch('report', function() {
            if ($scope.report)
              {
                  init();
              }
          });

          function init()
          {
            var report = $scope.report;
            var mode = $scope.mode;

            if(!report.properties)
                report.properties = {};
            if(!report.properties.chart)
                report.properties.chart = {};

                if (!report.properties.chart.chartID) report.properties.chart.chartID = 'Chart'+uuid2.newguid();
                if (!report.properties.chart.dataPoints) report.properties.chart.dataPoints =[];
                if (!report.properties.chart.dataColumns) report.properties.chart.dataColumns =[];
                if (!report.properties.chart.datax) report.properties.chart.datax = {};
                //height:300,
                if (!report.properties.chart.type) report.properties.chart.type = 'bar';
                if (!report.properties.chart.axis_x_type) report.properties.chart.axis_x_type = 'category';
                if (!report.properties.chart.axis_y_type) report.properties.chart.axis_y_type = 'category';
                if (!report.properties.chart.axis_y_tick_format) report.properties.chart.axis_y_tick_format = '';
                if (!report.properties.chart.axis_y2_type) report.properties.chart.axis_y2_type = 'category';
                if (!report.properties.chart.legend_position) report.properties.chart.legend_position = 'bottom'; //right  //inset
                if (!report.properties.chart.legend_inset_anchor) report.properties.chart.legend_inset_anchor = 'top-right';
                if (!report.properties.chart.legend_inset_x) report.properties.chart.legend_inset_x = 20;
                if (!report.properties.chart.legend_inset_y) report.properties.chart.legend_inset_y = 10;
                if (!report.properties.chart.legend_inset_step) report.properties.chart.legend_inset_step = 2;
                if (!report.properties.chart.padding_top) report.properties.chart.padding_top = 20;
                if (!report.properties.chart.padding_bottom) report.properties.chart.padding_bottom = 20; //take into account legends
                if (!report.properties.chart.padding_right) report.properties.chart.padding_right = 20;
                if (!report.properties.chart.padding_left) report.properties.chart.padding_left = 50; //take into account legends
                if (!report.properties.chart.size_height) report.properties.chart.size_height = 300;
                if (!report.properties.chart.regions) report.properties.chart.regions = [];  //[{axis: 'x', start: 1, end: 4, class: 'region-1-4'}]
                if (!report.properties.chart.bar_width) report.properties.chart.bar_width = 'auto';  //auto
                if (!report.properties.chart.donut_title) report.properties.chart.donut_title = '';

                if (report.properties.chart.label_show == undefined) report.properties.chart.label_show = true;
                if (report.properties.chart.tooltip_show == undefined) report.properties.chart.tooltip_show = true;
                if (report.properties.chart.zoom_enabled == undefined) report.properties.chart.zoom_enabled = true;
                if (report.properties.chart.grid_x_show == undefined) report.properties.chart.grid_x_show = false;
                if (report.properties.chart.grid_y_show == undefined) report.properties.chart.grid_y_show = false;
                if (report.properties.chart.axis_y2_show == undefined) report.properties.chart.axis_y2_show = false;
                if (report.properties.chart.axis_rotated == undefined) report.properties.chart.axis_rotated = false;
                if (report.properties.chart.legend_show == undefined) report.properties.chart.legend_show = true;
                if (report.properties.chart.axis_y_show  == undefined) report.properties.chart.axis_y_show = true;
                if (report.properties.chart.axis_x_show == undefined) report.properties.chart.axis_x_show = true;

            var reportID = report.id;

            var htmlCode = getChartHTML(report,reportID,mode);

            var el = element;
            element.empty();
            element.append(htmlCode);
            setTimeout(function() {rebuildChart();
                                   //hideOverlay('OVERLAY_'+report.parentDiv);
                                 }, 100);
          }



          function rebuildChart()
              {
                  var report = $scope.report;

                  var theValues = [];
                  var theTypes = {};
                  var theColors = {};
                  var theNames = {};
                  var query = report.query;
                  var properties = report.properties;
                  var chart = report.properties.chart;
                  var reportID = report._id;
                  var theColors = {};
                  var axisField = '';
                  if (chart.dataAxis)
                      axisField = chart.dataAxis.id;

                  var axisIsInQuery = false;

                  if (chart.dataAxis)
                      for (var d in query.datasources) {
                          for (var c in query.datasources[d].collections) {
                              for (var qc in query.datasources[d].collections[c].columns) {
                                  var elementName = query.datasources[d].collections[c].columns[qc].collectionID.toLowerCase() + '_' + query.datasources[d].collections[c].columns[qc].elementName;

                                  if (query.datasources[d].collections[c].columns[qc].aggregation)
                                      elementName = query.datasources[d].collections[c].columns[qc].collectionID.toLowerCase() + '_' + query.datasources[d].collections[c].columns[qc].elementName + query.datasources[d].collections[c].columns[qc].aggregation;

                                  if (elementName == chart.dataAxis.id) {
                                      axisIsInQuery = true;
                                  }

                                  if (query.datasources[d].collections[c].columns[qc].id == chart.dataAxis.id) //JOSE
                                  {
                                      var elementID = 'wst' + query.datasources[d].collections[c].columns[qc].elementID.toLowerCase();
                                      var elementName = elementID.replace(/[^a-zA-Z ]/g, '');

                                      //axisField = 'wst'+query.datasources[d].collections[c].columns[qc].elementID;
                                      axisField = elementName;
                                  }
                              }
                          }
                      }

                  if (axisIsInQuery == false) {
                      axisField = null;
                      if (chart.dataAxis)
                          chart.dataAxis.id = null;

                  }


                  var columnsForDelete = [];

                  for (var i in chart.dataColumns) {
                      var columnFound = false;
                      //remove column if not in query
                      for (var qc in query.columns) {
                          var elementName = query.columns[qc].collectionID.toLowerCase() + '_' + query.columns[qc].elementName;

                          if (query.columns[qc].aggregation) {
                              elementName = query.columns[qc].collectionID.toLowerCase() + '_' + query.columns[qc].elementName + query.columns[qc].aggregation;
                              query.columns[qc].id = elementName;
                          }
                          if (chart.dataColumns[i].id == elementName) {
                              columnFound = true; //columnsForDelete.push(i);
                          }

                      }


                      if (columnFound == false) {
                          ////columnsForDelete.push(i);
                      }
                  }


                  for (var cfd in columnsForDelete) {
                      chart.dataColumns.splice(columnsForDelete[cfd], 1);

                  }

                  //remove query if not dataColumns and not data Axis

                  if (axisIsInQuery == false && chart.dataColumns.length) {
                      //this is not suitable for gauge as there is not dataColumns, only metrics, so I comented the 2 lines below
                      //chart.query = null;
                      //chart.queryName = null;
                  }


                  for (var i in chart.dataColumns) {
                      if (chart.dataColumns[i].id != undefined) {

                          var elementID = 'wst' + chart.dataColumns[i].elementID.toLowerCase();
                          var elementName = elementID.replace(/[^a-zA-Z ]/g, '');

                          if (chart.dataColumns[i].aggregation)
                              elementName = elementName + chart.dataColumns[i].aggregation.toLowerCase();

                          theValues.push(elementName); //JOSE
                          var valueName = elementName;
                          //theTypes[elementName] = chart.dataColumns[i].elementType;
                          if (chart.dataColumns[i].type)
                              theTypes[elementName] = chart.dataColumns[i].type;
                              else
                              theTypes[elementName] = 'line';
                          if (chart.dataColumns[i].color)
                              theColors[elementName] = chart.dataColumns[i].color;
                              //else
                              //theColors[elementName] = '#000';
                      }
                      theNames[valueName] = chart.dataColumns[i].elementLabel;
                  }


                  if (query) {

                      var theChartCode = '#CHART_' + reportID;

                      if (!chart.height)
                          chart.height = 300;

                      if (chart.type == 'pie' || chart.type == 'donut' || chart.type == 'gauge') {

                          var theColumns = [];
                          if (axisField && theValues) {
                              for (var i in query.data) {
                                  theColumns.push([query.data[i][axisField], query.data[i][theValues[0]]]);
                              }
                          }


                          var theData = {
                                            columns: theColumns,
                                            type: chart.type
                                        }
                      } else {

                              var theData = {
                                                json: query.data,
                                                keys: {
                                                    x: axisField,
                                                    value: theValues
                                                },
                                                onclick: function (d, element) { console.log('click over',d,element) },
                                                types: theTypes,
                                                colors: theColors,
                                                names: theNames
                                            }
                          }


                            var chartProperties = {
                                bindto: theChartCode,
                                data: theData,
                                axis: {
                                    x: {
                                        type: chart.axis_x_type,
                                        show: chart.axis_x_show
                                    },
                                    y: {
                                        type: chart.axis_y_type,
                                        show: chart.axis_y_show
                                        /*tick: {
                                                  format: d3.format(chart.axis_y_tick_format+",")
                                  //                format: function (d) { return "$" + d; }
                                          }*/
                                    },
                                    y2: {
                                        type: chart.axis_y2_type,
                                        show: chart.axis_y2_show
                                    },
                                    rotated: chart.axis_rotated
                                },
                                legend: {
                                          show: chart.legend_show,
                                          position: chart.legend_position, //right  //inset
                                          inset: {
                                                  anchor: chart.legend_position_inset_anchor,
                                                  x: chart.legend_position_inset_x,
                                                  y: chart.legend_position_inset_y,
                                                  step: chart.legend_position_inset_step
                                                }
                                        },
                                padding: {
                                            top: chart.padding_top,
                                            bottom: chart.padding_bottom, //take into account legends
                                            right: chart.padding_right,
                                            left: chart.padding_left //take into account legends
                                          },
                                grid: {
                                        x: {
                                          show: chart.grid_x_show
                                        },
                                        y: {
                                          show: chart.grid_y_show
                                        }
                                      },

                                size: {
                                    height: chart.size_height
                                },
                                regions: chart.regions,
                                tooltip: {
                                  show: chart.tooltip_show
                                },
                                zoom: {
                                  enabled: chart.zoom_enabled
                                },
                                bar: {
                                  width: chart.bar_width
                                },
                                pie: {
                                  label: {
                                    show: chart.label_show
                                  }
                                },
                                donut: {
                                  label: {
                                    show: chart.label_show
                                  },
                                  title: chart.donut_title
                                },
                                gauge: {
                                  label: {
                                    show: chart.label_show
                                  }
                                }
                            };



                            var chartCanvas = c3.generate(chartProperties);

                      }

                      chartCanvas.resize();
                      report.properties.chart.refresh = function()
                      {
                          init();
                      }

              }

          function getChartHTML(report,theChartID,mode)
              {
                  var html = '';

                  var reportID = report._id;

                  var style = (report.properties.backgroundColor) ? 'style="background-color: '+report.properties.backgroundColor+'"' : "";

                  if (mode == 'edit')
                      html = '<c3chart page-block ndType="c3Chart" bs-loading-overlay bs-loading-overlay-reference-id="OVERLAY_'+reportID+'" bindto-id="CHART_'+reportID+'" id="CHART_'+reportID+'" '+style+'>';
                      else
                      html = '<c3chart bs-loading-overlay bs-loading-overlay-reference-id="OVERLAY_'+reportID+'" bindto-id="CHART_'+reportID+'" id="CHART_'+reportID+'" >';

                      html = html +       '</c3chart>';
                  return html;
              }

        }

      }
});
