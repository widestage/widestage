app.directive('ndLineChart', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            chartData: "=",
            chartHeight: "=",
            ymax: "=",
            hideValues: "="
        },
        templateUrl: "/widgets/views/ndLineChart.html",
        compile: function (element, attributes) {

            return function (scope, element, attrs, controller) {
                var elementID = makeID();

                element.children('.chart').attr('id', elementID);

                function createChart() {
                    var chartData = scope.chartData;
                    var chartHeight = (scope.chartHeight) ? scope.chartHeight : 300;
                    var ymax = (scope.ymax) ? scope.ymax : 10;

                    var ykeys = [], labels = [], colors = true, lineColors = [], columns = [], data = [];

                    for (var i in chartData) {
                        ykeys.push(i);
                        labels.push(chartData[i].label);

                        if (chartData[i].color) {
                            lineColors.push(chartData[i].color);
                        }
                        else {
                            colors = false;
                        }

                        for (var j in chartData[i].values) {
                            if (!columns[j]) columns[j] = {};

                            columns[j].column = Number(j)+1;
                            columns[j][i] = chartData[i].values[j];
                        }
                    }

                    for (var i in columns) {
                        data.push(columns[i]);
                    }

                    $timeout(function () { //If the second parameter is not provided, execute the function after the DOM has completed rendering
                        if (data.length > 0) {
                            
                            if (scope.hideValues)
                            {
                                var chartParams = {
                                    element: elementID,
                                    data: data,
                                    xkey: 'column',
                                    ykeys: ykeys,
                                    ymax: ymax,
                                    labels: labels,
                                    axes:false,
                                    hideHover: true,
                                    resize: true,
                                    hoverCallback: function (index, options, content, row) {
      
                                    },
                                    dateFormat: function (x) { return ''; }
                                };
                            } else {
                                var chartParams = {
                                    element: elementID,
                                    data: data,
                                    xkey: 'column',
                                    ykeys: ykeys,
                                    ymax: ymax,
                                    labels: labels,
                                    hideHover: true,
                                    resize: true,
                                    dateFormat: function (x) { return ''; }
                                };
                            }

                            if (colors) {
                                chartParams.lineColors = lineColors;
                            }

                            new Morris.Line(chartParams);
                        }
                    });
                }

                var refreshIntervalId = setInterval(function() {
                    if (scope.chartData) {
                        clearInterval(refreshIntervalId);
                        createChart();
                    }
                }, 60);
                
                function makeID() 
                {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            
                    for( var i=0; i < 10; i++ )
                        text += possible.charAt(Math.floor(Math.random() * possible.length));
            
                    return text;
                }

            };
        }
    };
});