app.directive('ndDropZone', function($rootScope) {
    function link(scope, element, attrs) {
        var url = scope.url;
        var success = scope.success;

        element.children('.dropzone').dropzone({
            url: url,
            maxFilesize: 5,
            paramName: "file",
            maxThumbnailFilesize: 2,
            dictDefaultMessage: $rootScope.getTranslation("<b>Drop files</b> or click here to upload"),
            init: function() {
                //scope.files.push({file: 'added'}); // here works
                this.on('success', function(file, res) {
                    if (typeof res.result !== 'undefined' && res.result === 0) {
                        if (typeof toastr !==  'undefined') toastr.error($rootScope.getTranslation(res.msg), false, {"closeButton": true, "timeOut": "2000"});
                        else noty({text: $rootScope.getTranslation(res.msg),  timeout: 2000, type: 'error'});
                    }
                    else {
                        if (success) success(file, res);
                    }
                });

                this.on('error', function(file, res) {
                    if (typeof res.result !== 'undefined' && res.result === 0) {
                        if (typeof toastr !==  'undefined') toastr.error($rootScope.getTranslation(res.msg), false, {"closeButton": true, "timeOut": "2000"});
                        else noty({text: $rootScope.getTranslation(res.msg),  timeout: 2000, type: 'error'});
                    }
                });

                this.on('addedfile', function(file) {

                });

                this.on('drop', function(file) {
                    
                });
            }
        });

        //$('div.dz-default.dz-message > span').css({'display': 'block', 'font-size': '28px'});
        //$('div.dz-default.dz-message').css({'opacity':1, 'background-image': 'none'});
    }

    return {
        restrict: 'E',
        scope: {
            url: "@",
            success: "="
        },
        template: '<form class="dropzone" id="file-dropzone"></form>',
        link: link
    };

});
