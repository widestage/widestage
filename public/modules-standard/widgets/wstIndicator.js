app.directive('wstIndicator', function($compile, $rootScope,$i18next,queryModel) {
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
              var mode = $scope.mode;


              if(!report.properties)
                  report.properties = {};
              if(!report.properties.indicator)
                  report.properties.indicator = {};

                  if(!report.properties.indicator.main_font_type) report.properties.indicator.main_font_type = '';
                  if(!report.properties.indicator.main_font_size) report.properties.indicator.main_font_size = 38;
                  if(!report.properties.indicator.main_font_color) report.properties.indicator.main_font_color = '#000';
                  if(!report.properties.indicator.main_value_type) report.properties.indicator.main_value_type = ''; //currency //percentage
                  if(!report.properties.indicator.currency_symbol) report.properties.indicator.currency_symbol = '';
                  if(!report.properties.indicator.style) report.properties.indicator.style = 'style1';
                  if(!report.properties.indicator.background_color) report.properties.indicator.background_color = '#fff';
                  if(!report.properties.indicator.secondary_font_type) report.properties.indicator.secondary_font_type = '';
                  if(!report.properties.indicator.secondary_font_size) report.properties.indicator.secondary_font_size = 12;
                  if(!report.properties.indicator.secondary_font_color) report.properties.indicator.secondary_font_color = '#000';
                  if(!report.properties.indicator.secondary_text) report.properties.indicator.secondary_text = '';
                  if(!report.properties.indicator.icon_size) report.properties.indicator.icon_size = 34;
                  if(!report.properties.indicator.icon_background_color) report.properties.indicator.icon_background_color = '#40bbea;';
                  if(!report.properties.indicator.icon_color) report.properties.indicator.icon_color = '#fff';
                  if(!report.properties.indicator.icon) report.properties.indicator.icon = 'fa-bolt';

                  report.properties.indicator.refresh = function()
                      {
                        if (report.query)
                        {
                                    var htmlCode = generateIndicator();
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

                    report.properties.indicator.refresh();

          }

          function generateIndicator()
              {

                  var report = $scope.report;

                  var htmlCode = '';

                  var reportColumn = undefined;
                  for (var c in report.query.columns)
                  {
                     if (report.query.columns[c].elementRole === 'measure')
                        {
                          reportColumn = report.query.columns[c];
                          break;
                        }
                  }

                  var theData = report.query.data;
                      if (theData && reportColumn)
                      {
                          if (!report.properties.indicator.style)
                              report.properties.indicator.style = 'style1';


                          var theYKey1 = 'wst'+reportColumn.elementID.toLowerCase();
                          var theYKey = theYKey1.replace(/[^a-zA-Z ]/g,'');


                          if (reportColumn.aggregation) theYKey += reportColumn.aggregation.toLowerCase();


                          //var theValue = '{{'+theData[0][theYKey] +'| number}}';

                          if (theData[0])
                          {
                                var theValue = theData[0][theYKey]

                                if (report.properties.indicator.main_value_type == 'percentage')
                                {
                                    //theValue = '{{'+theData[0].value +'| number}} %';
                                    theValue = theData[0].value+' %';
                                }

                                if (report.properties.indicator.main_value_type == 'currency' && report.properties.indicator.currency_symbol)
                                {
                                    //theValue = '{{'+theData[0].value +'| number}}'+ ' '+report.properties.indicator.currency_symbol;
                                    theValue = theData[0].value+ ' '+report.properties.indicator.currency_symbol;

                                }

                                var theValueText = '';

                                if (report.properties.indicator.secondary_text != undefined)
                                    theValueText = report.properties.indicator.secondary_text;
                                else theValueText = reportColumn.elementLabel;

                                var theEvolution = theData[0].evolution + ' %';

                                var trend = 'same';
                                var trendLabel = 'same';

                                if (theData[0].evolution > 0)
                                    {
                                      trend = 'up';
                                      trendLabel = 'increase';
                                    }
                                if (theData[0].evolution < 0)
                                    {
                                    trend = 'down';
                                    trendLabel = 'decrement';
                                    }

                                var theBackgroundColor = '#68b828';
                                if (report.properties.indicator.background_color)
                                    theBackgroundColor = 'background-color: '+report.properties.indicator.background_color;

                                var theReportIconBackgroundColor = '#40bbea'
                                if (report.properties.indicator.icon_background_color)
                                    theReportIconBackgroundColor = 'background-color: '+report.properties.indicator.icon_background_color+';';

                                var theFontColor = '#fff';
                                if (report.properties.indicator.main_font_color)
                                    theFontColor = report.properties.indicator.main_font_color;

                                var theAuxFontColor = '#fff'
                                if (report.properties.indicator.secondary_font_color)
                                    theAuxFontColor = report.properties.indicator.secondary_font_color;

                                var mainFontStyle = 'margin-left:10px;color:'+report.properties.indicator.main_font_color+';'+'font-size:'+report.properties.indicator.main_font_size+'px;';
                                var secondaryFontStyle = 'margin-left:10px;color:'+report.properties.indicator.secondary_font_color+';'+'font-size:'+report.properties.indicator.secondary_font_size+'px;';
                                var iconStyle = 'color:'+report.properties.indicator.icon_color+';'+'font-size:'+report.properties.indicator.icon_size+'px;height: '+report.properties.indicator.icon_size*2+'px;width: '+report.properties.indicator.icon_size*2+'px;vertical-align: middle;line-height: '+report.properties.indicator.icon_size*2+'px;';



                                if (report.properties.indicator.style === 'style1')
                                {
                                    htmlCode += '<div class="xe-widget xe-counter xe-counter-info" data-count=".num" data-from="1000" data-to="2470" data-duration="4" data-easing="true" style="padding:10px;'+theBackgroundColor+'">';
                                    htmlCode += '   <div class="xe-icon" >';
                                    htmlCode += '       <i class="fa '+report.properties.indicator.icon+'" style="'+theReportIconBackgroundColor+iconStyle+'"></i>';
                                    htmlCode += '   </div>';
                                    htmlCode += '   <div class="xe-label">';
                                    htmlCode += '       <strong class="report-html-widget-style1-value" style="'+mainFontStyle+'">'+theValue +'</strong>';
                                    htmlCode += '       <span style="'+secondaryFontStyle+'">'+theValueText+'</span>';
                                    htmlCode += '   </div>';
                                    htmlCode += '</div>';
                                }

                                if (report.properties.indicator.style == 'style2')
                                {
                                    htmlCode += '<div class="xe-widget xe-counter-block" xe-counter="" data-count=".num" data-from="0" data-to="99.9" data-suffix="%" data-duration="2" style="padding:10px;'+theBackgroundColor+';height:100%;margin-bottom:0px;">';
                                    htmlCode += '   <div class="xe-upper"  style="'+theBackgroundColor+'">';
                                    htmlCode += '       <div class="xe-icon" style="background-color:transparent">';
                                    htmlCode += '           <i class="fa '+report.properties.indicator.icon+'" style="background-color:transparent;'+iconStyle+'"></i> ';
                                    htmlCode += '       </div>';
                                    htmlCode += '       <div class="xe-label">';
                                    htmlCode += '           <strong class="num" style="'+mainFontStyle+'">'+theValue+'</strong>';
                                    htmlCode += '           <span style="'+secondaryFontStyle+'">'+theValueText+'</span> ';
                                    htmlCode += '       </div> ';
                                    htmlCode += '   </div>';
                                    htmlCode += '   <div class="xe-lower"> ';
                                    htmlCode += '       <div class="border"></div> ';
                                    htmlCode += '       </div> ';
                                    htmlCode += '   </div> ';
                                    htmlCode += '</div> ';
                                }

                                if (report.properties.indicator.style == 'style3')
                                {
                                    htmlCode += '<div class="chart-item-bg-2" style="padding:10px;'+theBackgroundColor+';color:'+theFontColor+';height:100%;">';
                                    htmlCode += '   <div class="chart-item-num" xe-counter="" data-count="this" data-from="0" data-to="98" data-suffix="%" data-duration="2" style="padding: 10px; '+mainFontStyle+'">'+theValue+'</div>';
                                    htmlCode += '       <div class="chart-item-desc" > ';
                                    htmlCode += '           <p style="'+secondaryFontStyle+'">'+theValueText+'</p>';
                                    htmlCode += '       </div> ';
                                    htmlCode += '   </div>';
                                    htmlCode += '</div>';
                                }
                          }

                          return htmlCode;

                      } else {
                        var errorMsg = $i18next.t('Value data not found!')
                        return '<div class="alert alert-danger"> <i class="fa fa-exclamation-triangle"></i>  '+errorMsg+'</div>'
                      }

              }


        }

      }
});
