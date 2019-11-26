var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var app = angular.module('wice-login', ['ui.router','jm.i18next', 'xwst.directives']).

    config(['$stateProvider','$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");

    }])

    .service('Constants' , function () {

        var constants = {
            DEBUGMODE : false,
            CRYPTO: false,
            SECRET: "SecretPassphrase"
        };

        return constants;
/*
        return {
            mifuncion: function() {
                return true;
            }
        }*/
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
    }])

    .service('connection' , function ($http, Constants) {

    this.get = function(url, params, done, options) {

        $http({method: 'GET', url: url, withCredentials: true,params: params})
            .then(function successCallback(response) { //(angular.bind(this, function (data, status, headers, config) {
                var data = response.data;


                if (typeof done != 'undefined')
                    done(data);

                if (options.showLoader) $('#loader-overlay').hide();

                if (data.result == 1 && data.msg && options.showMsg) {
                    toastr.success(data.msg);
                }
                else if (data.result === 0 && data.msg && options.showMsg) {
                    toastr.error(data.msg);
                }
            }, function errorCallback(response) {
                    if (options.showLoader) $('#loader-overlay').hide();
                    toastr.error('Error',response.status,response.statusText);
            });

};

this.post = function(url, data, done) {
    if (typeof data._id != 'undefined') data.id = data._id;


    $http({
                           method: 'POST',
                           url: url,  /*You URL to post*/
                           data:data, withCredentials: true  /*You data object/class to post*/
                        }).then(function successCallback(response) {
                            //data, status, headers, config
                            var data = response.data;
                           if (typeof data == 'string') window.location.href = '/';

                                if (typeof done != 'undefined')
                                    done(data);

                                $('#loader-overlay').hide();

                                if (data.result == 1 && data.msg) {
                                    //toastr.success(data.msg);
                                }
                                else if (data.result === 0 && data.msg) {
                                    toastr.error(data.msg);
                                }

                        }, function errorCallback(response) {
                           $('#loader-overlay').hide();
                            toastr.error('Error');
            });

};

        return this;
    })

    .controller('PublicCtrl', function ($scope,$http,$rootScope, $sessionStorage, $localStorage, connection) {
        var user = $localStorage.getObject('user');

        $scope.loginError = false;
        $scope.errorLoginMessage = '';
        $scope.currentBox = 'login';

        $scope.login = function() {

            var user = {"userName": $scope.userName, "password": $scope.password, "remember_me": $scope.rememberMe, "companyID": $('#companyID').attr('value'), "companySuffix": $('#host').attr('value')};

            if($scope.userName!==undefined || $scope.password !==undefined)
            {
                $http(
                        {
                           method: 'POST',
                           url: '/api/v3/auth/login',  /*You URL to post*/
                           data:user, withCredentials: true  /*You data object/class to post*/
                        }).then(function successCallback(response) {
                            //data, status, headers, config

                           $scope.loginError = false;

                            var data = response.data;
                            var theUser = data.user;
                            var theCompany = data.company;
                            $sessionStorage.setObject('user', theUser);
                            $sessionStorage.setObject('company', theCompany);
                            $rootScope.loginRedirect();

                        }, function errorCallback(response) {
                           $scope.errorLoginMessage = response.data;
                        $scope.loginError = true;

                    });
            }
        };

        if (user) {
            $scope.userName = user.userName;
            $scope.password = user.password;
            $scope.rememberMe = user.rememberMe;

            $scope.login();
        }
        // added for forgotten password
        $scope.currentpage = "login";
        $scope.ShowLogin = function(){

            $scope.currentpage = "login";
        };

        $scope.showRememberPassword = function(){

            $scope.currentpage = "rememberPassword";
        };

        $scope.rememberPassword = function() {
            $scope.rememberPasswordError = false;
            $scope.rememberPasswordSuccess = false;
            if (!$scope.email) return toastr.error("Email is required.");

            var data = {"email": $scope.email};

            if($scope.email!==undefined){
                $http(
                        {
                           method: 'POST',
                           url: '/api/v3/auth/remember-password',
                           data:data
                        }).then(function successCallback(response) {
                            var data = response.data;
                            if (data.result == 1)
                                {
                                $scope.rememberPasswordSuccess = true;
                                $scope.rememberPasswordSuccessMessage = data.msg;
                                toastr.success(data.msg);
                                //window.location.href = '/login';
                                } else {
                                    $scope.rememberPasswordError = true
                                    $scope.rememberPasswordErrorMessage = data.msg;
                                    toastr.error(data.msg);
                                }
                        }, function errorCallback(response) {
                           var data = response.data;
                           $scope.rememberPasswordError = true
                           $scope.rememberPasswordErrorMessage = data.msg;
                           toastr.error(data.msg);
                    });
            }
        };

        $scope.changePassword = function() {
            var hash = getUrlParameter('h');
            $scope.resetPasswordError = false;
            $scope.resetPasswordErrorMessage = undefined;


            if (!$scope.password || !$scope.confirmation) return toastr.error("New password is required.");
            if ($scope.password != $scope.confirmation) return toastr.error("Passwords do not match.");

            var data = {"hash": hash, "password": $scope.password};
            $http(
                        {
                           method: 'POST',
                           url: '/api/v3/auth/change-password',
                           data:data
                        }).then(function successCallback(response) {
                            var data = response.data;
                            if (data.result == 1)
                                {
                                toastr.success(data.msg);
                                window.location.href = '/login';
                                } else {
                                    $scope.resetPasswordError = true
                                    $scope.resetPasswordErrorMessage = data.msg;
                                    toastr.error(data.msg);
                                }
                        }, function errorCallback(response) {
                           var data = response.data;
                           $scope.resetPasswordError = true
                           $scope.resetPasswordErrorMessage = data.msg;
                           toastr.error(data.msg);
                    });


        };

        $scope.register = function() {
            var user = {
                "userName": $scope.userName,
                "email": $scope.email,
                "password": $scope.password,
                "confirmation": $scope.confirmation,
                "companyID": $('#companyID').attr('value')
            };

            if($scope.userName!==undefined || $scope.password !==undefined){
                if (user.password != user.confirmation) {
                    $scope.errorLoginMessage = "Password and confirm password do not match.";
                    $scope.loginError = true;
                    return;
                }

                $http({method: 'POST', url: '/api/v3/auth/register', data:user, withCredentials: true}).
                    success(function(data, status, headers, config) {

                        $scope.loginError = false;

                        var theUser = data.user;
                        connection.get('/api/v3/auth/get-my-user-data', {}, function(data) {
                            theUser.companyData = data.items.companyData;
                            theUser.rolesData = data.items.rolesData;
                            theUser.reportsCreate = data.items.reportsCreate;
                            theUser.dashboardsCreate = data.items.dashboardsCreate;
                            theUser.pagesCreate = data.items.pagesCreate;
                            theUser.exploreData = data.items.exploreData;
                            theUser.isWSTADMIN = data.items.isWSTADMIN;
                            theUser.contextHelp = data.items.contextHelp;
                            theUser.dialogs = data.items.dialogs;
                            theUser.viewSQL = data.items.viewSQL;
                            $rootScope.user = theUser;
                            $sessionStorage.setObject('user', theUser);
                            $rootScope.loginRedirect();
                        });

                    }).
                    error(function(data, status, headers, config) {
                        $scope.errorLoginMessage = data;
                        $scope.loginError = true;
                    });
            }
        };
    });

    app.controller('acceptInviteCtrl',function($scope,$http,$rootScope, $sessionStorage, $localStorage, connection, $i18next){

        $scope.acceptInvitation = function()
        {
            if ($scope.validateForm())
            {
                        var data = {};
                        data.password = $scope.password;
                        data.repeatPassword = $scope.repeatPassword;
                        data.hash = $scope.hash;
                        connection.post('/api/v3/auth/invite-accepted',data,function(data){
                            if (data.result == 1)
                            {
                                window.location.href = '/';
                            } else {
                                $scope.errorMessage = data.msg;
                            }
                        });
            }

        }

        $scope.validateForm = function()
        {
            var result = false;
            if ($scope.password && $scope.repeatPassword)
            {
                if ($scope.password == $scope.repeatPassword)
                {
                    if (isStrongPwd1($scope.password))
                    {
                        $scope.errorMessage = undefined;
                        result = true;
                    } else {
                        $scope.errorMessage = $i18next.t('Password is too simple, please add minimum 8 characters, at least one upper case letter (A – Z), one lower case letter(a-z), one digit (0 – 9), and one special Characters of !@#$%&*()_-');
                    }
                } else {
                    $scope.errorMessage = $i18next.t('password and repeat do not match');
                }
            } else {
                $scope.errorMessage = $i18next.t('Type a password and repeat');
            }

            return result;
        }

        function isStrongPwd1(password) {
                var regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()_-]).{8,}/;
                var validPassword = regExp.test(password);
                return validPassword;
        }

        function isStrongPwd2(password) {

             var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

             var lowercase = "abcdefghijklmnopqrstuvwxyz";

             var digits = "0123456789";

             var splChars ="!@#$%&*()_-";

             var ucaseFlag = contains(password, uppercase);

             var lcaseFlag = contains(password, lowercase);

             var digitsFlag = contains(password, digits);

             var splCharsFlag = contains(password, splChars);

             if(password.length>=8 && ucaseFlag && lcaseFlag && digitsFlag && splCharsFlag)
                   return true;
             else
                   return false;

          }

        function contains(password, allowedChars) {

            for (i = 0; i < password.length; i++) {

                    var char = password.charAt(i);

                     if (allowedChars.indexOf(char) >= 0) { return true; }

                 }

             return false;
        }
    });

angular.module('wice-login').run(['$http', '$rootScope', '$sce', '$sessionStorage', 'connection',
    function($http, $rootScope, $sce, $sessionStorage, connection) {

    $rootScope.loginRedirect = function() {
        var host = $('#host').attr('value');
        window.location.href="/#/home";
    };

    // Page Loading Overlay
    public_vars.$pageLoadingOverlay = jQuery('.page-loading-overlay');

    jQuery(window).on('load',function()
    {
        public_vars.$pageLoadingOverlay.addClass('loaded');
    })
}]);
