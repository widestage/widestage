var module = angular.module("intro.help", []);

module.directive('introHelp', ['$rootScope',  '$compile', '$parse','$window', function($rootScope, $compile, $parse, $window) {
	return {
	        restrict: 'A',
            scope: {
                ngIntroMethod: "=",
                ngIntroHelpShow: "=",
                ngIntroExitMethod: "=?",
                ngIntroOptions: '=',
                ngIntroNextMethod: "=?",
                ngIntroAutorefresh: '='
            },
        /*
            template:
                function(scope, el, attrs, controller) {
                    '<div id="introHelpOverlay" class="introjs-overlay"></div>'+
                        '<div id="introHelpCallout" class="callout bottom"><a class="btn" ng-click="goNext()">Next</a> </div>'
                    scope.divToPop = $(document.createElement('div')).attr('class', 'callout bottom').prependTo($(el));

                    var nextBtn = $(document.createElement('a'));
                    nextBtn.attr('class','btn');
                    nextBtn.attr('ngClick', 'goNext()')
                    nextBtn.attr('ng-click','goNext()');
                    scope.divToPop.append(nextBtn);
                },
*/
	        link: function(scope, el, attrs, controller) {

               $window.addEventListener('keydown', function(e) {
                    scope._onKeyDown(e);
                });


                var strElm = '<div id="introHelpOverlay"  class="introjs-overlay"></div>'+
                                '<div id="introHelpCallout" class="panel callout bottom-left">{{intro}}<div id="introHelpCalloutContent"></div>'+
                                    '<div style="position: absolute;bottom: 0;left: 0;width:100%;padding:3px;border-top:1px #999 solid">'+
                                        '<a class="btn btn-primary btn-xs" ng-click="exit()">Close</a>'+
                                        '<a id="introHelpNextBtn" class="btn btn-info btn-xs pull-right"  ng-click="goNext()">Next</a>'+
                                        '<a id="introHelpPreviousBtn" class="btn btn-info btn-xs pull-right"  ng-click="goPrevious()">Previous</a>'+
                                    '</div>'+
                                '</div>'+
                                '<div id="introHelpObjectArea" style="display:none;position:absolute"></div>'

                                ;

                    var divToPop = $compile(strElm) (scope);
                    divToPop.prependTo($(el));//.append(divToPop);
                    $("#introHelpPreviousBtn").hide();




            scope.showHelpForElement = function (theElement) {

                    if ($(theElement).offset()) //Is visible the element?
                        {
                                if (scope.previousElement)
                                    $(scope.previousElement).css({"z-index": 0});

                                $("#introHelpOverlay").show();
                                $("#introHelpObjectArea").hide();

                                var pos = $(theElement).offset();
                                var h = $(theElement).height();
                                var w = $(theElement).width();
                                var elementOffset = _getOffset(theElement);

                                var theWidth = "200px";
                                var theHeight = "100px";

                                if (scope.introElements[scope.actualStep].width)
                                    theWidth = scope.introElements[scope.actualStep].width;
                                if (scope.introElements[scope.actualStep].height)
                                    theHeight = scope.introElements[scope.actualStep].height;

                            //var html = '<iframe width="420" height="315" src="https://www.youtube.com/embed/gqV_63a0ABo" frameborder="0" allowfullscreen></iframe>';

                            $("#introHelpCalloutContent").empty();
                            if (scope.introElements[scope.actualStep].html)
                                {
                                var html = scope.introElements[scope.actualStep].html;
                                var theIntro = $compile(html) (scope);
                                $("#introHelpCalloutContent").append(theIntro);
                                }
                            if (scope.introElements[scope.actualStep].intro)
                                scope.intro = scope.introElements[scope.actualStep].intro;
                                else scope.intro = '';

                            var elementLeft = elementOffset.left + 10;
                            var elementTop = elementOffset.top + elementOffset.height;
                            if (scope.introElements[scope.actualStep].verticalAlign == 'top')
                                elementTop = elementOffset.top;

                            var numericWidth = parseInt(theWidth.replace("px", ""));

                            if (scope.introElements[scope.actualStep].horizontalAlign == 'right')
                                elementLeft = elementOffset.left - numericWidth + elementOffset.width;

                                $("#introHelpCallout").css({ left: elementLeft , top: elementTop, width: theWidth, height: theHeight });
                                $("#introHelpCallout").show();

                            if (scope.introElements[scope.actualStep].objectArea != false)
                                {
                                 var areaColor = "#fff"
                                 if (scope.introElements[scope.actualStep].areaColor)
                                    areaColor = scope.introElements[scope.actualStep].areaColor;

                                 var areaLineColor = "#000"
                                 if (scope.introElements[scope.actualStep].areaColor)
                                    areaLineColor = scope.introElements[scope.actualStep].areaLineColor;

                                    $("#introHelpObjectArea").css({"background-color":areaColor,"z-index":400, left: elementOffset.left, top: elementOffset.top, width: elementOffset.width, height: elementOffset.height,border: "2px "+areaLineColor+" solid"});
                                    $("#introHelpObjectArea").show();
                                    $(theElement).css({"z-index":555});
                                    scope.previousElement = theElement;
                                }

                        }
                    };


            function _getOffset(element) {
                    var elementPosition = {};

                    //set width
                    elementPosition.width = element.outerWidth();

                    //set height
                    elementPosition.height = element.outerHeight();

                    //calculate element top and left
                    var pos=$(element).offset();
                    //set top
                    elementPosition.top = pos.top;
                    //set left
                    elementPosition.left = pos.left;

                    return elementPosition;
                  };

            scope.hideHelp = function()
            {
                scope._cover.remove();
                scope.divToPop.remove();
            }

            scope.ngIntroMethod = function(step) {


                    navigationWatch = scope.$on('$locationChangeStart', function(){

                    });

                    scope.actualStep = 0;

                    if (step)
                        scope.actualStep = step;

                    checkForVisibleElements();

                    var targetElement = $(scope.introElements[scope.actualStep].element);
                    scope.showHelpForElement(targetElement);

                };

                function checkForVisibleElements()
                {
                    scope.introElements = [];
                    for (var i in scope.ngIntroOptions.steps)
                        {
                            if ($(scope.ngIntroOptions.steps[i].element).offset())
                                scope.introElements.push(scope.ngIntroOptions.steps[i]);
                            if (!scope.ngIntroOptions.steps[i].element)
                                scope.introElements.push(scope.ngIntroOptions.steps[i]);
                        }

                }

                scope.goNext = function () {

                    if (scope.actualStep < scope.introElements.length -1)
                        {
                            scope.actualStep = scope.actualStep +1;

                            var targetElement = $(scope.introElements[scope.actualStep].element);
                            scope.showHelpForElement(targetElement);


                            if (scope.actualStep == 0)
                                $("#introHelpPreviousBtn").hide();
                                else
                                $("#introHelpPreviousBtn").show();
                            if (scope.actualStep == scope.introElements.length -1)
                                $("#introHelpNextBtn").hide();
                                else
                                $("#introHelpNextBtn").show();
                        }
                }

                scope.goPrevious = function () {

                    if (scope.actualStep > 0)
                        {
                            scope.actualStep = scope.actualStep -1;

                            var targetElement = $(scope.introElements[scope.actualStep].element);
                            scope.showHelpForElement(targetElement);

                            if (scope.actualStep == 0)
                                $("#introHelpPreviousBtn").hide();
                                else
                                $("#introHelpPreviousBtn").show();

                            if (scope.actualStep == scope.introElements.length -1)
                                $("#introHelpNextBtn").hide();
                                else
                                $("#introHelpNextBtn").show();
                        }
                }

                scope.exit = function()
                {
                    $("#introHelpCallout").hide();
                    $("#introHelpOverlay").hide();
                    $("#introHelpObjectArea").hide();
                }

                scope._onKeyDown = function(e) {
                    if (e.keyCode === 27) {
                       scope.exit();
                    } else if(e.keyCode === 37) {
                      //left arrow
                      scope.goPrevious();
                    } else if (e.keyCode === 39) {
                      //right arrow
                      scope.goNext();
                    }
                  };

            }

    }

}]);

/*
$scope.IntroOptions = {
            //IF width > 300 then you will face problems with mobile devices in responsive mode
                steps:[
                    {
                        element: '#mainMenu',
                        html: '<div><h3>The main menu</h3><span style="font-weight:bold;">Here you can access the basic operations in widestage</span><br/><span>The "white" part of the menu is common for all users, the "green" part is only for widestage administrators</span></div>',
                        width: "300px",
                        height: "180px"
                    },
                    {
                        element: '#publicArea',
                        html: '<div><h3>The public area</h3><span style="font-weight:bold;">Here all the public shared elements (reports, dashboards, pages) are displayed to be accesed by the users</span><br/><span>Depending on their permissions the users can access different folders and/or elements</span></div>',
                        width: "300px",
                        height: "180px"

                    },
                    {
                        element: '#latestExecutions',
                        html: '<div><h3>Latest executions</h3><span style="font-weight:bold;">Here are displayed the 10 latest element executions by the connected user, along with the last execution time</span><br/><span></span></div>',
                        width: "300px",
                        height: "180px"
                    },
                    {
                        element: '#mostExecuted',
                        html: '<div><h3>Most Executed</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">This area display the 10 most executed elements for the hole company and the number of executions per element</span><br/><span></span></div>',
                        width: "300px",
                        height: "180px"
                    },
                    {
                        element: '#usersMainMenu',
                        html: '<div><h3>Users</h3><span style="font-weight:bold;color:#8DC63F">This link is only available for widestage administrators.</span><br/><span style="font-weight:bold;">Access users to create new widestage users and to manage them</span><br/><span></span></div>',
                        width: "300px",
                        height: "180px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    }
                    ,
                    {
                        element: '#rolesMainMenu',
                        html: '<div><h3>Roles</h3><span style="font-weight:bold;color:#8DC63F">This link is only available for widestage administrators.</span><br/><span style="font-weight:bold;">Access roles to create, manage roles, and grant or revoque permissions</span><br/><span></span></div>',
                        width: "300px",
                        height: "180px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    }
                    ,
                    {
                        element: '#datasourcesMainMenu',
                        html: '<div><h3>Data sources</h3><span style="font-weight:bold;color:#8DC63F">This link is only available for widestage administrators.</span><br/><span style="font-weight:bold;">Access here to define the connections to the different sources of your information</span><br/><span>You will define here your database connections to get the data used in the reports that will be created by the users</span></div>',
                        width: "300px",
                        height: "250px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    }
                    ,
                    {
                        element: '#layersMainMenu',
                        html:'<div><h3>Layers</h3><span style="font-weight:bold;color:#8DC63F">This link is only available for widestage administrators.</span><br/><span style="font-weight:bold;">Here you can define the semantic layer used by your users to access the data in the different data sources.</span><br/><span>You will define here the labels to use for every field, the joins between the different entities (tables), etc... All the necessary stuff to allow your users to create a report without any knowlegde of the structure of your data</span></div>',
                        width: "300px",
                        height: "300px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    }
                    ,
                    {
                        element: '#publicSpaceMainMenu',
                        html: '<div><h3>Public space</h3><span style="font-weight:bold;color:#8DC63F">This link is only available for widestage administrators.</span><br/><span style="font-weight:bold;">Define here the folder structure for the public area</span><br/><span></span></div>',
                        width: "300px",
                        height: "180px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#myProfileMainMenu',
                        html: '<div><h3>My profile</h3><span style="font-weight:bold;color:#8DC63F">This link is available for all users.</span><br/><span style="font-weight:bold;">Access this to view info about your profile, change your password, etc...</span><br/><span></span></div>',
                        width: "300px",
                        height: "180px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#exploreMainMenu',
                        html: '<div><h3>Explore</h3><span style="font-weight:bold;color:#8DC63F">This link is available for all users that have the grant for explore data.</span><br/><span style="font-weight:bold;">Explore allow users to surf across the data without creating a report for that.</span><br/><span>Use this if you want to query your data but is not necessary for you to save it for a later use</span></div>',
                        width: "300px",
                        height: "200px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#pagesMainMenu',
                        html: '<div><h3>Page reports</h3><span style="font-weight:bold;color:#8DC63F">This link is available for all users that have the grant to create pages.</span><br/><span style="font-weight:bold;">Pages allow users to create and manage report pages.</span><br/><span>Report pages are webpages that can be compromised of data in the form of charts or data grids, along with other HTML elements that allows to customize the report at the highest level</span></div>',
                        width: "300px",
                        height: "250px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#reportsMainMenu',
                        html: '<div><h3>Single query reports</h3><span style="font-weight:bold;color:#8DC63F">This link is available for all users that have the grant to create reports.</span><br/><span style="font-weight:bold;">Reports allow users to create and manage single query reports.</span><br/><span>Single Reports allow the user to configure a query against the data and get the results using different charts or a data grid, single reports are the elements that you use to create a dashboard</span></div>',
                        width: "300px",
                        height: "250px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#dashboardsMainMenu',
                        html: '<div><h3>Single query dashboards</h3><span style="font-weight:bold;color:#8DC63F">This link is available for all users that have the grant to create dashboards.</span><br/><span style="font-weight:bold;">Dashboards allow users to create dashboards using single query reports.</span><br/><span>Dashboards allow the user to group several single query reports in just one interface, when creating dashboards you can define the area, size and position of every single query report into the dashboard</span></div>',
                        width: "300px",
                        height: "250px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#homeMainMenu',
                        html: '<div><h3>Home</h3><span style="font-weight:bold;color:#8DC63F">This link is available for all users.</span><br/><span style="font-weight:bold;">Use this link to back to this page</span><br/><span></span></div>',
                        width: "300px",
                        height: "150px",
                        position: 'right',
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'
                    },
                    {
                        element: '#parentIntro',
                        html: '<div><h3>Next Step</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Setup a data source</span><br/><br/><br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/datasources/intro">Go to data sources and continue tour</a></span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "250px"
                    }
                ]
            }

*/
