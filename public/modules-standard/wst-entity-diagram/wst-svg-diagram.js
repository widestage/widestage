// http://embed.plnkr.co/fXT0kZcRwJTPb7wQVHpg/
// https://editor.method.ac/

(function() {
  SvgDirective.$inject = ['SvgService'];
  function SvgDirective(SvgService) {
    function SvgDirectiveLink(scope, elem, attrs) {
      // selecting svg elements via d3js
      var mainSvg = d3.select(elem);
      var controlsGroup = d3.select('g.controls-group');
      var topLeftRotateHandleElem = controlsGroup.select('circle.rotate-tl');

      var blueCenterCircle = d3.select('circle.blue-center-circle');

      // when the directive is binded, stores the original
      // coordinates of the image to be used as validation
      // by the resize function
      var originalCoordinates = SvgService.getImageUpdatedCoordinates();
      // sets the minimun values for width and height to be of 10% of the original
      // dimensions, to avoid negative values
      var minWidth = 0.1 * originalCoordinates.width;
      var minHeight = 0.1 * originalCoordinates.height;

      // transform position, used to move the object around with the drag and drop
      var tPos = SvgService.getImageUpdatedTranslateCoordinates();

      var elemCenter = getElementCenter();
      SvgService.updateImageRotateCoordinates(null, elemCenter.x, elemCenter.y);

      // do the bind of the drag behavior in the controls elements
      controlsGroup.call(bindControlsDragAndDrop());

      /**
       * Function used to bind the drag and drop behavior of the controls
       */

      function bindControlsDragAndDrop() {
        // auxiliar variables
        var target, targetClass, rotateHandleStartPos;

        // binding the behavior callback functions
        var drag = d3.behavior
          .drag()
          .on('dragstart', dragStart)
          .on('drag', dragMove)
          .on('dragend', dragEnd);

        return drag;

        /**
         * For the drag action starts
         * */
        function dragStart() {
          // gets the current target element where the drag event started
          target = d3.select(d3.event.sourceEvent.target);
          // and saves the target element class in a aux variable
          targetClass = target.attr('class');

          // when the user is rotating the element, stores the initial angle
          // information to be used in the rotate function
          if (targetClass.indexOf('rotate') > -1) {
            // gets the updated rotate coordinates
            var updatedRotateCoordinates = SvgService.getImageUpdatedRotateCoordinates();

            // updates the rotate handle start posistion object with
            // basic information from the model and the handles
            rotateHandleStartPos = {
              angle: updatedRotateCoordinates.angle, // the current angle
              x: parseFloat(target.attr('cx')), // the current cx value of the target handle
              y: parseFloat(target.attr('cy')), // the current cy value of the target handle
            };

            // calc the rotated top & left corner
            if (rotateHandleStartPos.angle > 0) {
              var correctsRotateHandleStartPos = getHandleRotatePosition(
                rotateHandleStartPos
              );
              rotateHandleStartPos.x = correctsRotateHandleStartPos.x;
              rotateHandleStartPos.y = correctsRotateHandleStartPos.y;
            }

            // adds the initial angle in degrees
            rotateHandleStartPos.iniAngle = calcAngleDeg(
              updatedRotateCoordinates,
              rotateHandleStartPos
            );
          }
        }

        /**
         * For while the drag is happening
         * */
        function dragMove() {
          // checks the target class to choose the right function
          // to be executed while dragging
          // #1 - If the user is moving the element around
          if (targetClass.indexOf('move') > -1) {
            moveObject();
          }
          // #2 - If the user is resizing the element
          else if (targetClass.indexOf('resize') > -1) {
            resizeObject(targetClass);
          }
          // #3 - If the user is rotating the element
          else if (targetClass.indexOf('rotate') > -1) {
            rotateObject(rotateHandleStartPos);
          }

          // apply the scope changes for any function that might
          // have been called, to keep things updated in the service model
          scope.$apply();
        }

        /**
         * For when the drag stops (the user release the element)
         * */
        function dragEnd() {
          // check if the user was resizing
          if (targetClass.indexOf('resize') > -1) {
            // updates the center of rotation after resizing the element
            elemCenter = getElementCenter();
            SvgService.updateImageRotateCoordinates(
              null,
              elemCenter.x,
              elemCenter.y
            );
            scope.$apply();
          }
        }
      }

      /**
       * Function to move the object around
       * */
      function moveObject() {
        // increments the x/y values with the dx/dy values from the d3.event object
        tPos.x += d3.event.dx;
        tPos.y += d3.event.dy;

        // updates the translate transform values to move the object to the new point
        SvgService.updateImageTransform(
          'translate',
          'translate(' + [tPos.x, tPos.y] + ')'
        );
        // updates the translate coordinates in the model for further use
        SvgService.updateImageTranslateCoordinates(tPos.x, tPos.y);
      }

      /**
       * Function to resize the object based in the passed direction
       * */
      function resizeObject(direction) {
        // gets the original image coordinates from the service model
        var updatedCoordinates = SvgService.getImageUpdatedCoordinates();

        // auxiliar variables
        var x, y, width, height;

        // do the resize math based in the direction that the resize started
        switch (direction) {
          // top left
          case 'resize-tl':
            width = updatedCoordinates.width - d3.event.dx;
            height = updatedCoordinates.height - d3.event.dy;
            x = updatedCoordinates.x + (updatedCoordinates.width - width);
            y = updatedCoordinates.y + (updatedCoordinates.height - height);
            break;
          // top right
          case 'resize-tr':
            width = updatedCoordinates.width + d3.event.dx;
            height = updatedCoordinates.height - d3.event.dy;
            y = updatedCoordinates.y + (updatedCoordinates.height - height);
            break;
          // bottom left
          case 'resize-bl':
            width = updatedCoordinates.width - d3.event.dx;
            height = updatedCoordinates.height + d3.event.dy;
            x = updatedCoordinates.x + (updatedCoordinates.width - width);
            break;
          // bottom right
          case 'resize-br':
            width = updatedCoordinates.width + d3.event.dx;
            height = updatedCoordinates.height + d3.event.dy;
            break;
        }

        if (width > minWidth && height > minHeight) {
          // updates the image object model with the new coordinates values
          SvgService.updateImageCoordinates(width, height, x, y);
        }
      }

      /**
       * Function to rotate the object based in the initial rotation values
       * present in the rotateHandleStartPos object
       * */
      function rotateObject(rotateHandleStartPos) {
        // gets the current udapted rotate coordinates
        var updatedRotateCoordinates = SvgService.getImageUpdatedRotateCoordinates();

        // increments the mouse event starting point with the mouse movement event
        rotateHandleStartPos.x += d3.event.dx;
        rotateHandleStartPos.y += d3.event.dy;

        // calculates the difference between the current mouse position and the center line
        var angleFinal = calcAngleDeg(
          updatedRotateCoordinates,
          rotateHandleStartPos
        );
        // gets the difference of the angles to get to the final angle
        var angle =
          rotateHandleStartPos.angle +
          angleFinal -
          rotateHandleStartPos.iniAngle;

        // converts the values to stay inside the 360 positive
        angle %= 360;
        if (angle < 0) {
          angle += 360;
        }

        // creates the new rotate position array
        var rotatePos = [
          angle,
          updatedRotateCoordinates.cx,
          updatedRotateCoordinates.cy,
        ];

        // updates the transform rotate string value and the rotate info in the service model
        SvgService.updateImageTransform('rotate', 'rotate(' + rotatePos + ')');
        // and updates the current angle with the new one
        SvgService.updateImageRotateCoordinates(angle);
      }

      //////////////

      /**
       * Private functions
       * */
      // gets the passed d3 element center coordinates
      function getElementCenter() {
        var uCords = SvgService.getImageUpdatedCoordinates();
        var result = {
          x: uCords.x + uCords.width / 2,
          y: uCords.y + uCords.height / 2,
        };
        return result;
      }

      /**
       * Function to corrects the rotate handles starting position
       */
      function getHandleRotatePosition(handleStartPos) {
        // its possible to use "cx/cy" for properties
        var originalX = handleStartPos.x ? handleStartPos.x : handleStartPos.cx;
        var originalY = handleStartPos.y ? handleStartPos.y : handleStartPos.cy;

        // gets the updated element center, without rotatio
        var center = getElementCenter();
        // calculates the rotated handle position considering the current center as
        // pivot for rotation
        var dx = originalX - center.x;
        var dy = originalY - center.y;
        var theta = (handleStartPos.angle * Math.PI) / 180;

        return {
          x: dx * Math.cos(theta) - dy * Math.sin(theta) + center.x,
          y: dx * Math.sin(theta) + dy * Math.cos(theta) + center.y,
        };
      }

      // gets the angle in degrees between two points
      function calcAngleDeg(p1, p2) {
        var p1x = p1.x ? p1.x : p1.cx;
        var p1y = p1.y ? p1.y : p1.cy;
        return (Math.atan2(p2.y - p1y, p2.x - p1x) * 180) / Math.PI;
      }
    }

    return {
      strict: 'A',
      link: SvgDirectiveLink,
    };
  }

  //angular.module('svgApp').directive('svgDirective', SvgDirective);
})();
