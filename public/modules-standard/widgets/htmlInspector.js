app.factory('textStyles', function(){
	return {
		fontSizes: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
		fontWeights: [100, 200, 300, 400, 500, 600, 700, 800, 900, 'bold', 'bolder', 'light', 'lighter', 'normal'],
		baseFonts: [
			{name: 'Impact', css: 'Impact, Charcoal, sans-serif'},
			{name: 'Comic Sans', css: '"Comic Sans MS", cursive, sans-serif'},
			{name: 'Arial Black', css: '"Arial Black", Gadget, sans-serif'},
			{name: 'Century Gothic', css: 'Century Gothic, sans-serif'},
			{name: 'Courier New', css: '"Courier New", Courier, monospace'},
			{name: 'Lucida Sans', css: '"Lucida Sans Unicode", "Lucida Grande", sans-serif'},
			{name: 'Times New Roman', css: '"Times New Roman", Times, serif'},
			{name: 'Lucida Console', css: '"Lucida Console", Monaco, monospace'},
			{name: 'Andele Mono', css: '"Andele Mono", monospace, sans-serif'},
			{name: 'Verdana', css: 'Verdana, Geneva, sans-serif'},
			{name: 'Helvetica Neue', css: '"Helvetica Neue", Helvetica, Arial, sans-serif'},
      {name: 'Open Sans', css:'"Open Sans", Helvetica, Arial, sans-serif'}
		]
	};
})




app.directive('htmlInspector', function($compile,$rootScope,imageGallery,textStyles) {
return {
    transclude: true,
    scope: {
        properties: '=',
        element: '=',
        onChange: '='
    },

    templateUrl: "widgets/views/htmlInspector.html",

    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {

      $scope.borderStyles = [
        {value:'dotted',name:'dotted'},
        {value:'dashed',name:'dashed'},
        {value:'solid',name:'solid'},
        {value:'double',name:'double'},
        {value:'ridge',name:'ridge'},
        {value:'inset',name:'inset'},
        {value:'outset',name:'outset'},
        {value:'none',name:'none'},
        {value:'hidden',name:'hidden'}
      ]

      $scope.getTranslation = $rootScope.getTranslation;

      if (!$scope.properties)
          $scope.properties = {};
      if (!$scope.properties)
          $scope.properties.css = {};

      $scope.$watch('properties', function(val,old){

        if ($scope.properties & !$scope.properties.css)
                  $scope.properties.css = {};
      });

      $scope.changed = function(property,str)
      {
        if (!str)
            str = '';

        var cssProperty = property.replace(/_/g,'-');

        if ($scope.properties.css)
        {
          if ($scope.element)
          {
              $scope.element.css(cssProperty,$scope.properties.css[property]+str);
          }
          if ($scope.onChange)
              $scope.onChange(property,$scope.properties.css[property])
        }
      }


      $scope.canEdit = function()
      {
        return true;
      }


      $scope.openImageGallery = function(target) {
          imageGallery.showModal({size:'lg',backdrop:true}, {readonly:false}).then(function (imageUrl) {
                $scope.properties.css['background_image'] = imageUrl;
                $scope.element.css({'background-image':"url('"+imageUrl+"')",'background-size' : 'cover'});
          });
      };


			function getInitialProperties()
			{
				$scope.properties.css['background_image'] = $scope.element.css('background-image');
			}


    }

  }
});


/*
$scope.properties.image = node.css('background-image');
    $('#image').css('background-image',$scope.properties.image);
    $('#gradient').css('background-image','none');
$scope.properties.color = node.css('background-color');
    $('#fill-color').css('background-color',$scope.properties.color);
$scope.inspector.styles.text.color = node.css('color');
$scope.inspector.styles.text.fontSize = node.css('font-size');
$scope.inspector.styles.text.textAlign = node.css('text-align');
$scope.inspector.styles.text.fontStyle = node.css('font-style');
$scope.inspector.styles.text.fontFamily = node.css('font-family');
$scope.inspector.styles.text.lineHeight = node.css('line-height');
$scope.inspector.styles.text.fontWeight = node.css('font-weight');
$scope.inspector.styles.text.textDecoration = node.css('text-decoration');
$scope.inspector.styles.border.border = node.css('text-decoration');
$scope.inspector.styles.height = node.css('height');
$scope.inspector.styles.padding.top = node.css('padding-top');
$scope.inspector.styles.padding.left = node.css('padding-left');
$scope.inspector.styles.padding.right = node.css('padding-right');
$scope.inspector.styles.padding.bottom = node.css('padding-bottom');
  if ($scope.inspector.styles.padding.top == $scope.inspector.styles.padding.left && $scope.inspector.styles.padding.top == $scope.inspector.styles.padding.right && $scope.inspector.styles.padding.top == $scope.inspector.styles.padding.bottom)
    $scope.paddingAll = $scope.inspector.styles.padding.top;
    else {
    $scope.paddingAll = '';
    }
$scope.inspector.styles.margin.top = node.css('margin-top');
$scope.inspector.styles.margin.left = node.css('margin-left');
$scope.inspector.styles.margin.right = node.css('margin-right');
$scope.inspector.styles.margin.bottom = node.css('margin-bottom');
  if ($scope.inspector.styles.margin.top == $scope.inspector.styles.margin.left && $scope.inspector.styles.margin.top == $scope.inspector.styles.margin.right && $scope.inspector.styles.margin.top == $scope.inspector.styles.margin.bottom)
    $scope.marginAll = $scope.inspector.styles.margin.top;
    else {
    $scope.marginAll = '';
    }
$scope.inspector.styles.border.top = node.css('border-top-width');
$scope.inspector.styles.border.left = node.css('border-left-width');
$scope.inspector.styles.border.right = node.css('border-right-width');
$scope.inspector.styles.border.bottom = node.css('border-bottom-width');
  if ($scope.inspector.styles.border.top == $scope.inspector.styles.border.left && $scope.inspector.styles.border.top == $scope.inspector.styles.border.right && $scope.inspector.styles.border.top == $scope.inspector.styles.border.bottom)
    $scope.borderAll = $scope.inspector.styles.border.top;
    else {
    $scope.borderAll = '';
    }
$scope.inspector.styles.border.color = node.css('border-color');
    $('#border-color').css('border-color',$scope.inspector.styles.border.color);
$scope.inspector.styles.border.style = node.css('border-style');

$scope.inspector.styles.border.radiusTopLeft = node.css('border-top-left-radius');
$scope.inspector.styles.border.radiusTopRight = node.css('border-top-right-radius');
$scope.inspector.styles.border.radiusBottomLeft = node.css('border-bottom-left-radius');
$scope.inspector.styles.border.radiusBottomRight = node.css('border-bottom-right-radius');
  if ($scope.inspector.styles.border.radiusTopLeft == $scope.inspector.styles.border.radiusTopRight && $scope.inspector.styles.border.radiusTopLeft == $scope.inspector.styles.border.radiusBottomLeft && $scope.inspector.styles.border.radiusTopLeft == $scope.inspector.styles.border.radiusBottomRight)
    $scope.inspector.styles.border.radius = $scope.inspector.styles.border.radiusTopLeft;
    else {
    $scope.inspector.styles.border.radius = '';
    }
*/
