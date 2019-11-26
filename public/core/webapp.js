
'use strict';

//TODO: change ui-bootstrap to the most recent version this affects modal

var app = angular.module('wice', [
  'ui.router', 'ui.bootstrap','ngAnimate','ngSanitize',
  'wice.directives','jm.i18next','bsLoadingOverlay','oc.lazyLoad','angularMoment','thatisuday.dropzone','ngFileUpload',
  'ui.select2','rt.select2','easypiechart','angularUUID2','tg.dynamicDirective','draganddrop','angularjs-gauge','vs-repeat',
  'angular-web-notification', 'btford.socket-io','gg.editableText','ui.sortable',angularDragula(angular),'ui.grid','gridster',
  'perfect_scrollbar','ng-mfb','ui.tree','ui.bootstrap.accordion','ui.bootstrap.datepicker','ui.bootstrap.datepickerPopup','ui.bootstrap.modal'
])//,
    .config(['$stateProvider', '$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider,$locationProvider) {
        $locationProvider.hashPrefix('');
        $urlRouterProvider.otherwise('/home');

    }])
    .config(function(dropzoneOpsProvider){
        	dropzoneOpsProvider.setOptions({
        		url : "/api/files/upload",
        		maxFilesize : '10',
        		paramName: "file",
                maxThumbnailFilesize: 2,
                thumbnailWidth: 150,
                thumbnailHeight: 150
        	});
    })
    .factory('$sessionStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.sessionStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.sessionStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.sessionStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return ($window.sessionStorage[key]) ? JSON.parse($window.sessionStorage[key]) : false;
        },
        removeObject: function(key) {
            delete($window.sessionStorage[key]);
        }
    };
    }])
.factory('$localStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return ($window.localStorage[key]) ? JSON.parse($window.localStorage[key]) : false;
        },
        removeObject: function(key) {
            delete($window.localStorage[key]);
        }
    };
}]);

app.factory('PagerService', PagerService);

app.directive('sizeelement', function ($window) {
    return{
        scope:true,
        priority: 0,
        link: function (scope, element) {
            scope.$watch(function(){return $(element).height(); }, function(newValue, oldValue) {
                scope.height=$(element).height();
            });
        }}
});

app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});

app.directive('copyToClipboard', function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.click(function () {
                    if (attrs.copyToClipboard) {
                        var $temp_input = $("<input>");
                        $("body").append($temp_input);
                        $temp_input.val(attrs.copyToClipboard).select();
                        document.execCommand("copy");
                        $temp_input.remove();
                    }
                });
            }
        };
    });





app.run(['$rootScope', '$sessionStorage','connection','$i18next','$sce','$timeout', function($rootScope, $sessionStorage, connection,$i18next,$sce,$timeout) {
    // Page Loading Overlay

    public_vars.$pageLoadingOverlay = jQuery('.page-loading-overlay');

     $(window).ready(function () {
          public_vars.$pageLoadingOverlay.addClass('loaded');
     });



    $rootScope.removeFromArray = function(array, item) {
        var index = array.indexOf(item);

        if (index > -1) array.splice(index, 1);
    };

    $rootScope.goBack = function() {
        window.history.back();
    };

    $rootScope.getUserContextHelp = function(contextHelpName)
    {
        var found = false;

        if ($rootScope.user.contextHelp)
            {
                for (var i in $rootScope.user.contextHelp)
                    {
                        if ($rootScope.user.contextHelp[i] == contextHelpName)
                            {
                                found = true;
                            }
                    }
            }

        return !found;
    }

    $rootScope.setUserContextHelpViewed = function(contextHelpName)
    {
        var params = (params) ? params : {};
        params.contextHelpName = contextHelpName;
        connection.get('/api/set-viewed-context-help', params, function(data) {
            $rootScope.user.contextHelp = data.items;
        });

    }

    $rootScope.clone = function(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    function checkCompanyData() {
        //TODO: disabled only applicable for the SaaS version in multicompany version
        /*
        if (!$rootScope.user.companyData.name || !$rootScope.user.companyData.language || !$rootScope.user.companyData.subdomain) {
            window.location.hash = '#/companies/setup?error=required-data';
        }
        */
    }

    $rootScope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams){
            checkCompanyData();
    });

    $rootScope.isModuleInstalled = function(module)
    {
        var result = false;
        if ($rootScope.user)
            if ($rootScope.user.installedModules)
            {
                if ($rootScope.user.installedModules.indexOf(module) > -1)
                {
                   result = true;
                }
            }
    return result;

    }

    $rootScope.hideSidebar = function()
    {
        if ($('#sidebar-menu').hasClass('hidden'))
        {
            $('#sidebar-menu').removeClass('hidden');
        } else {
            $('#sidebar-menu').addClass('hidden');
        }
    }

    $rootScope.changeLng = function (lng) {
          connection.get('/api/v3/auth/change-language/'+lng, {}, function(data) {
              $i18next.changeLanguage(lng);
  		    $rootScope.user.language = lng;
  		    console.log('changed language',lng)
          }, {showMsg: false});
    };

  	$rootScope.$on('i18nextLanguageChange', function () {
  		if (!$rootScope.i18nextReady) {
  			$timeout(function () {
  				$rootScope.i18nextReady = true;
  			}, 500);
  		}
  	});

    $rootScope.getTranslation = function(string)
    {
        var translated = $i18next.t(string);
        if (translated === 'No, this is Patrick!')
            return string
        else
            return translated;
    }

    $rootScope.isAllowed = function(functionality)
    {
        var result = false;
        if ($rootScope.user && $rootScope.user.company)
            result = $rootScope.user.company.licenseInfo.modules[functionality].enabled;
        return result;
    }

    $rootScope.checkRole = function(roles) {
        var user = $sessionStorage.getObject('user');

        if (typeof roles == 'string') roles = [roles];

        if (user && user.roles)
            for (var i in roles) {
                var role = roles[i];

                if (user.roles.indexOf(role) > -1){
                    return true;
                }
            }
        return false;
    };

    $rootScope.isGranted = function(module,permission)
    {
        var result = false;
        if ($rootScope.user)
        {
            for (var p in $rootScope.user.permissions)
            {
                if ($rootScope.user.permissions[p].module == module && $rootScope.user.permissions[p].name == permission)
                    {
                    result = $rootScope.user.permissions[p].granted;
                    }
            }
        }
        return result;
    }

    $rootScope.bindHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    $rootScope.showLoader = function() {
        $('#loader-overlay').show();
    };
    $rootScope.hideLoader = function() {
        $('#loader-overlay').hide();
    };

    connection.get('/api/v3/auth/get-my-user-data', {}, function(data) {
            if (data.result === 1 && data.items && data.items.user)
               {
                        var theUser = data.items.user;
                        $rootScope.user = theUser;

                        $i18next.changeLanguage(theUser.language);
                        connection.get('/api/v3/auth/get-my-company-data', {}, function(data2) {
                            if (data2.result === 1 && data2.item)
                            {
                                $rootScope.user.company = data2.item;
                                if ($rootScope.user.company.customization && $rootScope.user.company.customization.defaultInitPage)
                                    {
                                        if ($rootScope.user.company.customization.defaultInitPage == 'stream')
                                        {
                                            $rootScope.defaultInitPage == 'stream';
                                            //return window.location.href="#/streamV3";
                                            //$location.path( "/streamV3" );
                                        }
                                    }
                            }
                        });

               } else {
                   return window.location.href="/login";
               }
            checkCompanyData();
        });


        $rootScope.IntroOptions = {
                    showStepNumbers: false,
                    exitOnOverlayClick: true,
                    exitOnEsc:true,
                    nextLabel: '<strong>Next</strong>',
                    prevLabel: '<span style="color:green">Previous</span>',
                    skipLabel: 'Exit',
                    doneLabel: 'Thanks',
                    scrollToElement: true
                };


}]);


app.run(function (bsLoadingOverlayService) {
  bsLoadingOverlayService.setGlobalConfig({
    delay: 0, // Minimal delay to hide loading overlay in ms.
    activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
    templateUrl: 'home/views/loading-overlay-template.html' // Template url for overlay element. If not specified - no overlay element is created.
  });
});


app.filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '0 MB';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
});

function isSUPERUSER($rootScope)
{
    var found = false;
    for (var i in $rootScope.user.roles)
    {
        if ($rootScope.user.roles[i] == 'SUPERUSER')
            found = true;
    }

    return found;
}


function PagerService() {
    // service definition
    var service = {};

    service.GetPager = GetPager;

    return service;

    // service implementation
    function GetPager(totalItems, currentPage, pageSize, totalPages) {
        // default to first page
        currentPage = currentPage || 1;

        // default page size is 10
        pageSize = pageSize || 10;

        // calculate total pages
        //totalPages = totalPages Math.ceil(totalItems / pageSize);

        var startPage, endPage;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        //var pages = range(startPage, endPage + 1,1);

        var pages = [];
        var i = startPage;
        while (i < endPage +1) {
            pages.push(i);
            i++;
            }

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
}
