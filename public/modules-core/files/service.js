app.service('fileService' , function ($http, $rootScope, Upload) {

    this.upload = function(file, done) {
                if (file) {
                    $rootScope.showLoader();
                    Upload.upload({
                            url: '/api/files/upload', //to upload just one file at a time
                            data: {file: file}
                        }).then(function (resp) {
                            $rootScope.hideLoader();
                            done(resp.data.file.url);
                        }, function (resp) {
                            $rootScope.hideLoader();
                            done(false);
                        }, function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);

                        });
                    
                }
            };


});
