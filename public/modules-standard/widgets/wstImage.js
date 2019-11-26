'use strict';

app.directive('wstImage', function($compile) {
return {
    transclude: true,
    scope: {
        onChange: '=',
        ngModel: '='
    },

   templateUrl: "widgets/views/wstImage.html",

    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {
        switch (attrs['type']) {
            case "text":
                // append input field to "template"
            case "select":
                // append select dropdown to "template"
        }

    //$scope.images = images.images;

    $scope.$watch('ngModel', function(){
          $scope.selectedImage = $scope.ngModel;
      });

     $scope.changeImage = function(image)
     {
         $scope.selectedImage = image;
         $scope.ngModel = image;
     }

     $scope.changeInput = function()
     {
         $scope.ngModel = $scope.selectedImage;
     }

     $scope.clearImage = function()
     {
        $scope.ngModel = 'none';
        $scope.selectedImage = 'none';

     }

     getCatalogImages();

     function getCatalogImages()
    {
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
    }

    $scope.changeBackgroundImage = function(backgroundImage)
    {
            var theElement = $scope.selectedElement;
            theElement.css({ 'background-image': "url('"+backgroundImage.source1400+"')" });
            theElement.css({ '-webkit-background-size': 'cover'});
            theElement.css({ '-moz-background-size': 'cover'});
            theElement.css({ '-o-background-size': 'cover'});
            theElement.css({ 'background-size': 'cover'});


        if ($scope.selectedElementType == 'page')
            $scope.selectedDashboard.backgroundImage = backgroundImage.source1400;



    }



     // $scope.$watch('element', function(){

    }
}
});
