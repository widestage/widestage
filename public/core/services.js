/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 04/06/15
 * Time: 15:28
 * To change this template use File | Settings | File Templates.
 */
angular.module('myApp.services', []).
    value('version', '0.1');

app.service('Constants' , function () {

    var constants = {
        DEBUGMODE : false,
        CRYPTO: false,
        SECRET: "SecretPassphrase"
    };

    return constants;
})

.service('connection' , function ($http, Constants) {

            //this is to eliminate cache... specially for IE11
        $http.defaults.headers.get =
         {
            'If-Modified-Since': '0',
            "Pragma": "no-cache",
            "Expires": -1,
            "Cache-Control": "no-cache, no-store, must-revalidate"
         }


    this.get = function(url, params, done, options) {
        options = {
            showLoader: (options && typeof options.showLoader != 'undefined') ? options.showLoader : true,
            showMsg: (options && typeof options.showMsg != 'undefined') ? options.showMsg : true
        };

        if (options.showLoader) $('#loader-overlay').show();

        if (Constants.CRYPTO) {
            var encrypted = CryptoJS.AES.encrypt(JSON.stringify(params), Constants.SECRET);
            params = {data: String(encrypted)};
        }

        $http({method: 'GET', url: url, withCredentials: true,params: params})
            .then(function successCallback(response) { //(angular.bind(this, function (data, status, headers, config) {
                var data = response.data;


                if (Constants.CRYPTO) {
                    var decrypted = CryptoJS.AES.decrypt(data.data, Constants.SECRET);
                    data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
                }

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

    $('#loader-overlay').show();

    if (Constants.CRYPTO) {
        var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), Constants.SECRET);
        data = {data: String(encrypted)};
    }

    $http({
                           method: 'POST',
                           url: url,  /*You URL to post*/
                           data:data, withCredentials: true  /*You data object/class to post*/
                        }).then(function successCallback(response) {
                            //data, status, headers, config
                            var data = response.data;
                           if (typeof data == 'string') window.location.href = '/';
                                if (Constants.CRYPTO) {
                                    var decrypted = CryptoJS.AES.decrypt(data.data, Constants.SECRET);
                                    data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
                                }

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


this.downloadFile = function (url, data, filename,done) {

    //$http({method: 'GET', url: url, withCredentials: true,params: data,responseType: 'arraybuffer'})
    $http({
                           method: 'POST',
                           url: url,  /*You URL to post*/
                           data:data, withCredentials: true,  /*You data object/class to post*/
                           responseType: 'arraybuffer'
                        })
            .then(function successCallback(response) { //(angular.bind(this, function (data, status, headers, config) {
                var data = response.data;
                var headers = response.headers;

                var contentType = headers['content-type'];

                var linkElement = document.createElement('a');

                try {

                    var blob = new Blob([data], { type: contentType });

                    var url = window.URL.createObjectURL(blob);



                    linkElement.setAttribute('href', url);

                    linkElement.setAttribute("download", filename);



                    var clickEvent = new MouseEvent("click", {

                        "view": window,

                        "bubbles": true,

                        "cancelable": false

                    });

                    linkElement.dispatchEvent(clickEvent);
                    done();

                } catch (ex) {
                    done(ex);
                    console.log(ex);

                }


            }, function errorCallback(response) {
                    //if (options.showLoader) $('#loader-overlay').hide();
                    toastr.error('Error',response.status,response.statusText);
            });

};

function parseFilenameFromContentDisposition(contentDisposition) {
    if (!contentDisposition) return null;
    let matches = /filename="(.*?)"/g.exec(contentDisposition);

    return matches && matches.length > 1 ? matches[1] : null;
}

return this;
});

app.service('Inspector' , function () {

    this.element = null;
    this.onElementChangeListeners = [];

    this.setElement = function(element) {
        this.element = element;

        for (var i in this.onElementChangeListeners) {
            this.onElementChangeListeners[i](this.element);
        }
    };

    this.onElementChange = function(handler) {
        this.onElementChangeListeners.push(handler);
    };

    return this;

});


app.service('userSettings', function($rootScope,connection) {

    this.setUserSetting = function(parameter,value) {
        var theSettings = $rootScope.user.userSettings;
        if (!theSettings)
            theSettings = {};

        theSettings[parameter] = value;
        connection.post('/api/users/set-user-settings', theSettings, function(data) {
            if (data.result == 1) {
                //toastr.success("User Settings updated");
            } else {
                toastr.error("Error updating user settings");
            }
        });

    }

    this.getUserSetting = function(parameter)
    {
        if ($rootScope.user.userSettings)
        {
            var theValue = $rootScope.user.userSettings[parameter];
            return theValue;

        } else
            return undefined;


    }

});

app.service('confirmModal', ['$uibModal', function($uibModal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        template: //'<div>'
                    '<div class="modal-header">'
                                +'    <button type="button" class="close" ng-click="modalOptions.close()" aria-hidden="true">&times;</button>'
                                +'    <h4 class="modal-title" id="myModalLabel" ng-bind="title"></h4>'
                    +'</div>'
                    +'<div class="modal-body">'
                        +'<strong ng-bind="body"></strong>'
                    +'</div>'
                    +'<br/>'
                    +'<br/>'
                        +'<div class="form-group" ng-if="typeNeeded">'
                            +'<label ng-bind="typeLabel"></label>'
                            +'<input name="reportName" type="text" class="form-control" ng-model="modalOptions.deleteString" ng-required="true" required >'
                            +'<span ng-show="modalOptions.deleteString != typeWord" class="help-inline" ng-i18next="Required"></span>'
                        +'</div>'
                    +'<div class="modal-footer">'
                        +'<button type="button" class="btn btn-default" ng-click="modalOptions.close()" ng-i18next="Cancel"></button>'
                        +'<a ng-click="modalOptions.ok()" class="btn btn-danger" ng-disabled="typeNeeded && modalOptions.deleteString != typeWord" ng-i18next="Yes"></a>'
                    +'</div>'
                //+'</div>'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show( customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service

        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope) {

                $scope.modalOptions = tempModalOptions;

                $scope._object = $scope.modalOptions.object;

                $scope.title = $scope.modalOptions.title;
                $scope.body = $scope.modalOptions.body;
                $scope.typeNeeded = $scope.modalOptions.typeNeeded;
                $scope.typeLabel = $scope.modalOptions.typeLabel;
                $scope.typeWord = $scope.modalOptions.typeWord;


                $scope.getTranslation = function(text)
                {
                    $rootScope.getTranslation(text);
                }


                $scope.modalOptions.ok = function (result) {
                        $uibModalInstance.close(result);
                };

                $scope.modalOptions.close = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };


            }
        }
        return $uibModal.open(tempModalDefaults).result;
    };

}]);
