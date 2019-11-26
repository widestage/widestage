app.directive('ndDonutChart', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            chartData: "=",
            colors: "=",
            height: "@",
            width: "@",
            strokeColor: "@",
            refresh: "="
        },
        templateUrl: "/widgets/views/ndDonutChart.html",
        compile: function (element, attributes) {

            return function (scope, element, attrs, controller) {
                var elementID = makeID();

                element.children('.chart').attr('id', elementID);

                Morris.Donut.prototype.resizeHandler = function() {
                    if(document.getElementById(this.el[0].id)){
                        this.timeoutId = null;
                        this.raphael.setSize(this.el.width(), this.el.height());
                        return this.redraw();
                    }
                };
var theMorris = undefined;
                function createChart() {
                    var data = scope.chartData;
                    var height = scope.height;
                    var width = scope.width;
                    var strokeColor = scope.strokeColor;
                    var colors = (scope.colors) ? scope.colors : false;

                    if (height)
                       {
                            $('#'+elementID).css({'height': height});
                        }
                    if (width)
                       {
                            $('#'+elementID).css({'width': width});
                        }
                    $timeout(function () { //If the second parameter is not provided, execute the function after the DOM has completed rendering
                        if (data.length > 0) {
                            var chartParams = {
                                element: elementID,
                                data: data,
                                resize: true,
                                backgroundColor: (strokeColor) ? strokeColor : '#FFFFFF'
                            };

                            if (colors) {
                                chartParams.colors = colors;
                            }

                            theMorris = new Morris.Donut(chartParams);
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
                
                scope.$watch('chartData', function(){
                    if (theMorris)
                        theMorris.setData(scope.chartData);
                    
                });
            };
        }
    };
});
