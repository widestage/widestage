/*
<html-editor ng-model="_Content.htmlContent" on-change="htmlChanged" style="min-height:300px;"></html-editor>
*/

'use strict';

app.directive('htmlEditor', function($compile) {
return {
    transclude: true,
    scope: {
        onChange: '=',
        ngModel: '='
    },

   template: '<div class="container-fluid wice-html-editor"><div id="toolbar"></div></div>',
    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {
        var editorElem;

        var tb = [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          ['blockquote', 'code-block'],

          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction

          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'font': [] }],
          [{ 'align': [] }],

          ['clean'],                                         // remove formatting button

          ['link', 'image', 'video']                         // link and image, video
        ];



        var options = {
                modules: {
                  formula: false,
                  syntax: false,
                  toolbar: tb
                },
                placeholder: 'Compose an epic...',
                theme: 'snow'
            };

        var $editorElem = angular.element('<div></div>')
        editorElem = $editorElem[0];
        var container = element.children();
        container.append($editorElem)

        var editor = new Quill(editorElem, options);

        editor.on('text-change', function() {
          var text = editor.getText();
          var html = editorElem.children[0].innerHTML;
          $scope.ngModel = html;
          if ($scope.onChange)
             $scope.onChange(html);
        });

        $scope.$watch('ngModel', function(){
          if ($scope.ngModel != undefined)
                editorElem.children[0].innerHTML = $scope.ngModel;

      });

    }
}
});
