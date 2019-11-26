var fileFormat, currentTargetElement, autoSubmit;

app.controller('filesModalCtrl', function ($scope, connection, $uibModalInstance, $http) {
    $scope.modalOptions = {
        ok: function (result) {
            $uibModalInstance.close(result);
        },
        close: function (result) {
            $uibModalInstance.dismiss('cancel');
        }
    };

    connection.get('/api/files/get-files', {format: fileFormat}, function(data) {
        $scope.files = data.files;
    });

    $scope.onFileSelected = function(file) {
        if (typeof currentTargetElement == 'function') {
            currentTargetElement(file.url);
        }
        else {
            $('#'+currentTargetElement).val(file.url);
            $('#'+currentTargetElement).trigger('input');
        }

        $uibModalInstance.dismiss('cancel');
    };

    $scope.onTumbnailSelected = function(file) {
        if (typeof currentTargetElement == 'function') {
            currentTargetElement(file.source1400);
        }
        else {
            $('#'+currentTargetElement).val(file.source1400);
            $('#'+currentTargetElement).trigger('input');
        }

        $uibModalInstance.dismiss('cancel');
    };

    $scope.setDropzone = function() {


        $('#dropzone').dropzone({
            url: "/api/files/upload",
            maxFilesize: 2,
            paramName: "file",
            maxThumbnailFilesize: 2,
            thumbnailWidth: 150,
            thumbnailHeight: 150,
            dictDefaultMessage: "Drop files or click here to upload",
            acceptedFiles: (fileFormat) ? "image/"+fileFormat : "image/*",
            previewTemplate: $('#dropzone-item').html(),
            init: function() {
                this.on("addedfile", function(file) {
                    $('.files-loader-overlay').show();

                    $(file.previewElement).remove();

                    if (fileFormat) {
                        if (file.type == 'image/'+fileFormat) {
                            $('#file-list').prepend($(file.previewElement));
                        }
                        else {
                            $(file.previewElement).remove();
                            noty({text: 'Invalid file format',  timeout: 2000, type: 'error'});
                        }
                    }
                    else {
                        $('#file-list').prepend($(file.previewElement));
                    }
                });
            },
            success: function(file, res) {
                $('.files-loader-overlay').hide();

                if (typeof res == 'string' && String(res).indexOf(")]}',") > -1) {
                    res = angular.fromJson(String(res).replace(")]}',", ""));
                }
                $(file.previewElement).children('a').children('.dz-loading').hide();

                if(res.result === 0){
                    $(file.previewElement).children('a').children('.label-danger').show();
                }
                else {
                    $(file.previewElement).remove();

                    var thisFile = res.file;

                    thisFile.loaded = true;

                    $scope.$apply(function () {
                        $scope.files.unshift(thisFile);
                    });

                    if (autoSubmit) {
                        $scope.onFileSelected(thisFile);
                    }
                }
            }
        });
    }

    $scope.searchOnline = function(search) {


        $http({method: 'GET', url: 'https://api.unsplash.com/search/photos/', params: {
            client_id: '65d94c5d3440b6da10c6cd390059fd709a1f33ffc8f46f46ed44d6b6c6759559',
            query: search
        }}).success(angular.bind(this, function (data, status, headers, config) {

            $scope.onlineImages = [];

            for (var i in data.results) {
                $scope.onlineImages.push({
                    url: data.results[i].urls.full,
                    thumb: data.results[i].urls.thumb
                });
            }
        }))
        .error(angular.bind(this, function (data, status, headers, config) {

        }));

    };

        //https://api.unsplash.com/search/photos/?client_id=65d94c5d3440b6da10c6cd390059fd709a1f33ffc8f46f46ed44d6b6c6759559&query=office

    $scope.catalogImages = [];

    for (var i = 1; i <= 100; ++i) {
        var image = {};
        var imgnbr = '';
        if (i < 10)
            imgnbr = '0'+i;
        else
            imgnbr = i;

        image.url = '/resources/images/tumbnails100/JPEG/photo-'+imgnbr+'_1.jpg';
        image.source1400 = '/resources/images/width1400/JPEG/photo-'+imgnbr+'_1.jpg';
        image.source700 = '/resources/images/width700/JPEG/photo-'+imgnbr+'_1.jpg';

        $scope.catalogImages.push(image);
    }
});

app.controller('filesCtrl', function ($scope, connection, $stateParams, $q, $rootScope, $uibModal) {
    var form, gallery, filePreview;

    $scope.data = null;

    $rootScope.openGallery = function(targetElement, format) {
          currentTargetElement = targetElement;

        $scope.extensionMSG = false;

        connection.get('/api/files/get-files', {format: format}, function(data) {
            var files = data.files;

            form = $('#'+targetElement).closest("form");

            $.ajax({
                url: 'files/views/gallery.html',
                dataType: 'html',
                success: function(html) {
                    gallery = $(html);

                    var filesList = gallery.children('#file-list');

                    for (var i in files) {
                        var fileLi = $('<li></li>');
                        var fileLink = $('<a class="hand-cursor file-selection"></a>');
                        var fileImg = $('<img class="dz-image" alt="'+files[i].description+'" src="'+files[i].url+'"></img>');

                        fileLink.append(fileImg);
                        fileLi.append(fileLink);
                        filesList.append(fileLi);
                    }

                    form.hide();

                    form.after(gallery);

                    onNewFiles();

                    $('#close-gallery-btn').click(function() {
                        closeGallery();
                    });

                    if (format) {
                        $('#extensionMSG').html($scope.getTranslation('Only the following extensions are allowed: ')+' '+String(format).toUpperCase());
                    }

                    setDropzone(onNewFiles, format);

                    function uploadComplete(evt) {
                        var res = JSON.parse(evt.target.responseText);

                        filePreview.find('.dz-loading').hide();

                        if(res.result === 0){
                            filePreview.find('.label-danger').show();
                        }
                        else {
                            filePreview.find('.label-success').show();

                            filePreview.find('.dz-image').attr('src', res.file.url);
                        }

                        onNewFiles();
                    }

                    function uploadFailed(evt) {
                        console.log("There was an error attempting to upload the file.");
                    }

                    var dropZone = document.getElementById('file-list');

                    // Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
                    dropZone.addEventListener('dragover', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                    });

                    // Get file data on drop
                    dropZone.addEventListener('drop', function(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        filePreview = $('<li></li>');

                        var fileImg = $('<a class="hand-cursor file-selection"></a>');

                        fileImg.append('<img src="/images/loading.gif" class="dz-loading" />');
                        fileImg.append('<span class="label label-danger dz-label" style="display: none;">error</span>');
                        fileImg.append('<span class="label label-success dz-label" style="display: none;">success</span>');
                        fileImg.append('<img class="dz-image" data-dz-thumbnail />');

                        filePreview.append(fileImg);

                        $('#file-list').prepend(filePreview);

                        var fd = new FormData();
                        fd.append("file", e.dataTransfer.files[0]);
                        var xhr = new XMLHttpRequest();

                        xhr.addEventListener("load", uploadComplete, false);
                        xhr.addEventListener("error", uploadFailed, false);
                        xhr.open("POST", "/api/files/upload");
                        xhr.send(fd);
                    });
                }
            });
        });
    };

    $rootScope.openGalleryModal = function(targetElement, params) {
        currentTargetElement = targetElement;
        fileFormat = (params && params.format) ? params.format : null;
        autoSubmit = (params && params.autoSubmit) ? params.autoSubmit : false;

        $scope.extensionMSG = false;

        $uibModal.open({
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: 'files/views/galleryModal.html',
            windowClass: "in files-modal-window",
            controller: 'filesModalCtrl'
        });
    };

    function closeGallery() {
        gallery.remove();

        form.show();
    }

    function onNewFiles() {
        $('.file-selection').click(function() {
            closeGallery();

            if (typeof currentTargetElement == 'function') {
                currentTargetElement($(this).children('.dz-image').attr('src'));
            }
            else {
                if (currentTargetElement == 'wysiwyg-editor')
                    tinyMCE.activeEditor.execCommand('mceInsertContent', false, '<img src="'+$(this).children('.dz-image').attr('src')+'" style="width: 150px; height: 150px;"></img>');
                else {
                    $('#'+currentTargetElement).val($(this).children('.dz-image').attr('src'));
                    $('#'+currentTargetElement).trigger('input');
                }
            }
        });
    }

    /* DROPZONE */
    function setDropzone(onNewFiles, format) {
        $('#dropzone').dropzone({
            url: "/api/files/upload",
            maxFilesize: 2,
            paramName: "file",
            maxThumbnailFilesize: 2,
            thumbnailWidth: 150,
            thumbnailHeight: 150,
            dictDefaultMessage: "Drop files or click here to upload",
            acceptedFiles: (format) ? "image/"+format : "image/*",
            previewTemplate: $('#dropzone-item').html(),
            init: function() {
                this.on("addedfile", function(file) {
                    if (format) {
                        if (file.type == 'image/'+format) {
                            $('#file-list').prepend($(file.previewElement));
                        }
                        else {
                            $(file.previewElement).remove();
                            noty({text: 'Invalid file format',  timeout: 2000, type: 'error'});
                        }
                    }
                    else {
                        $('#file-list').prepend($(file.previewElement));
                    }
                });
            },
            success: function(file, res) {
                if (typeof res == 'string' && String(res).indexOf(")]}',") > -1) {
                    res = angular.fromJson(String(res).replace(")]}',", ""));
                }

                $(file.previewElement).children('a').children('.dz-loading').hide();

                if(res.result === 0){
                    $(file.previewElement).children('a').children('.label-danger').show();
                }
                else {
                    $(file.previewElement).children('a').children('.label-success').show();

                    $(file.previewElement).children('a').children('.dz-image').attr('src', res.file.url);
                }

                onNewFiles();
            }
        });
    }
});

var init = function () {
    $('body').append('<div class="hidden" id="files-controller" ng-controller="filesCtrl"></div>');
};

init();
