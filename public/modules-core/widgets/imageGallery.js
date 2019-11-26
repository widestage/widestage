app.service('imageGallery', ['$uibModal', function($uibModal) {


      var modalDefaults = {
          backdrop: true,
          keyboard: true,
          modalFade: true,
          templateUrl: '/widgets/views/imageGallery.html'
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

          //Create temp objects to work with since we're in a singleton service

          var tempModalDefaults = {};
          var tempModalOptions = {};

          //Map angular-ui modal custom defaults to modal defaults defined in service
          angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

          //Map modal.html $scope custom properties to defaults defined in service
          angular.extend(tempModalOptions, modalOptions, customModalOptions);

          if (!tempModalDefaults.controller) {
              tempModalDefaults.controller = function ($scope, $uibModalInstance,$rootScope, $i18next,$http,connection) {

                  $scope.modalOptions = tempModalOptions;


                  $scope.searchOnline = function(search) {


                      $http({method: 'GET', url: 'https://api.unsplash.com/search/photos/', params: {
                          client_id: '65d94c5d3440b6da10c6cd390059fd709a1f33ffc8f46f46ed44d6b6c6759559',
                          query: search
                      }}).then(angular.bind(this, function (results, status, headers, config) {
                          var data = results.data;

                          $scope.onlineImages = [];

                          for (var i in data.results) {
                              $scope.onlineImages.push({
                                  url: data.results[i].urls.full,
                                  thumb: data.results[i].urls.thumb
                              });
                          }

                      }))
                      .catch(angular.bind(this, function (data, status, headers, config) {
                          
                      }));

                  };

                  $scope.catalogImages = [];

                  for (var i = 1; i <= 100; ++i) {
                      var image = {};
                      var imgnbr = '';
                      if (i < 10)
                          imgnbr = '0'+i;
                      else
                          imgnbr = i;

                      image.thumb = '/resources/images/tumbnails100/JPEG/photo-'+imgnbr+'_1.jpg';
                      image.source1400 = '/resources/images/width1400/JPEG/photo-'+imgnbr+'_1.jpg';
                      image.source700 = '/resources/images/width700/JPEG/photo-'+imgnbr+'_1.jpg';
                      image.url = '/resources/images/width1400/JPEG/photo-'+imgnbr+'_1.jpg';

                      $scope.catalogImages.push(image);
                  }

                  $scope.onFileSelected = function(file) {
                      $uibModalInstance.close(file.url);
                  };

                  $scope.fileLoaded = function(file, res) {
                          //fileLoaded(res.id, res.data, res.format);
                  };

                  $scope.myImages = [];
                  getMyImages();

                  function getMyImages()
                  {

                    connection.get('/api/files/my-images', {}, function(result) {
                      if (result.result == 1)
                      {
                      $scope.myImages = result.files;
                      }
                    });
                  }


                  $scope.getTranslation = $rootScope.getTranslation;

                  //if ($scope.modalOptions.model)

                  $scope.readonly = $scope.modalOptions.readonly;

                  $scope.modalOptions.ok = function (result) {
                          $uibModalInstance.close($scope.selectedImageUrl);
                  };

                  $scope.modalOptions.close = function (result) {
                      $uibModalInstance.dismiss('cancel');
                  };




              }
          }
          return $uibModal.open(tempModalDefaults).result;
          }
  }]);
