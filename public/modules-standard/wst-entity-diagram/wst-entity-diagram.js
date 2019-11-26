'use strict';


/*

1.- MAke Resizable divs for entities, notes, etc...

      http://jsfiddle.net/skorp/L7mafc7f/

2.- Swimlanes

3.- Grouping entities in different levels



*/


app.directive('resizable', function () {

  return {
      restrict: 'A',
      scope: {
          callback: '&onResize'
      },
      link: function postLink(scope, elem, attrs) {
          elem.resizable({
                        handles: "n, e, s, w, ne, se, sw, nw"
                      });
          elem.on('resize', function (evt, ui) {
            scope.$apply(function() {
              if (scope.callback) {
                scope.callback({$evt: evt, $ui: ui });
              }
            })
          });
      }
  };
})





app.directive('wstEntityDiagram', function($compile, $rootScope,$ocLazyLoad) {
    return {
        transclude: true,
        scope: {
            model: '=',
            properties: '=',
            onChange: '=',
            onSelect: '=',
            onElementIconClick: '=',
            onDeleteObject: '=',
            onObjectDblClick: '=',
            zoom: '='
        },

        template: '<div class="wst-diagram" drop="onDrop($data, $event)" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="cursor:default">  </div>',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function($scope, element, attrs) {


          $ocLazyLoad.load(
              {
                  name: "wst-entity-diagram",
                  files: [
                      'wst-entity-diagram/wst-entity-diagram.css'
                  ],
                  serie: true
              });

            var initialized = false;
            $scope.canUserMoveElements = true;
            $scope.entityMoving = false;
            $scope.positionRatio = 1;
            $scope.grid = 20;
            $scope.chartType = 'QJOIN';
            $scope.joinColor = "#CCC";
            $scope.joinHeight = 2;
            $scope.attributeNameField = 'elementLabel';
            $scope.validateName = false;
            $scope.attributeHeight = 20;
            $scope.entityHeaderHeigth = 30;
            $scope.colapsedEntityHeight = 50;
            $scope.attributeIconClick = true;

            var lastSelected = undefined;
            var linksLayer = undefined;

            element.bind("dragover", function(e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                if(e.stopPropagation) {
                    e.stopPropagation();
                }

                //e.dataTransfer.dropEffect = 'move';
                return false;
            });

            $scope.onDrop = function (data, e) {

                  var customObjectData = data['json/custom-object'];
                  if (customObjectData)
                  {
                  var x = e.pageX;
                  var y = e.pageY;

                  if (customObjectData.type == 'Resizable')
                    newRElement(customObjectData.properties.label,x,y,customObjectData.properties.name,customObjectData.properties.image,customObjectData.properties.class,customObjectData.properties.backgroundColor )
                  //$scope.addColumn(customObjectData,type);
                }
            };



            $scope.$watch('model', function() {
                if (!initialized && $scope.model != undefined)
                {
                    mainContainer.empty();
                    initializeDiagram();

                }

            });

            $scope.zoom = 10;
            $scope.$watch('zoom', function() {
                 zooming($scope.zoom);
            });

            $scope.$watch('properties', function() {
                if ($scope.properties)
                {
                    if ($scope.properties.attributeNameField)
                        $scope.attributeNameField = $scope.properties.attributeNameField;
                    if ($scope.properties.validateName)
                        $scope.validateName = $scope.properties.validateName;
                    if ($scope.properties.defaultJoinType)
                        $scope.defaultJoinType = $scope.properties.defaultJoinType;
                }

            });



            var mainContainer = addMainContainer();
            //addDiagramtoolsMenu(); //TODO:not positioning properly ... until that removed

            function addMainContainer()
            {
              var $mainContainer = angular.element('<div class="wst-diagram-container" style="cursor:default">  </div>');
              $compile($mainContainer)($scope);
              element.append($mainContainer);
              return $mainContainer;
            }

            function addDiagramtoolsMenu()
            {
              //TODO:not positioning properly ... until that removed
              var $toolbar = angular.element('<div class="wst-diagram-toolbar" ><input id="zoomSlider" min="1" max="20" step="1" ng-model="zoomvalue" ng-change="zoom(zoomvalue)" type="range"/></div>');
              $compile($toolbar)($scope);
              element.append($toolbar);
            }

            $rootScope.$on('deletedObject', function (event, data) {

                if (data.objectType == 'join') {
                    for (var j in $scope.model.joins) {
                        if ($scope.model.joins[j].joinID == data.object.joinID) {
                            $scope.model.joins.splice(j,1);
                        }
                    }
                }

                if (data.objectType == 'entity') {
                    for (var e in $scope.model.entities) {
                        if ($scope.model.entities[e].entityID == data.object.entityID) {
                            $scope.model.entities.splice(e,1);
                        }
                    }
                    deleteAllEntityJoins(data.object.entityID);
                }

                if (data.objectType == 'attribute') {
                    for (var e in $scope.model.entities) {
                        for (var a in $scope.model.entities[e].attributes) {
                            if ($scope.model.entities[e].attributes[a].elementID == data.object.elementID) {
                                $scope.model.entities[e].attributes.splice(a,1);
                                deleteAllAttributeJoins(data.object.entityID);
                            }
                        }

                    }
                }
                if (data.objectType == 'comment') {
                    for (var c in $scope.model.comments) {
                        if ($scope.model.comments[c].commentID == data.object.commentID) {
                            $scope.model.comments.splice(c,1);
                        }
                    }
                   // deleteAllCommentJoins(data.objectID);
                }

                if (data.objectType != 'attribute') {
                    mainContainer.empty();
                    initializeDiagram();
                } else {
                    $('#'+data.objectID).remove();
                }

                if ($scope.onChange)
                    $scope.onChange();
                if ($scope.onDeleteObject)
                    $scope.onDeleteObject(data.object);
            });

            function deleteAllEntityJoins(entityID)
            {
                for (var j in $scope.model.joins)
                {
                    var joinData = $scope.model.joins[j];

                    if (joinData.sourceParentID == entityID || joinData.targetParentID == entityID) {
                        $('#'+$scope.model.joins[j].joinID).remove();
                        $scope.model.joins.splice(j,1);
                    }
                }
            }

            function deleteAllAttributeJoins(entityID)
            {
                for (var j in $scope.model.joins)
                {
                    var joinData = $scope.model.joins[j];

                    if (joinData.sourceObjectID == entityID || joinData.targetObjectID == entityID) {
                        $('#'+$scope.model.joins[j].joinID).remove();
                        $scope.model.joins.splice(j,1);
                    }
                }
            }

            $rootScope.$on('joinChanged', function (event, data) {

                $('#'+data.objectID).remove();

                for (var j in $scope.model.joins)
                {
                    if ($scope.model.joins[j].joinID == data.objectID)
                    {
                        createJoin($scope.model.joins[j],true);
                    }
                }

                $scope.onChange();

            });


            $rootScope.$on('attributeIndexChanged', function (event, data) {

                var theAttribute = data;

                for (var j in $scope.model.joins)
                {
                    var joinData = $scope.model.joins[j];

                    if (joinData.sourceParentID == data.entityID || joinData.targetParentID == data.entityID) {
                        refreshJoinPosition(joinData);
                    }
                }
            });

            $rootScope.$on('clearDiagram', function (event, data) {
                mainContainer.empty();
                initializeDiagram();
            });

            $rootScope.$on('addEntity', function (event, data) {

                var theNewEntity = data;
                theNewEntity.left = 20 + mainContainer.offset();
                theNewEntity.top = 20 + mainContainer.offset();

                if (!$scope.model.entities)
                    $scope.model.entities = [];

                if (!$scope.model.joins)
                    $scope.model.joins = [];

                if (!$scope.model.comments)
                    $scope.model.comments = [];

                $scope.model.entities.push(theNewEntity);
                createEntity(theNewEntity,$scope.model.entities.length -1);

                $scope.onChange();

            });




            function initializeDiagram()
            {
                linksLayer = $('<svg class="wst-diagram-links-layer noTransition"></svg>');
                linksLayer.appendTo(mainContainer);

                for (var e in $scope.model.entities)
                {
                    createEntity($scope.model.entities[e],e);
                }


                for (var c in $scope.model.comments)
                {
                    createComment($scope.model.comments[c],c);
                }

                setTimeout(function () {
                    for (var j in $scope.model.joins)
                    {
                        createJoin($scope.model.joins[j],false);

                    }
                    refreshAllJoins(); //This is here for the Zoom effect
                },100);

                //addDiagramtoolsMenu();



            }

            function entityChangedPosition(entityID,position)
            {
                for (var j in $scope.model.joins)
                {
                    var joinData = $scope.model.joins[j];

                    if (joinData.sourceParentID == entityID || joinData.targetParentID == entityID) {
                        refreshJoinPosition(joinData);
                    }
                }
            }

            function commentChangedPosition(commentID)
            {
                for (var j in $scope.model.joins)
                {
                    var joinData = $scope.model.joins[j];
                    if (joinData.sourceObjectID == commentID || joinData.targetObjectID == commentID) {
                        refreshJoinPosition(joinData);
                    }
                }
            }

            function refreshJoinPosition(join)
            {

              var sourceEntityCollapsed = false;
              var targetEntityCollapsed = false;

              if (join.sourceParentID && join.targetParentID) {
                  var sourceEntity = angular.element($('#' + join.sourceParentID));
                  sourceEntityCollapsed = isEntityCollapsed(join.sourceParentID);
                  var targetEntity = angular.element($('#' + join.targetParentID));
                  targetEntityCollapsed = isEntityCollapsed(join.targetParentID);
              }


                if (join.sourceObjectID && join.targetObjectID) {
                    var sourceAttribute = angular.element($('#' + join.sourceObjectID));
                    var targetAttribute = angular.element($('#' + join.targetObjectID));
                }


                if (sourceAttribute && targetAttribute) {
                  var sourcePosition = getElementPosition(sourceAttribute);

                  if (sourceEntityCollapsed)
                      sourcePosition = getElementPosition(sourceEntity);

                  var targetPosition = getElementPosition(targetAttribute);

                  if (targetEntityCollapsed)
                      targetPosition = getElementPosition(targetEntity);

                  //var targetEntity = angular.element($('#' + join.targetParentID));
                      var targetEntityPosition = getElementPosition(targetEntity);

                    //  var sourceEntity = angular.element($('#' + join.targetParentID));
                      var sourceEntityPosition = getElementPosition(sourceEntity);

                    var fromX = sourceEntityPosition.x + getElementWidth(sourceAttribute);
                    var toX = targetEntityPosition.x;
                    var elbowXPosition = Math.abs((toX - fromX) / 2);
                    var fromXelbowXPosition = fromX + elbowXPosition;
                    var toXelbowXPosition = toX - elbowXPosition;

                    if (sourceEntityPosition.x > (targetEntityPosition.x +  getElementWidth(targetAttribute)+25))
                    {
                      fromX = sourceEntityPosition.x ;
                      toX = targetEntityPosition.x+ getElementWidth(targetAttribute);
                      elbowXPosition = Math.abs((fromX - toX) / 2);
                      fromXelbowXPosition = fromX - elbowXPosition;
                      toXelbowXPosition = toX + elbowXPosition;
                    }

                    var targetOrderNum = Number(targetAttribute.attr('data-attr-item-nbr'))+1;
                    var targetY = (targetEntityPosition.y+($scope.attributeHeight*targetOrderNum)+$scope.entityHeaderHeigth-($scope.attributeHeight/2))

                    var sourceOrderNum = Number(sourceAttribute.attr('data-attr-item-nbr'))+1;
                    var sourceY = (sourceEntityPosition.y+($scope.attributeHeight*sourceOrderNum)+$scope.entityHeaderHeigth-($scope.attributeHeight/2))

                    //var fromX = sourcePosition.x + getElementWidth(sourceAttribute);
                    //var fromX = sourceEntityPosition.x + getElementWidth(sourceAttribute);


                    //var fromY = sourcePosition.y + Math.round(getElementHeight(sourceAttribute) / 2);
                    var fromY = sourceY;
                    //var toX = targetEntityPosition.x;
                    //var toY = targetPosition.y + Math.round(getElementHeight(targetAttribute) / 2);
                    var toY = targetY;
                    var inverse = false;

/*
                    if (toX < sourcePosition.x)
                    {
                      var fromX = sourcePosition.x ;
                      var toX = targetPosition.x + getElementWidth(targetAttribute);
                      var elbowXPosition = -1*(Math.abs((toX - fromX) / 2));


                      inverse = true;
                    }
*/
                        var halfway = Math.abs((toY - fromY) / 2);


                    if (join.sourceParentID != undefined && join.sourceParentID == join.targetParentID) {
                        toX = fromX;
                        elbowXPosition = 50;
                        var svgDraw = 'M ' + (fromX) + ',' + (fromY) + ' L ' + (fromX + elbowXPosition) + ',' + fromY + ' ' + (toX + elbowXPosition) + ',' + toY + ' ' + toX + ',' + toY;

                    } else {
                       if ((fromX+25 < toX-25) || (sourceEntityPosition.x > (targetEntityPosition.x +  getElementWidth(targetAttribute)+25)))
                        {
                            var svgDraw = 'M ' + (fromX) + ',' + (fromY) + ' L ' + (fromXelbowXPosition) + ',' + fromY + ' ' + (toXelbowXPosition) + ',' + toY + ' ' + toX + ',' + toY;
                        } else {
                            var elbowXPosition = 10;

                            if (toY > fromY)
                              {
                                var svgDraw = 'M ' + (fromX) + ',' + (fromY) + ' L ' + (fromX + elbowXPosition) +',' + fromY + ' ' + (fromX + elbowXPosition) +  ','+ (fromY+halfway) +','+(toX-elbowXPosition)+' '+(fromY+halfway)+','+(toX-elbowXPosition)+' '+(fromY+halfway+halfway)+','+toX+' '+toY;
                              }
                            if (toY < fromY)
                              {
                                var svgDraw = 'M ' + (fromX) + ',' + (fromY) + ' L ' + (fromX + elbowXPosition) +',' + fromY + ' ' + (fromX + elbowXPosition) +  ','+ (fromY-halfway) +','+(toX-elbowXPosition)+' '+(fromY-halfway)+','+(toX-elbowXPosition)+' '+(fromY-halfway-halfway)+','+toX+' '+toY;
                              }
                        }
                    }

                    //bezier
                    if (join.joinType == 'BEZIER') {

                        var bezierFromX = (fromX);
                        var bezierToX = toX + 1;
                        var bezierIntensity = Math.min(100, Math.max(Math.abs(bezierFromX - bezierToX) / 2, Math.abs(fromY - toY)));
                        var arrowWidth = 10;


                        var svgDraw = 'M' + bezierFromX + ',' + (fromY) + ' C' + (fromX + bezierIntensity) + ',' + fromY + ' ' + (toX - bezierIntensity) + ',' + toY + ' ' + (bezierToX - arrowWidth) + ',' + toY;
                    }

                    if (join.joinType == 'COMMENT') {
                        var svgDraw = 'M' + fromX + ',' + (fromY) + ' L' + toX + ' ' + (toY);

                    }


                    join.svg.shape_path.setAttribute("d", svgDraw);


                    if (join.svg.arrowShape)
                        drawArrow(join, toX, toY);
                    if (join.svg.QJOINLeftShape)
                        drawQJOINLeftShape(join, fromX, fromY);
                    if (join.svg.QJOINRightShape)
                        drawQJOINRightShape(join, toX, toY);

                }

            }

            function getRepeatAttributeContent(entityID,entityIndex)
            {
                var attributeContent =
                    '<div id="{{attribute.elementID}}" class="wst-diagram-attribute" ng-repeat="attribute in model.entities['+entityIndex+'].attributes" data-attribute_id="{{attribute.elementID}}" drop="onDropAttribute($data,$event,&quot;{{attribute.elementID}}&quot;,&quot;'+entityID+'&quot;)" drop-effect="copy" drop-accept="[&quot;json/custom-object&quot;,&quot;json/column&quot;]" draggable="true" draggable-type="custom-object"  draggable-data="{elementID:&quot;{{attribute.elementID}}&quot;,  entityID:&quot;'+entityID+'&quot;}"   id="{{attribute.elementID}}" style="height:'+$scope.attributeHeight+'px;" data-attr-item-nbr="{{$index}}">'
                    +'<div  class="wst-diagram-attribute-table">'
                    +' <div style="display: table-row">';

                    //clickable Icon
                    if ($scope.attributeIconClick)
                    {
                    attributeContent = attributeContent
                    +'   <div  class="wst-diagram-attribute-icon-cell"  >'+
                    '       <i ng-show="!attribute.elementRole && onElementIconClick" class="fa fa-plus-square" ng-click="elementIconClick(attribute)" style="color:#000;font-size: 12px;" data-toggle="tooltip" data-placement="top" title="Click here to add this field to the layer"></i>' +
                    '       <i ng-show="attribute.elementRole && onElementIconClick" class="fa fa-check-square" style="color:#79b14a;font-size: 12px;" ></i>' +
                    '   </div>';
                    }
                    attributeContent = attributeContent

                    //Primary Key
                    +'   <div  class="wst-diagram-attribute-icon-cell"  >'+
                    '         <i  ng-if="attribute.isPK" class="fa fa-key" style="color:#000;font-size: 12px;" ></i>' +
                    '    </div>'


                    //attribbute name
                    +'   <div class="wst-diagram-attribute-label"  >'
                    +'    <p ng-show="!attribute.elementRole" editable-text="attribute[attributeNameField]" on-change="validateEntityName(value)"></p>'
                    +'    <p ng-show="attribute.elementRole" editable-text="attribute[attributeNameField]" on-change="validateEntityName(value)" style="color:#000"></p>'
                    +'   </div>'

                    //attribute type
                    +'   <div class="wst-diagram-attribute-label wst-diagram-attribute-type"  >{{attribute.elementType}}</div>'

                    //Not Null
                    +'   <div  class="wst-diagram-attribute-icon-cell"  style="max-width: 15px;display: table-cell;width: 15px;height: 15px;overflow: hidden;">'+
                    '         <i  ng-if="attribute.required" class="fa fa-asterisk" style="color:#000;font-size: 12px;" ></i>' +
                    '    </div>'


                    +'  </div>'
                    +'</div>'
                    +'</div>';

                return attributeContent;
            }

            $scope.elementIconClick = function (element)
            {
                //event.stopPropagation();
                $scope.onElementIconClick(element);
            }


            $scope.onDropAttribute = function(data,event,targetID,targetEntityID)
            {
                event.stopPropagation();

                var customObjectData = data['json/custom-object'];

                if (customObjectData.type == 'comment')
                {
                    if (customObjectData.commentID != targetID) {
                        var join = {};
                        join.joinID = generateShortUID();
                        join.joinType = 'COMMENT';
                        join.joinHeight = $scope.joinHeight;
                        join.joinColor = $scope.joinColor;
                        join.sourceObjectID = customObjectData.commentID;
                        join.targetObjectID = targetID;
                        join.targetParentID = targetEntityID;
                        $scope.model.joins.push(join);
                        createJoin(join, false);
                        $scope.onChange();
                    }
                } else {

                    if (customObjectData.elementID != targetID) {
                        var join = {};
                        join.joinID = generateShortUID();
                        if ($scope.defaultJoinType)
                            join.joinType = $scope.defaultJoinType
                            else
                            join.joinType = 'QJOIN';

                        join.multiplicity = 'default';
                        join.joinHeight = $scope.joinHeight;
                        join.joinColor = $scope.joinColor;
                        join.sourceObjectID = customObjectData.elementID;
                        join.sourceParentID = customObjectData.entityID;
                        join.targetObjectID = targetID;
                        join.targetParentID = targetEntityID;
                        join.sourceElementName = getAttributeName(customObjectData.entityID,customObjectData.elementID);
                        join.targetElementName = getAttributeName(targetEntityID,targetID);
                        join.multiplicity == 'inner'
                        $scope.model.joins.push(join);
                        createJoin(join, false);
                        $scope.onChange();
                        setTimeout(function () {
                            refreshAllJoins(); //This is here for the Zoom effect
                        },10);
                        //refreshAllJoins(); //This is here for the Zoom effect
                    }
                }
            }


            function getAttributeName(entityID,elementID)
            {
                for (var e in $scope.model.entities)
                {
                    if ( entityID == $scope.model.entities[e].entityID)
                    {
                        for (var a in $scope.model.entities[e].attributes)
                        {
                            if (elementID == $scope.model.entities[e].attributes[a].elementID)
                                return $scope.model.entities[e].attributes[a].elementName;
                        }
                    }
                }
            }


            $scope.onDropOverComment = function(data,event,commentID)
            {
                event.stopPropagation();

                var customObjectData = data['json/custom-object'];

                    var join = {};
                    join.joinID = generateShortUID();
                    join.joinType = 'COMMENT';
                    join.joinHeight = $scope.joinHeight;
                    join.joinColor = $scope.joinColor;
                    if (customObjectData.elementID) {
                    //    join.sourceOtherID = customObjectData.elementID;
                        join.sourceObjectID = customObjectData.elementID;
                    }
                    if (customObjectData.entityID) {
                            if (!customObjectData.elementID)
                                //join.sourceOtherID = customObjectData.entityID;
                                join.sourceObjectID = customObjectData.entityID;
                        join.sourceParentID = customObjectData.entityID;
                    }

                    join.targetObjectID = commentID;
                    $scope.model.joins.push(join);
                    createJoin(join, false);

                    $scope.onChange();
            }


            $scope.newComment = function()
            {
                var theComment = {};
                theComment.commentID = generateShortUID();
                theComment.commentText = "";
                theComment.left = 20 + mainContainer.offset();
                theComment.top = 20 + mainContainer.offset();

                if (!$scope.model.entities)
                    $scope.model.entities = [];

                if (!$scope.model.joins)
                    $scope.model.joins = [];

                if (!$scope.model.comments)
                    $scope.model.comments = [];

                $scope.model.comments.push(theComment);
                createComment(theComment,$scope.model.comments.length -1);

                $scope.onChange();

            }


            function createComment(comment,index)
            {
                var $comment = angular.element('<div id="'+comment.commentID+'" class="wst-diagram-comment" style="position:absolute; top:'+comment.top+'px;left:'+comment.left+'px;"></div>');
                $comment.draggable({
                    handle: '.wst-comment-header-handler',
                    drag: function(e, ui) {

                        //minimum distance from top and left coordinates
                        if (ui.position.top < 0)
                            ui.position.top = 0;

                        if (ui.position.left < 0)
                            ui.position.left = 0;

                        comment.top = ui.position.top;
                        comment.left = ui.position.left;
                        commentChangedPosition(comment.commentID);
                    },
                    stop: function (e, ui) {
                        $scope.onChange();
                    }
                });

                var $commentHeader = angular.element('<div class="wst-comment-header"> <div style="display:table-row">'+
                    '<div style="display: table-cell;width: 15px" <i class="fa fa-file-text-o" ' +
                    +'data-comment_id="'+comment.commentID+'" drop="onDropOverComment($data,$event,&quot;'+comment.commentID+'&quot;)" drop-effect="copy" drop-accept="[&quot;json/custom-object&quot;,&quot;json/column&quot;]" draggable="true" draggable-type="custom-object"  draggable-data="{type:&quot;comment&quot;,commentID:&quot;'+comment.commentID+'&quot;}"'
                    +'></i></div>' +
                    '<div class="wst-comment-header-handler"></div>'
                    +'</div>'
                    +'</div>'
                );
                $commentHeader.data('comment_id', comment.commentID);
                $comment.append($commentHeader);

                var commentText = '<textarea ng-model="model.comments['+index+'].commentText" class="form-control ng-pristine ng-valid ng-touched wst-comment-textarea"'
                    +'></textarea>'
                var $commentText = angular.element(commentText);
                $comment.append($commentText);

                $compile($comment)($scope);
                mainContainer.append($comment);

            }

            function newRElement(label,left,top,objectType,image,elementClass,backgroundColor)
            {
                var theRElement = {};
                theRElement.ID = generateShortUID();
                theRElement.label = label;
                theRElement.image = image;
                theRElement.class = elementClass;
                theRElement.associatedObjectType = objectType;
                theRElement.width = 300;
                theRElement.backgroundColor = backgroundColor;
                if (left)
                    theRElement.left = left + mainContainer.offset();
                    else
                    theRElement.left = 20 + mainContainer.offset();

                if (top)
                    theRElement.top = top + mainContainer.offset();
                    else
                    theRElement.top = 20 + mainContainer.offset();

                if (!$scope.model.entities)
                    $scope.model.entities = [];

                if (!$scope.model.joins)
                    $scope.model.joins = [];

                if (!$scope.model.comments)
                    $scope.model.comments = [];

                if (!$scope.model.RElements)
                    $scope.model.RElements = [];

                $scope.model.RElements.push(theRElement);
                createRElement(theRElement,$scope.model.RElements.length -1);

                $scope.onChange();

            }

            function createRElement(elementObject,index)
            {
              //Resizable element
              var elementClass = '';
              if (elementObject.class)
                  elementClass = elementObject.class;

              var theWidth = '';
              if (elementObject.width)
                      theWidth = 'width:'+elementObject.width+'px; ';

              var theBgColor = '';
              if (elementObject.backgroundColor)
                      theBgColor = 'background-color:'+elementObject.backgroundColor+'; ';

              var style = 'style="'+theWidth+theBgColor+'position:absolute;"';


              var HTML = '<div id="'+elementObject.ID+'" resizable class="resizable resizable-drag'+elementClass+'"'+style+'>';
              HTML = HTML + '<div class="resizable-header"></div>';

              HTML = HTML + '<div class="resizable-body">';
              if (elementObject.image)
                  HTML = HTML + '<img src="'+elementObject.image+'">';
              if (elementObject.label)
                  HTML = HTML + '<span>'+elementObject.label+'</span>';

              HTML = HTML +   '</div>';
              HTML = HTML +'</div>';
                      /*
                                                +'<div class="resizers">'
                                                  +'<div class="resizer top-left"></div>'
                                                  +'<div class="resizer top-right"></div>'
                                                  +'<div class="resizer bottom-left"></div>'
                                                  +'<div class="resizer bottom-right"></div>'
                                                +'</div>'
                                                +'<img src="'+elementObject.image+'">'
                                                +'<span>'+elementObject.label+'</span>'
                                              +'</div>'
*/
              var $Relement = angular.element(HTML);
                $Relement.draggable({
                    handle: '.resizable-drag',
                    drag: function(e, ui) {

                        //minimum distance from top and left coordinates
                        if (ui.position.top < 0)
                            ui.position.top = 0;

                        if (ui.position.left < 0)
                            ui.position.left = 0;

                        elementObject.top = ui.position.top;
                        elementObject.left = ui.position.left;
                        commentChangedPosition(elementObject.commentID);
                    },
                    stop: function (e, ui) {
                        $scope.onChange();
                    }
                });

/*
                var $commentHeader = angular.element('<div class="wst-comment-header"> <div style="display:table-row">'+
                    '<div style="display: table-cell;width: 15px" <i class="fa fa-file-text-o" ' +
                    +'data-comment_id="'+comment.commentID+'" drop="onDropOverComment($data,$event,&quot;'+comment.commentID+'&quot;)" drop-effect="copy" drop-accept="[&quot;json/custom-object&quot;,&quot;json/column&quot;]" draggable="true" draggable-type="custom-object"  draggable-data="{type:&quot;comment&quot;,commentID:&quot;'+comment.commentID+'&quot;}"'
                    +'></i></div>' +
                    '<div class="wst-comment-header-handler"></div>'
                    +'</div>'
                    +'</div>'
                );*/
                $Relement.data('id', elementObject.ID);
                //$comment.append($commentHeader);
/*
                var commentText = '<textarea ng-model="model.comments['+index+'].commentText" class="form-control ng-pristine ng-valid ng-touched wst-comment-textarea"'
                    +'></textarea>'
                var $commentText = angular.element(commentText);
                $comment.append($commentText);
*/
                $compile($Relement)($scope);
                mainContainer.append($Relement);

                createSVGelement({},1);

            }


            function createSVGelement(elementObject,index)
            {


              var HTML = '<g transform="translate(0.5,0.5)" style="visibility: visible; cursor: move;" class="resizable infra-element ui-resizable ui-draggable"><path d="M 987.08 1530 L 982.08 1530 L 982.08 1489.5 L 976.83 1489.5 L 984.58 1480 L 992.33 1489.5 L 987.08 1489.5 Z" fill="#d5e8d4" stroke="#82b366" stroke-linejoin="round" stroke-miterlimit="10" pointer-events="all"></path></g>'

              var $Relement = angular.element(HTML);
                $Relement.draggable({
                    handle: '.resizable-header',
                    drag: function(e, ui) {

                        //minimum distance from top and left coordinates
                        if (ui.position.top < 0)
                            ui.position.top = 0;

                        if (ui.position.left < 0)
                            ui.position.left = 0;

                        elementObject.top = ui.position.top;
                        elementObject.left = ui.position.left;

                    },
                    stop: function (e, ui) {
                        $scope.onChange();
                    }
                });


                $Relement.data('id', elementObject.ID);

                $compile($Relement)($scope);
                linksLayer.append($Relement);


            }



            function createJoin(join,selected) {


                //check if parent entities are collapsed or not
                var sourceEntityCollapsed = false;
                var targetEntityCollapsed = false;

                if (join.sourceParentID && join.targetParentID) {
                    var sourceEntity = angular.element($('#' + join.sourceParentID));
                    sourceEntityCollapsed = isEntityCollapsed(join.sourceParentID);
                    var targetEntity = angular.element($('#' + join.targetParentID));
                    targetEntityCollapsed = isEntityCollapsed(join.targetParentID);
                }

                if (join.sourceObjectID && join.targetObjectID) {
                    var sourceAttribute = angular.element($('#' + join.sourceObjectID));
                    var targetAttribute = angular.element($('#' + join.targetObjectID));
                }
/*
                if (join.sourceOtherID && join.targetOtherID) {
                    var sourceAttribute = angular.element($('#' + join.sourceOtherID));
                    var targetAttribute = angular.element($('#' + join.targetOtherID));
                }
*/
                if (sourceAttribute && targetAttribute) {


                if (sourceAttribute.offset() != undefined && targetAttribute.offset() != undefined) {
                    if (join.joinType == 'QJOIN') {
                        sourceAttribute.css({backgroundColor: '#adbf95'});
                        targetAttribute.css({backgroundColor: '#adbf95'});
                    }


                    var sourcePosition = getElementPosition(sourceAttribute);

                    if (sourceEntityCollapsed)
                        sourcePosition = getElementPosition(sourceEntity);

                    var targetPosition = getElementPosition(targetAttribute);

                    if (targetEntityCollapsed)
                        targetPosition = getElementPosition(targetEntity);

                    var fromX = sourcePosition.x + getElementWidth(sourceAttribute);
                    var fromY = sourcePosition.y + Math.round(getElementHeight(sourceAttribute) / 2);
                    var toX = targetPosition.x;
                    var toY = targetPosition.y + Math.round(getElementHeight(targetAttribute) / 2);
                    var elbowXPosition = Math.abs((toX - fromX) / 2);

                    if (fromX > toX)
                        {
                          fromX = targetPosition.x;
                          toX = sourcePosition.x + getElementWidth(sourceAttribute);
                        }

                    if (join.sourceParentID != undefined && join.sourceParentID == join.targetParentID) {
                        toX = fromX;
                        elbowXPosition = 50;
                        var svgDraw = 'M ' + (fromX) + ',' + (fromY) + ' L ' + (fromX + elbowXPosition) + ',' + fromY + ' ' + (toX + elbowXPosition) + ',' + toY + ' ' + toX + ',' + toY;

                    } else {
                        var svgDraw = 'M ' + (fromX) + ',' + (fromY) + ' L ' + (fromX + elbowXPosition) + ',' + fromY + ' ' + (toX - elbowXPosition) + ',' + toY + ' ' + toX + ',' + toY;

                    }


                    //bezier
                    if (join.joinType == 'BEZIER') {

                        var bezierFromX = (fromX);
                        var bezierToX = toX + 1;
                        var bezierIntensity = Math.min(100, Math.max(Math.abs(bezierFromX - bezierToX) / 2, Math.abs(fromY - toY)));
                        var arrowWidth = 10;


                        var svgDraw = 'M' + bezierFromX + ',' + (fromY) + ' C' + (fromX + bezierIntensity) + ',' + fromY + ' ' + (toX - bezierIntensity ) + ',' + toY + ' ' + (bezierToX - arrowWidth) + ',' + toY;
                    }

                    if (join.joinType == 'COMMENT')
                    {
                        var svgDraw = 'M' + fromX + ',' + (fromY) + ' L' + toX + ' ' + (toY) ;

                    }

                    if (!join.joinHeight)
                        join.joinHeight = $scope.joinHeight;

                    if (!join.joinColor)
                        join.joinColor = $scope.joinColor;

                    if (!join.joinType)
                        join.joinType = $scope.joinType;


                    var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    if (selected) {
                        group.setAttribute("class", "wst-diagram-entity-join-group wst-diagram-selected");
                        lastSelected = $(group);
                    } else
                        group.setAttribute('class', 'wst-diagram-entity-join-group');
                    group.setAttribute("stroke-width", join.joinHeight);
                    group.setAttribute("fill", "none");
                    group.setAttribute("stroke", join.joinColor);
                    group.setAttribute('data-join_id', join.joinID);
                    if (join.joinType == 'COMMENT')
                        group.setAttribute('stroke-dasharray', '5,5');
                    //group[0].data('join_id', join.joinID);
                    group.setAttribute("id", join.joinID);
                    linksLayer[0].appendChild(group);


                    var shape_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    shape_path.setAttribute("class", "wst-diagram-entity-join");
                    shape_path.setAttribute("stroke-linejoin", "round");
                    shape_path.setAttribute("d", svgDraw);
                    //shape_path.setAttribute("marker-end","url(#triangle)");


                    group.appendChild(shape_path);
                    join.svg = {};
                    join.svg.shape_path = shape_path;


                    if (join.joinType == 'QJOIN' && join.multiplicity == 'left') {
                        var QJOINLeftShape = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        group.appendChild(QJOINLeftShape);
                        join.svg.QJOINLeftShape = QJOINLeftShape;
                        drawQJOINLeftShape(join, fromX, fromY);
                    }

                    if (join.joinType == 'QJOIN' && join.multiplicity == 'default') {

                    }

                    if (join.joinType == 'QJOIN' && join.multiplicity == 'right') {
                        var QJOINRightShape = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        group.appendChild(QJOINRightShape);
                        join.svg.QJOINRightShape = QJOINRightShape;
                        drawQJOINRightShape(join, toX, toY);
                    }

                    if (join.joinType == 'BEZIER') {
                        var arrowShape = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        group.appendChild(arrowShape);
                        join.svg.arrowShape = arrowShape;
                        drawArrow(join, toX, toY);
                    }

                }
            }

            }

            function isEntityCollapsed(entityID)
            {
              var result = false;

              for (var e in $scope.model.entities)
              {
                  if ($scope.model.entities[e].entityID == entityID)
                  {
                      if ($scope.model.entities[e].collapsed)
                      {
                        result = true;
                      }
                  }
              }

              return result;
            }

            function drawArrow(join,toX,toY)
            {
              var SvgDraw = ' M' + (toX -10) + ',' + (toY - (10 - join.joinHeight )) + ' L' + (toX-10) + ',' + (toY + (10 - join.joinHeight ))+ ' L' + (toX+8) + ',' + (toY) + ' L' + (toX -10) + ',' + (toY - (10 - join.joinHeight )) ;

                join.svg.arrowShape.setAttribute("d", SvgDraw);
            }

            function drawQJOINRightShape(join,toX,toY)
            {
               /* join.svg.QJOINRightShape.setAttribute("cx", toX-25);
                join.svg.QJOINRightShape.setAttribute("cy", toY);*/
/*
                if (join.targetJoinMultiplicity == '01n')

                if (join.targetJoinMultiplicity == 'x1n')

                if (join.targetJoinMultiplicity == 'x1x')

                if (join.targetJoinMultiplicity == 'xxx')

                if (join.targetJoinMultiplicity == '01x')
*/


                var SvgDraw = ' M' + (toX -15) + ',' + (toY - (10 - join.joinHeight )) + ' L' + (toX - 15) + ',' + (toY + (10 - join.joinHeight )) ;

                join.svg.QJOINRightShape.setAttribute("d", SvgDraw);
            }

            function drawQJOINLeftShape(join,toX,toY)
            {
               /* join.svg.QJOINLeftShape.setAttribute("cx", toX-25);
                join.svg.QJOINLeftShape.setAttribute("cy", toY);
                */
                var SvgDraw = ' M' + (toX +15) + ',' + (toY - (10 - join.joinHeight )) + ' L' + (toX + 15) + ',' + (toY + (10 - join.joinHeight )) ;

                join.svg.QJOINLeftShape.setAttribute("d", SvgDraw);
            }

            element.on('click', '.wst-diagram-links-layer', function (e) {
                e.stopPropagation();
                unSelect();
                if ($scope.onSelect)
                  $scope.onSelect('model',undefined);
                $rootScope.$emit('entityDiagramObjectSelected', {type:'model',id:undefined});
                lastSelected = undefined;
            });

            element.on('click', '.wst-diagram-entity-join-group', function (e) {
                e.stopPropagation();
                unSelect();
                $(this)[0].setAttribute("class", "wst-diagram-entity-join-group wst-diagram-selected");
                var id = $(this).data('join_id');
                if ($scope.onSelect)
                  $scope.onSelect('join',id);
                  $rootScope.$emit('entityDiagramObjectSelected', {type:'join',id:id});
                lastSelected = $(this);
            });

            element.on('click', '.wst-diagram-header', function (e) {
                e.stopPropagation();
                unSelect();
                $(this).addClass('wst-diagram-selected');
                var id = $(this).data('entity_id');
                if ($scope.onSelect)
                  $scope.onSelect('entity',id);
                  $rootScope.$emit('entityDiagramObjectSelected', {type:'entity',id:id});
                lastSelected = $(this);

            });

            element.on('click', '.wst-comment-header', function (e) {
                e.stopPropagation();
                unSelect();
                $(this).addClass('wst-diagram-selected');
                var id = $(this).data('comment_id');
                if ($scope.onSelect)
                  $scope.onSelect('comment',id);
                  $rootScope.$emit('entityDiagramObjectSelected', {type:'comment',id:id});
                lastSelected = $(this);

            });

            element.on('click', '.wst-diagram-attribute', function (e) {
                e.stopPropagation();
                unSelect();
                $(this).addClass('wst-diagram-selected');
                var id = $(this).data('attribute_id');
                if ($scope.onSelect)
                  $scope.onSelect('attribute',id);
                  $rootScope.$emit('entityDiagramObjectSelected', {type:'attribute',id:id});
                lastSelected = $(this);

            });

            element.on('click', '.wst-diagram-entity-database', function (e) {
                e.stopPropagation();
                unSelect();
                $(this).addClass('wst-diagram-selected');
                var id = $(this).data('entity_id');
                if ($scope.onSelect)
                  $scope.onSelect('entity',id);
                  $rootScope.$emit('entityDiagramObjectSelected', {type:'entity',id:id});
                lastSelected = $(this);

            });

            element.on('dblclick', '.wst-diagram-header', function (e) {
                e.stopPropagation();
                unSelect();
                $(this).addClass('wst-diagram-selected');
                var id = $(this).data('entity_id');
                if ($scope.onObjectDblClick)
                  $scope.onObjectDblClick('entity',id);
            });

            element.on('dblclick', '.wst-diagram-attribute', function (e) {
                e.stopPropagation();
                unSelect();
                $(this).addClass('wst-diagram-selected');
                var id = $(this).data('attribute_id');
                if ($scope.onObjectDblClick)
                  $scope.onObjectDblClick('attribute',id);
            });

            element.on('click', '.resizable', function (e) {
                e.stopPropagation();
                if (lastSelected)
                  lastSelected.removeClass('selected');
                $(this).addClass('selected');

                lastSelected = $(this);
            });

            element.on('dblclick', '.resizable', function (e) {
                e.stopPropagation();
                if (lastSelected)
                  lastSelected.removeClass('selected');
                $(this).addClass('selected');
                var id = $(this).data('id');
                if ($scope.onObjectDblClick)
                  $scope.onObjectDblClick('resizable',id);
            });

            element.on('resize', '.resizable', function (e,ui) {
                e.stopPropagation();
            });

            function unSelect()
            {
                if (lastSelected) {
                    var lastType = lastSelected.prop('nodeName');

                    if (lastType == 'g')
                    {
                        lastSelected[0].setAttribute("class", "wst-diagram-entity-join-group");
                    } else {
                        lastSelected.removeClass('wst-diagram-selected');

                    }
                }
            }


            function getElementPosition(theElement)
            {
                var offset = mainContainer.offset();
                var zoomCompensationValue = (1-($scope.zoom/10))+1;
                var theElementOffset = theElement.offset();
                var x = (theElementOffset.left - offset.left);
                var width = parseInt(theElement.css('border-top-width'));
                var y = (theElementOffset.top - offset.top)  + parseInt(theElement.css('border-left-width'));

                var str = theElement.css('left');
                var strY = theElement.css('top');

                if (str != 'auto')
                  x = Number(str.replace("px", ""));
                if (strY != 'auto')
                    y = Number(strY.replace("px", ""));
                //x = x * zoomCompensationValue;
                //y = y * zoomCompensationValue;
                width = width * zoomCompensationValue;
                return {x: x, width: width, y: y};

            }

            function getElementWidth(theElement)
            {
                /*var str = theElement.css('width');
                var res = str.replace("px", "");
                var zoomCompensationValue = (1-($scope.zoom/10))+1;
                res = res * zoomCompensationValue;
                return  Math.round(res);
                */
                return  Math.round(theElement.width());
            }

            function getElementHeight(theElement)
            {
                /*var str = theElement.css('height');
                var res = str.replace("px", "");
                var zoomCompensationValue = (1-($scope.zoom/10))+1;
                //res = res * zoomCompensationValue;
                return  Math.round(res);
                */


                return  Math.round(theElement.height());
            }


            $scope.validateEntityName = function validateContent(value)
            {
                if ($scope.validateName)
                {
                    var regularExpression = /^[A-Za-z_-][A-Za-z0-9_-]*$/;
                    var valid = regularExpression.test(value);
                    if (!valid) {
                        toastr.error('Invalid name format');
                        //noty({text: 'Invalid name format', timeout: 500, type: 'error'});
                        return false;
                    } else {
                        $scope.onChange();
                        return value;
                    }
                } else {
                  $scope.onChange();
                  return value;
                }
            }

            function generateShortUID() {
                return 'WST'+ ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
            }

            $scope.move = function(array, element, delta) {
                var index = array.indexOf(element);
                var newIndex = index + delta;
                if (newIndex < 0  || newIndex == array.length) return; //Already at the top or bottom.
                var indexes = [index, newIndex].sort(); //Sort the indixes
                array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]); //Replace from lowest index, two elements, reverting the order
            };

            $scope.collapseEntity = function(entityID, targetID)
            {
              for (var e in $scope.model.entities)
              {
                  if ($scope.model.entities[e].entityID == entityID)
                  {
                      if ($scope.model.entities[e].collapsed)
                      {
                        $("#"+targetID).show();
                        $scope.model.entities[e].collapsed = false;
                        entityChangedPosition(entityID,undefined);
                      } else {
                        $("#"+targetID).hide();
                        $scope.model.entities[e].collapsed = true;
                        entityChangedPosition(entityID,undefined);
                      }
                  }
              }


            }


            /************ DATABASE ************/


            function createDatabaseElement(databaseElement,index)
            {
                var $databaseElement = angular.element('<div id="'+databaseElement.entityID+'" class="wst-diagram-database-element" style="position:absolute; top:'+databaseElement.top+'px;left:'+databaseElement.left+'px; width:200px; height: 300px;">'+
                    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 30" enable-background="new 0 0 24 24" xml:space="preserve">'+
                    '<g>' +
                    '<path d="M21.796,5.418c0-0.382-0.108-0.771-0.319-1.153l-0.064-0.119c0.089-0.203,0.148-0.413,0.148-0.636    c0-2.279-4.927-3.51-9.563-3.51C7.364,0,2.439,1.231,2.439,3.51c0,0.223,0.06,0.432,0.147,0.635L2.521,4.267    c-0.211,0.38-0.317,0.769-0.317,1.151v2.821c0,0.497,0.176,0.971,0.489,1.414L2.552,9.896c-0.231,0.399-0.348,0.806-0.348,1.205    v2.821c0,0.484,0.164,0.947,0.464,1.381l-0.116,0.198c-0.231,0.401-0.348,0.808-0.348,1.209v2.818c0,2.508,4.304,4.472,9.794,4.472    c5.494,0,9.798-1.964,9.798-4.472V16.71c0-0.401-0.116-0.81-0.352-1.209l-0.114-0.195c0.301-0.435,0.466-0.899,0.466-1.384v-2.821    c0-0.401-0.116-0.808-0.352-1.207l-0.139-0.239c0.313-0.443,0.49-0.918,0.49-1.416V5.418z M20.746,13.922    c0,1.62-3.592,3.422-8.748,3.422c-5.154,0-8.744-1.802-8.744-3.422v-2.653c1.606,1.472,4.915,2.411,8.744,2.411    c3.831,0,7.142-0.939,8.748-2.411V13.922z M20.746,8.239c0,1.618-3.592,3.424-8.748,3.424c-5.154,0-8.744-1.806-8.744-3.424V5.893    c1.57,1.332,5.213,2.023,8.744,2.023c3.533,0,7.176-0.691,8.748-2.023V8.239z M11.998,1.05c5.275,0,8.511,1.432,8.511,2.46    c0,1.027-3.235,2.461-8.511,2.461c-5.271,0-8.509-1.434-8.509-2.461C3.489,2.481,6.727,1.05,11.998,1.05z M20.746,19.528    c0,1.619-3.592,3.422-8.748,3.422c-5.154,0-8.744-1.803-8.744-3.422v-2.653c1.606,1.477,4.915,2.414,8.744,2.414    c3.831,0,7.142-0.938,8.748-2.414V19.528z"/>' +
                    '</g>' +
                    '</svg>' +

                    '</div>');


                $databaseElement.draggable({
                    handle: '.wst-diagram-database-element',
                    drag: function(e, ui) {

                        //minimum distance from top and left coordinates
                        if (ui.position.top < 0)
                            ui.position.top = 0;

                        if (ui.position.left < 0)
                            ui.position.left = 0;

                        databaseElement.top = ui.position.top;
                        databaseElement.left = ui.position.left;
                        entityChangedPosition(entity.entityID,ui.position);
                    },
                    stop: function (e, ui) {
                        $scope.onChange();
                    }
                });

                $compile($databaseElement)($scope);
                element.append($databaseElement);


            }


            function createEntity(entity,index)
            {

                var entityClass = 'wst-diagram-entity';
                var headerClass = 'wst-diagram-header';
                var dragClass = 'wst-diagram-header';

                if (entity.entityType == 'database') {
                    entityClass = 'wst-diagram-entity-database';
                    headerClass = 'wst-diagram-database-header';
                    dragClass = 'wst-diagram-entity';
                }

                var $entity = angular.element('<div id="'+entity.entityID+'" class="'+entityClass+'" style="position:absolute; top:'+entity.top+'px;left:'+entity.left+'px;"></div>');

                if (entity.entityType == 'database') {
                    $entity.data('entity_id', entity.entityID);
                    $entity.draggable({
                        drag: function (e, ui) {
                            //minimum distance from top and left coordinates
                            if (ui.position.top < 0)
                                ui.position.top = 0;

                            if (ui.position.left < 0)
                                ui.position.left = 0;
                            entity.top = ui.position.top;
                            entity.left = ui.position.left;
                            entityChangedPosition(entity.entityID, ui.position);
                        },
                        stop: function (e, ui) {
                            $scope.onChange();
                        }
                    });
                } else {
                    $entity.draggable({
                         handle: '.'+dragClass,
                        drag: function (e, ui) {
                            //minimum distance from top and left coordinates
                            if (ui.position.top < 0)
                                ui.position.top = 0;

                            if (ui.position.left < 0)
                                ui.position.left = 0;

                            entity.top = ui.position.top;
                            entity.left = ui.position.left;
                            entityChangedPosition(entity.entityID, ui.position);
                        },
                        stop: function (e, ui) {
                            $scope.onChange();
                        }
                    });
                }

                var $entityHeader = angular.element('<div class="'+headerClass+'" style="height:'+$scope.entityHeaderHeigth+'px;" ></div>');
                $entityHeader.data('entity_id', entity.entityID);
                $entity.append($entityHeader);

                if (entity.entityType === 'table' || entity.entityType === 'SQL') {
                    var headerContent = getTableEntityHeaderHTML(entity,index);
                }

                if (entity.entityType === 'database') {
                    var headerContent = getDatabaseEntityHeaderHTML(entity,index);
                }

                var $entityLabel = angular.element(headerContent);
                $entityHeader.append($entityLabel);

                var $entityAttributesDiv = angular.element('<div id="'+entity.entityID+'_ATTRIBUTES"></div>');
                $entity.append($entityAttributesDiv);

                if (entity.entityType === 'table'  || entity.entityType === 'SQL') {
                    var attributeContent = getRepeatAttributeContent(entity.entityID, index)
                    var $attribute = angular.element(attributeContent);
                    $entityAttributesDiv.append($attribute);
                }

                if (entity.entityType === 'database') {
                    var $databaseElementCode = angular.element(getDatabaseEntityHTML(entity));
                    $entity.append($databaseElementCode);
                }

                $compile($entity)($scope);
                mainContainer.append($entity);
            }

            function getTableEntityHeaderHTML(entity,index)
            {
                return '<div style="display: table;border: 0px;" class="wst-diagram-entity-header-table" ng-class="{\'sql-entity\': model.entities['+index+'].entityType === \'SQL\'}">'
                        + '<div style="display: table-row;"   draggable="false" >'
                            +'<div  class="wst-diagram-entity-icon" ><i ng-if="model.entities['+index+'].entityType === \'table\'" class="fa fa-table"></i><span class="entity-sql-icon" ng-if="model.entities['+index+'].entityType === \'SQL\'">S</span></div>'
                            +'<div  class="wst-diagram-entity-label" >{{model.entities['+index+'].table_name}}</div>'
                            +'<div class="wst-diagram-entity-aux-icon"><i class="white fa " ng-class=" {\'fa-chevron-up\': !model.entities['+index+'].collapsed, \'fa-chevron-down\': model.entities['+index+'].collapsed}" ng-click="collapseEntity(\''+entity.entityID+'\',\''+entity.entityID+'_ATTRIBUTES\')"></i></div>'
                        +'</div>'
                     +'</div>'
            }

            function getDatabaseEntityHTML(entity)
            {
                return '<svg style="width:50px;height:70px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 30" enable-background="new 0 0 24 24" xml:space="preserve">'+
                '<g>' +
                '<path d="M21.796,5.418c0-0.382-0.108-0.771-0.319-1.153l-0.064-0.119c0.089-0.203,0.148-0.413,0.148-0.636    c0-2.279-4.927-3.51-9.563-3.51C7.364,0,2.439,1.231,2.439,3.51c0,0.223,0.06,0.432,0.147,0.635L2.521,4.267    c-0.211,0.38-0.317,0.769-0.317,1.151v2.821c0,0.497,0.176,0.971,0.489,1.414L2.552,9.896c-0.231,0.399-0.348,0.806-0.348,1.205    v2.821c0,0.484,0.164,0.947,0.464,1.381l-0.116,0.198c-0.231,0.401-0.348,0.808-0.348,1.209v2.818c0,2.508,4.304,4.472,9.794,4.472    c5.494,0,9.798-1.964,9.798-4.472V16.71c0-0.401-0.116-0.81-0.352-1.209l-0.114-0.195c0.301-0.435,0.466-0.899,0.466-1.384v-2.821    c0-0.401-0.116-0.808-0.352-1.207l-0.139-0.239c0.313-0.443,0.49-0.918,0.49-1.416V5.418z M20.746,13.922    c0,1.62-3.592,3.422-8.748,3.422c-5.154,0-8.744-1.802-8.744-3.422v-2.653c1.606,1.472,4.915,2.411,8.744,2.411    c3.831,0,7.142-0.939,8.748-2.411V13.922z M20.746,8.239c0,1.618-3.592,3.424-8.748,3.424c-5.154,0-8.744-1.806-8.744-3.424V5.893    c1.57,1.332,5.213,2.023,8.744,2.023c3.533,0,7.176-0.691,8.748-2.023V8.239z M11.998,1.05c5.275,0,8.511,1.432,8.511,2.46    c0,1.027-3.235,2.461-8.511,2.461c-5.271,0-8.509-1.434-8.509-2.461C3.489,2.481,6.727,1.05,11.998,1.05z M20.746,19.528    c0,1.619-3.592,3.422-8.748,3.422c-5.154,0-8.744-1.803-8.744-3.422v-2.653c1.606,1.477,4.915,2.414,8.744,2.414    c3.831,0,7.142-0.938,8.748-2.414V19.528z"/>' +
                '</g>' +
                '</svg>';
            }

            function zooming(zoomValue)
            {
              var zoomScale = Number(zoomValue)/10;
                 //setZoom(zoomScale,document.getElementsByClassName('wst-diagram-container')[0])
                 setZoom(zoomScale,mainContainer[0])

            }

            function setZoom(zoom,el) {

                var transformOrigin = [0,0];
                el = el || instance.getContainer();
                var p = ["webkit", "moz", "ms", "o"],
                      s = "scale(" + zoom + ")",
                      oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

                for (var i = 0; i < p.length; i++) {
                    el.style[p[i] + "Transform"] = s;
                    el.style[p[i] + "TransformOrigin"] = oString;
                }

                el.style["transform"] = s;
                el.style["transformOrigin"] = oString;

                refreshAllJoins();

            }

            function refreshAllJoins()
            {
              if ($scope.model)
                for (var j in $scope.model.joins)
                {
                    var joinData = $scope.model.joins[j];
                        refreshJoinPosition(joinData);
                }
            }


        }
    }
});
