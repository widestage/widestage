app.controller('layerCtrl', function ($scope,$rootScope,connection,$routeParams,datasourceModel,uuid2,$timeout,PagerService,$window ) {


    $scope.layerModal = 'partials/layer/layerModal.html';
    $scope.datasetModal = 'partials/layer/datasetModal.html';
    $scope.sqlModal = 'partials/layer/sqlModal.html';
    $scope.elementModal = 'partials/layer/elementModal.html';
    $scope.statusInfoModal = 'partials/common/statusInfo.html';
    $scope.setupModal = 'partials/layer/setupModal.html';
    $scope.ReadOnlyDataSourceSelector = false;
    $scope.items =  [];
    $scope.pager = {};
    $scope.datasources = [];
    $scope.selectedDts = {};
    $scope.initiated = false;



    $scope.elementTypes = [{name:"object",value:"object"},
        {name:"string",value:"string"},
        {name:"number",value:"number"},
        {name:"boolean",value:"boolean"},
        {name:"date",value:"date"},
        {name:"array",value:"array"}
    ];

    $scope.numberDefaultAggregation = [{name:"raw",value:"value"},
        {name:"SUM",value:"sum"},
        {name:"AVG",value:"avg"},
        {name:"MIN",value:"min"},
        {name:"MAX",value:"max"},
        {name:"COUNT",value:"count"}
    ];
    $scope.stringDefaultAggregation = [{name:"raw",value:"value"},
        {name:"COUNT",value:"count"}
    ];

    $scope.rootItem = {elementLabel: '', elementRole: 'root', elements: []};

    $scope.deletingJoin = false;





    if ($routeParams.extra == 'intro') {
            $timeout(function(){$scope.showIntro()}, 1000);
    }


    $scope.IntroOptions = {
            //IF width > 300 then you will face problems with mobile devices in responsive mode
                steps:[
                    {
                        element: '#parentIntro',
                        html: '<div><h3>Layers</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Layers define the interface for your users to access the data.</span><br/><br/><span>Layers allow your users to create reports dragging and droping familiar elements that points in the background to the fields contained in tables in your data surces.</span><br/><br/><span>Here you can create and manage the layers that later will be used by your users to create reports or explore data.</span><br/><br/><span>You can create several layers depending on your necessities, but you have to define one at least.</span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "300px"
                    },
                    {
                        element: '#newLayerBtn',
                        html: '<div><h3>New Layer</h3><span style="font-weight:bold;">Click here to create a new layer.</span><br/><span></span></div>',
                        width: "300px",
                        height: "150px",
                        areaColor: 'transparent',
                        horizontalAlign: "right",
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#layerList',
                        html: '<div><h3>Layers list</h3><span style="font-weight:bold;">Here all the layers are listed.</span><br/><span>You can edit the layer to configure the tables, elements and joins between tables.<br/><br/>You can also activate or deactivate layers.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        verticalAlign: "top",
                        height: "180px"

                    },
                    {
                        element: '#layerListItem',
                        html: '<div><h3>Layer</h3><span style="font-weight:bold;">This is one layer.</span><br/><span></span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#72A230',
                        height: "180px"

                    },
                    {
                        element: '#layerListItemName',
                        html: '<div><h3>Layer name</h3><span style="font-weight:bold;">The name for the layer.</span><br/><br/><span>You can setup the name you want for your layer, but think about make it descriptive enough, specially if users will have to choose between several layers.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: "200px"

                    },
                    {
                        element: '#layerListItemDetails',
                        html: '<div><h3>Layer description</h3><span style="font-weight:bold;">Use the description to give your users more information about the data or kind of data they will access using the layer.</span><br/><span></span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: "180px"

                    },
                    {
                        element: '#layerListItemStatus',
                        html: '<div><h3>Layer status</h3><span style="font-weight:bold;">The status of the layer defines if the layer is visible or not for your users when creating or editing a report or exploring data.</span><br/><br/><span>You can change the status of the layer simply clicking over this label</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    },
                    {
                        element: '#parentIntro',
                        html: '<div><h3>Next Step</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Design your company public space</span><br/><br/>The public space is the place where your users can publish reports to be shared across the company, in this place you will define the folder strucuture for the company&quot;s public space<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/public-space/intro">Go to the public space definition and continue tour</a></span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "250px"
                    }
                ]
            }


    /**** JSPLUMB variables and functions ****/
/*
    var rightJoinType = {
                connector: "StateMachine",
                paintStyle: { strokeStyle: "#61B7CF", lineWidth: 4 },
                hoverPaintStyle: { strokeStyle: "blue" },
                overlays: [
                    ["Diamond" , { location: 1 }]
                ]

            };

    var leftJoinType = {
                connector: "StateMachine",
                paintStyle: { strokeStyle: "#61B7CF", lineWidth: 4 },
                hoverPaintStyle: { strokeStyle: "blue" },
                params: {margin: 40},
                overlays: [
                    ["Diamond" , { location: 0 }]
                ]

            };
*/

    var instance;

    $scope.initJsPlumbIfNeed = function () {
        if (typeof instance === "undefined") {
            instance = jsPlumb.getInstance({
                // default drag options
                Endpoint: ["Dot", {radius: 2}],

                DragOptions: {cursor: 'pointer', zIndex: 2000},
                // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
                // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
                ConnectionOverlays: [],

                Container: "canvas"
            });
        }
    }

    var connectorPaintStyle = {
                    lineWidth: 4,
                    strokeStyle: "#61B7CF",
                    joinstyle: "round",
                    outlineColor: "white",
                    outlineWidth: 2
                },
               connectorHoverStyle = {
                    lineWidth: 4,
                    strokeStyle: "#216477",
                    outlineWidth: 2,
                    outlineColor: "white"
                },
                endpointHoverStyle = {
                    fillStyle: "#000000",
                    strokeStyle: "#000000"    //strokeStyle: "#216477"
                },

            // the definition of source endpoints (the small blue ones)
                sourceEndpoint = {
                    endpoint: "Dot",
                    paintStyle: {
                        strokeStyle: "#7AB02C",
                        fillStyle: "transparent",
                        radius: 6,
                        lineWidth: 3
                    },
                    isSource: true,
                    connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
                    connectorStyle: connectorPaintStyle,
                    hoverPaintStyle: endpointHoverStyle,
                    connectorHoverStyle: connectorHoverStyle,
                    maxConnections: -1,
                    dragOptions: {},
                    overlays: [
                        [ "Label", {
                            location: [0.5, 1.5],
                            label: "",
                            cssClass: "endpointSourceLabel"
                        } ]
                    ]
                },
            // the definition of target endpoints (will appear when the user drags a connection)
                targetEndpoint = {
                    endpoint: "Dot",
                    paintStyle: { fillStyle: "#7AB02C", radius: 6 },
                    hoverPaintStyle: endpointHoverStyle,
                    maxConnections: -1,
                    dropOptions: { hoverClass: "hover", activeClass: "active" },
                    isTarget: true,
                    overlays: [
                        [ "Label", { location: [0.5, -0.5], label: "", cssClass: "endpointTargetLabel" } ]
                    ]
                },
                 _addEndpoints = function (toId, sourceAnchors, targetAnchors) {

                    $scope.initJsPlumbIfNeed();

                    for (var i = 0; i < sourceAnchors.length; i++) {
                        var sourceUUID = toId + sourceAnchors[i];

                        instance.addEndpoint( toId, sourceEndpoint, {
                            anchor: sourceAnchors[i], uuid: sourceUUID
                        });
                    }

                    for (var j = 0; j < targetAnchors.length; j++) {
                        var targetUUID = toId + targetAnchors[j];

                        instance.addEndpoint( toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
                    }
                 },
                init = function (connection) {
                    //connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
                };



    $scope.newLayer = function ()
    {
        $scope._Layer = {};
        $scope._Layer.params = {};
        $scope._Layer.status = 'Not active';
        $scope.mode = 'add';
        $('#layerModal').modal('show');
    }

    function setDraggable(targetID)
    {

        instance.draggable(document.querySelectorAll(targetID), {

            drag:function(e){
                // Your code comes here
                jsPlumb.repaint($(this));
            },
            stop: function(event, ui) {

                if (ui.position != undefined)
                {
                    var pos_x = ui.position.left;
                    var pos_y = ui.position.top;

                    if (pos_x < 0)
                               pos_x = 0;

                    if (pos_y < 0)
                               pos_y = 0;

                    var parentId = $(this).attr("id");

                    var id = parentId.replace('-parent','');




                    for (var c in $scope._Layer.params.schema)
                    {
                        if ($scope._Layer.params.schema[c].collectionID == id)
                        {
                            $scope._Layer.params.schema[c].left = pos_x;
                            $scope._Layer.params.schema[c].top = pos_y;
                        }
                    }

                }
            }
        });
    }

  /*******   *******/


    $scope.initForm = function() {
        if ($routeParams.layerID) {
            connection.get('/api/layers/find-one', {id: $routeParams.layerID}, function(data) {
                $scope._Layer = data.item;
                $scope.selectedDts.id = $scope._Layer.params.schema[0].datasourceID;
                $scope.mode = 'edit';
                $scope.erDiagramInit();
            });
        }
        else {
            $scope._Layer = {};
            $scope._Layer.params = {};
            $scope._Layer.status = 'Not active';
            $scope.mode = 'add';
            $scope.erDiagramInit();
        }
    };

    $scope.changeLayerStatus = function(layer)
    {
        if ($rootScope.isWSTADMIN)
        {

            if (layer.status == 'active')
                var newStatus = 'Not active';
            if (layer.status == 'Not active')
                var newStatus = 'active';

            var data = {layerID: layer._id, status: newStatus}

            connection.post('/api/layers/change-layer-status', data, function(result) {
                layer.status = newStatus;
            });
        }
    }

    $scope.view = function() {

        if ($routeParams.layerID)
        {
            connection.get('/api/layers/find-one', {id: $routeParams.layerID}, function(data) {
                $scope._Layer = data.item;
                if ($scope._Layer.params) {
                    if ($scope._Layer.params.schema) {
                        if ($scope._Layer.params.schema.length > 0) {
                            $scope.selectedDts.id = $scope._Layer.params.schema[0].datasourceID;
                        }
                    }
                }
                $scope.mode == 'edit';
                $scope.rootItem.elements = $scope._Layer.objects;


                if ($scope._Layer.params)

                {
                    $scope.erDiagramInit();
                }
                else {
                    $scope._Layer.params = {};
                    $scope._Layer.params.schema = [];

                }



                var currentZoom = 1.0;
                var onZoom = false;

                $(document).ready(function () {
                    $('#collections').bind('mousewheel DOMMouseScroll', function(e){
                        e.preventDefault();

                        if (onZoom) return;

                        onZoom = true;

                        if(e.originalEvent.wheelDelta /120 > 0) {
                            $('#canvas').animate({ 'zoom': currentZoom += .1 }, 250, function() {
                                onZoom = false;
                            });
                        }
                        else{
                            $('#canvas').animate({ 'zoom': currentZoom -= .1 }, 250, function() {
                                onZoom = false;
                            });
                        }
                    });

                });

            });
        };
    };


    $scope.save = function() {

            var theLayer = $scope._Layer;

            //clean up

            for (var collection in theLayer.params.schema)
            {
                for (var element in theLayer.params.schema[collection].elements)
                {
                    if (theLayer.params.schema[collection].elements[element].painted)
                        theLayer.params.schema[collection].elements[element].painted = false;
                }
            }

            for (var join in theLayer.params.joins)
                {
                    theLayer.params.joins[join].connection = undefined;
                }


        if ($scope.mode == 'add') {
            theLayer.objects = $scope.rootItem.elements;
            var data = theLayer;
            connection.post('/api/layers/create', data, function(data) {
                $scope.items.push(data.item);
                $('#layerModal').modal('hide');
            });

        } else {
            connection.post('/api/layers/update/'+theLayer._id, theLayer, function(result) {
                if (result.result == 1) {
                    window.history.back();
                }
            });
        }
    };


    $scope.getLayers = function(page, search, fields) {

        var params = {};

        params.page = (page) ? page : 1;

        if (search) {
            $scope.search = search;
        }
        else if (page == 1) {
            $scope.search = '';
        }
        if ($scope.search) {
            params.search = $scope.search;
        }

        if (fields) params.fields = fields;

        connection.get('/api/layers/find-all', params, function(data) {
            $scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.pager = PagerService.GetPager($scope.items.length, data.page,10,data.pages);
        });
    };

    $scope.getDatasources = function()
    {
        var params = {};

        params.page = 0; //All data

        params.fields = ['name','type','status','statusInfo','params.connection.host','params.connection.port','params.connection.database'];

        datasourceModel.getDataSources(params, function(data){

            $scope.datasources = data.items;
        });
    }
/*
    $scope.addDataset = function ()
    {
        $scope.selectedDts = {};
        $scope.selectedEntities = [];
        $scope.datasetEntities = [];

        if ($scope._Layer.params)
            if ($scope._Layer.params.schema)
                if ($scope._Layer.params.schema.length > 0)
                    {
                      $scope.selectedDts.id = $scope._Layer.params.schema[0].datasourceID;
                      $scope.ReadOnlyDataSourceSelector = true;
                      $scope.getDatasetsForDts();
                    }

        $('#datasetModal').modal('show');
    }

*/

    $scope.addSQL = function ()
    {
        $scope.temporarySQLCollection = {};
        //$scope.selectedDts = {};
        //if ($scope._Layer.params)
          //  if ($scope._Layer.params.schema)
            //    if ($scope._Layer.params.schema.length > 0)
              //      {
                //      $scope.selectedDts.id = $scope._Layer.params.schema[0].datasourceID;
                      $scope.ReadOnlyDataSourceSelector = true;
                //      $scope.getDatasetsForDts();
                //    }

        $('#sqlModal').modal('show');
    }

    $scope.setSelectedEntity = function (entity)
    {
        if ($scope.selectedEntities.indexOf(entity) == -1)
        {
            $scope.selectedEntities.push(entity);
        } else {
            var index = $scope.selectedEntities.indexOf(entity);
            $scope.selectedEntities.splice(index, 1);
        }

    }
/*
    $scope.addToLayer = function ()
    {
        if ($scope.selectedEntities.length > 0)
        {
            datasourceModel.getEntitiesSchema($scope.selectedDts.id,$scope.selectedEntities,function(result){


                if (result.result == 1)
                {
                    for (i in result.items)
                    {
                        result.items[i].datasourceID = $scope.selectedDts.id;

                        for (e in result.items[i].elements)
                        {
                            result.items[i].elements[e].datasourceID = $scope.selectedDts.id;
                            result.items[i].elements[e].collectionID = result.items[i].collectionID;
                            result.items[i].elements[e].collectionName = result.items[i].collectionName;
                        }

                        if (!$scope._Layer.params)
                            $scope._Layer.params = {};
                        if (!$scope._Layer.params.schema)
                            $scope._Layer.params.schema = [];

                        $scope._Layer.params.schema.push(result.items[i]);

                    }

                    $('#datasetModal').modal('hide');
                    $scope.erDiagramInit();

                }
            });
        }
    }

    */

    $scope.addSqlToLayer = function()
    {
        datasourceModel.getSqlQuerySchema($scope.selectedDts.id,$scope.temporarySQLCollection,function(result){

        if (result.result == 1)
                {
                    for (i in result.items)
                    {
                        result.items[i].datasourceID = $scope.selectedDts.id;

                        for (e in result.items[i].elements)
                        {
                            result.items[i].elements[e].datasourceID = $scope.selectedDts.id;
                            result.items[i].elements[e].collectionID = result.items[i].collectionID;
                            result.items[i].elements[e].collectionName = result.items[i].collectionName;
                        }

                        if (!$scope._Layer.params)
                            $scope._Layer.params = {};
                        if (!$scope._Layer.params.schema)
                            $scope._Layer.params.schema = [];

                        $scope._Layer.params.schema.push(result.items[i]);

                        setTimeout(function () {

                                for (var element in result.items[i].elements)
                                    {
                                        if (!result.items[i].elements[element].painted || result.items[i].elements[element].painted == false)
                                        {
                                            _addEndpoints(result.items[i].elements[element].elementID, [ "RightMiddle"], ["LeftMiddle"]);
                                        }


                                    }
                                    var targetID = '#'+result.items[i].collectionID+'-parent';
                                    setDraggable(".window");

                                },100);

                    }

                    $('#sqlModal').modal('hide');
                    $scope.erDiagramInit();

            }
        });
    }

/*
    $scope.getDatasetsForDts = function (_id)
    {
        connection.get('/api/data-sources/getEntities', {id: $scope.selectedDts.id}, function(data) {
            $scope.datasetEntities = data.items;

        });
    }

*/
    function getElement(elementID)
    {
        for (var collection in $scope._Layer.params.schema)
        {
            for (var element in $scope._Layer.params.schema[collection].elements)
            {
                if ($scope._Layer.params.schema[collection].elements[element].elementID == id)
                    return $scope._Layer.params.schema[collection].elements[element];
            }
        }
    }

    function getElementAndCollection(elementID)
    {
        var foundedElement = {};

        for (var collection in $scope._Layer.params.schema)
        {
            for (var element in $scope._Layer.params.schema[collection].elements)
            {
                if ($scope._Layer.params.schema[collection].elements[element].elementID == id)
                {
                    foundedElement.elementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                    foundedElement.collectionID = $scope._Layer.params.schema[collection].collectionID;
                }
            }
        }
    }

    function makeJoin(sourceID,targetID)
    {
        if(!$scope._Layer.params.joins)
            $scope._Layer.params.joins = [];

        var found = false;
        //First verify that the join does not exists
        for (var j in $scope._Layer.params.joins)
        {
            if ($scope._Layer.params.joins[j].sourceElementID == sourceID && $scope._Layer.params.joins[j].targetElementID == targetID)
            {
                found = true;

            }
        }

        if (found == false)
        {
                var join = {};
                join.joinID = uuid2.newguid();

                for (var collection in $scope._Layer.params.schema)
                {
                    for (var element in $scope._Layer.params.schema[collection].elements)
                    {
                        if ($scope._Layer.params.schema[collection].elements[element].elementID == sourceID)
                        {
                            join.sourceElementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                            join.sourceElementName = $scope._Layer.params.schema[collection].elements[element].elementName;
                            join.sourceCollectionID = $scope._Layer.params.schema[collection].collectionID;
                            join.sourceCollectionName = $scope._Layer.params.schema[collection].collectionName;

                        }

                        if ($scope._Layer.params.schema[collection].elements[element].elementID == targetID)
                        {
                            join.targetElementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                            join.targetElementName = $scope._Layer.params.schema[collection].elements[element].elementName;
                            join.targetCollectionID = $scope._Layer.params.schema[collection].collectionID;
                            join.targetCollectionName = $scope._Layer.params.schema[collection].collectionName;

                        }
                    }
                }


                if (join.sourceElementID && join.sourceCollectionID && join.targetElementID && join.targetCollectionID)
                {
                    join.joinType = 'default';
                    $scope._Layer.params.joins.push(join);

                }
        }


    }

    function deleteJoin(sourceID,targetID)
    {
        if(!$scope._Layer.params.joins)
            $scope._Layer.params.joins = [];


        var found = false;
        //First verify that the join does not exists
        for (var j in $scope._Layer.params.joins)
        {
            if (($scope._Layer.params.joins[j].sourceElementID == sourceID && $scope._Layer.params.joins[j].targetElementID == targetID) ||
                ($scope._Layer.params.joins[j].sourceElementID == targetID && $scope._Layer.params.joins[j].targetElementID == sourceID))
            {
                found = true;

                var connections = instance.getAllConnections();

                    for (var c in connections)
                    {
                        var source = connections[c].endpoints[0].getElement().id;
                        var target = connections[c].endpoints[1].getElement().id;


                        if ((target == sourceID && source == targetID) ||
                            (target == targetID && source == sourceID) ){


                           $scope._Layer.params.joins[j].connection = undefined;
                           $scope.instance.detach(connections[c]);
                        }

                    }

                $scope._Layer.params.joins.splice(j,1);

            }
        }
    }

    $scope.erDiagramInit = function() {

        if (!$scope.initiated) {

        //this timeout is here to give time to angular to create the element's divs'
        setTimeout(function () {
            $scope.initJsPlumbIfNeed();

            var rightJoinType = {
                connector: "StateMachine",
                paintStyle: { strokeStyle: "#61B7CF", lineWidth: 4 },
                hoverPaintStyle: { strokeStyle: "blue" },
                overlays: [
                    //["Diamond" , { location: 1 }]
                    ["Label" , { location: 0.88,label:'[right]',labelStyle:{cssClass:'leftJoinType',color:'#000',font:'bold 14px ER',fill:' #fff no-repeat fixed center'} }]
                ]

            };

            var leftJoinType = {
                connector: "StateMachine",
                paintStyle: { strokeStyle: "#61B7CF", lineWidth: 4 },
                hoverPaintStyle: { strokeStyle: "blue" },
                params: {margin: 40},
                overlays: [
                    //["Diamond" , { location: 0 }]
                    // zero one many ["Label" , { location: 0.02,label:'>|*',labelStyle:{cssClass:'leftJoinType',color:'#61B7CF',font:'bold 42px ER',fill:' #fff no-repeat fixed center'} }]
                    ["Label" , { location: 0.10,label:'[left]',labelStyle:{cssClass:'leftJoinType',color:'#000',font:'bold 14px ER',fill:' #fff no-repeat fixed center'} }]
                ]

            };

            var selectedJoin = {
                paintStyle: { strokeStyle: "#999", lineWidth: 4 },
                hoverPaintStyle: { strokeStyle: "#999" }
            };

            instance.registerConnectionType("right", rightJoinType);
            instance.registerConnectionType("left", leftJoinType);
            instance.registerConnectionType("selected", selectedJoin);

            var connectorPaintStyle = {
                    lineWidth: 4,
                    strokeStyle: "#61B7CF",
                    joinstyle: "round",
                    outlineColor: "white",
                    outlineWidth: 2,
                    params: {margin:40}  //Distance from element to start and end connectors, in pixels.
                },
            // .. and this is the hover style.
                connectorHoverStyle = {
                    lineWidth: 4,
                    strokeStyle: "#216477",
                    outlineWidth: 2,
                    outlineColor: "white"
                },
                endpointHoverStyle = {
                    fillStyle: "#000000",
                    strokeStyle: "#000000"    //strokeStyle: "#216477"
                },

            // the definition of source endpoints (the small blue ones)
                sourceEndpoint = {
                    endpoint: "Dot",
                    paintStyle: {
                        strokeStyle: "#7AB02C",
                        fillStyle: "transparent",
                        radius: 6,
                        lineWidth: 3
                    },
                    isSource: true,
                    connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
                    connectorStyle: connectorPaintStyle,
                    hoverPaintStyle: endpointHoverStyle,
                    connectorHoverStyle: connectorHoverStyle,
                    maxConnections: -1,
                    dragOptions: {},

                    overlays: [
                        [ "Label", {
                            location: [0.5, 1.5],
                            label: "",
                            cssClass: "endpointSourceLabel"
                        } ]
                    ]
                },
            // the definition of target endpoints (will appear when the user drags a connection)
                targetEndpoint = {
                    endpoint: "Dot",
                    paintStyle: { fillStyle: "#7AB02C", radius: 6 },
                    hoverPaintStyle: endpointHoverStyle,
                    maxConnections: -1,
                    dropOptions: { hoverClass: "hover", activeClass: "active" },
                    isTarget: true,
                    overlays: [
                        [ "Label", { location: [0.5, -0.5], label: "", cssClass: "endpointTargetLabel" } ]
                    ]
                },
                 _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
                    for (var i = 0; i < sourceAnchors.length; i++) {
                        var sourceUUID = toId + sourceAnchors[i];

                        instance.addEndpoint( toId, sourceEndpoint, {
                            anchor: sourceAnchors[i], uuid: sourceUUID
                        });
                    }
                    for (var j = 0; j < targetAnchors.length; j++) {
                        var targetUUID = toId + targetAnchors[j];

                        instance.addEndpoint( toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
                    }
                 },
                init = function (connection) {
                    //connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
                };
/*****************/
                var jtkField = jsPlumb.getSelector(".jtk-field");
/*****************/
            // suspend drawing and initialise.
            instance.batch(function () {


/************

                for (var collection in $scope._Layer.params.schema)
                {
                    for (var element in $scope._Layer.params.schema[collection].elements)
                    {
                        if (!$scope._Layer.params.schema[collection].elements[element].painted || $scope._Layer.params.schema[collection].elements[element].painted == false)
                        {
                            _addEndpoints($scope._Layer.params.schema[collection].elements[element].elementID, [ "RightMiddle"], ["LeftMiddle"]);
                            $scope._Layer.params.schema[collection].elements[element].painted = true;
                        }


                    }
                }
                ***************/

                /*****************/
                instance.makeSource(jtkField, {
                    filter:"a",
                    filterExclude:true,
                    connector: [ "Flowchart", { stub: [60, 60], gap: 0, cornerRadius: 5, alwaysRespectStubs: true } ],
                            connectorStyle: connectorPaintStyle,
                            hoverPaintStyle: endpointHoverStyle,
                            connectorHoverStyle: connectorHoverStyle,
                    maxConnections: -1,
                    //endpoint:[ "Rectangle", { width: 10, cssClass:"small-blue" } ],
                    anchor:["LeftMiddle","RightMiddle"]
                });

                instance.makeTarget(jtkField, {
                    dropOptions: { hoverClass: "hover" },
                    anchor:["LeftMiddle","RightMiddle"]
                    //endpoint: "Dot"
                    //endpoint:[ "Dot", { radius: 10, cssClass:"large-green" } ]
                });

                /*****************/


                /*
                 _addEndpoints("Window2", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window1", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window3", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window4", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window5", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window6", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window7", [ "RightMiddle"], ["LeftMiddle"]);
                 */

                // listen for new connections; initialise them the same way we initialise the connections at startup.
                instance.bind("connection", function (connInfo, originalEvent) {
                    init(connInfo.connection);
                });

                // make all the window divs draggable
           /*
                instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });


           */
                instance.draggable(document.querySelectorAll(".window"), {
                    drag:function(e){
                        // Your code comes here
                        jsPlumb.repaint($(this));
                    },
                    stop: function(event, ui) {
                        if (ui.position != undefined)
                        {
                            var pos_x = ui.position.left;
                            var pos_y = ui.position.top;

                            if (pos_x < 0)
                               pos_x = 0;

                            if (pos_y < 0)
                               pos_y = 0;

                            var parentId = $(this).attr("id");

                            var id = parentId.replace('-parent','');

                            for (var c in $scope._Layer.params.schema)
                            {
                                if ($scope._Layer.params.schema[c].collectionID == id)
                                {
                                    $scope._Layer.params.schema[c].left = pos_x;
                                    $scope._Layer.params.schema[c].top = pos_y;
                                }
                            }

                        }
                    }
                });


/*****************

                for (var j in $scope._Layer.params.joins)
                {
                    instance.connect({uuids: [$scope._Layer.params.joins[j].sourceElementID+"RightMiddle", $scope._Layer.params.joins[j].targetElementID+"LeftMiddle"], editable: true,type: $scope._Layer.params.joins[j].joinType});
                }
****************/

/*****************/
                for (var j in $scope._Layer.params.joins)
                {
                    var c = instance.connect({ source: $scope._Layer.params.joins[j].targetElementID, target: $scope._Layer.params.joins[j].sourceElementID,id: $scope._Layer.params.joins[j].joinID });

                    if ($scope._Layer.params.joins[j].joinType == 'left')
                        c.setType("left");
                    if ($scope._Layer.params.joins[j].joinType == 'right')
                        c.setType("right");


                }
/*****************/

                //
                // listen for clicks on connections, and offer to delete connections on click.
                //
                instance.bind("click", function (conn, originalEvent) {

                    //unSelect();
                    //$scope.selectedItem = 'join';
                    //$scope.tabs.selected = 'properties';





/*
                    var joinType = '';
                    if (conn.hasType("right") == true)
                    {
                        conn.setType("left");
                        joinType = 'left';
                    } else
                        if (conn.hasType("left") == true)
                        {
                            conn.setType("default");
                            joinType = 'default';
                        }else
                            if (conn.hasType("default") == true)
                            {
                                conn.setType("right");
                                joinType = 'right';
                            }
*/
                    for (var j in $scope._Layer.params.joins)
                    {

                        if (($scope._Layer.params.joins[j].sourceElementID == conn.sourceId && $scope._Layer.params.joins[j].targetElementID == conn.targetId) ||
                             ($scope._Layer.params.joins[j].sourceElementID == conn.targetId && $scope._Layer.params.joins[j].targetElementID == conn.sourceId) )
                            {
                                $scope._Layer.params.joins[j].connection = conn;
                                selectJoin($scope._Layer.params.joins[j]);

                            }
                    }

                originalEvent.stopPropagation();
                conn.setPaintStyle({strokeStyle: "#000", lineWidth: 4 });
                conn.selected = true;

                });

                instance.bind("connectionDrag", function (connection) {

                });


                instance.bind("dblclick", function (connection, originalEvent){

                });

                instance.bind("click", function (connection, originalEvent){

                });

                instance.bind("beforeDrop", function (info){
                    //Here we can control if we are going to accept the join or not...
                    return true;
                });


                instance.bind("connectionMoved", function (params) {

                });

                instance.bind("connectionDetached", function (info,originalEvent) {

                    deleteJoin(info.sourceId,info.targetId);
                });

                instance.bind("connection", function (info,originalEvent) {

                    makeJoin(info.sourceId,info.targetId);
                });
            });

            jsPlumb.fire("jsPlumbDemoLoaded", instance);

            $scope.instance = instance;

        },100);




        $scope.initiated = true;
      }
    }

    function selectJoin(join)
    {
         unSelect();
                    $scope.selectedItem = 'join';
                    $scope.tabs.selected = 'properties';
        $scope.theSelectedElement = join;
        $scope.$apply();
    }



    $scope.elementAdd = function (element)
    {
        $scope.selectedElement = element;
        $scope.elementEditing = false;
        $('#elementModal').modal('show');
    }

    $scope.editElement = function (element)
    {
        $scope.layerSelectedElement = element;
        for (var collection in $scope._Layer.params.schema)
        {
            if ( $scope._Layer.params.schema[collection].collectionID == element.collectionID)
            {
                for (var e in $scope._Layer.params.schema[collection].elements)
                {
                    if ($scope._Layer.params.schema[collection].elements[e].elementID == element.elementID)
                    {

                        var tempElement = {};
                        tempElement = $scope._Layer.params.schema[collection].elements[e];
                        $scope.selectedElement = tempElement;
                        $scope.elementEditing = true;
                        $('#elementModal').modal('show');
                    }
                }
            }
        }
    }

    $scope.saveElement = function()
    {
        if ($scope.elementEditing == false)
            {
                if (!$scope._Layer.objects)
                    $scope._Layer.objects = [];

                $scope.selectedElement.elementRole = 'dimension';
                $scope._Layer.objects.push($scope.selectedElement);

                $('#elementModal').modal('hide');
            } else {
                saveEditElement();
            }
    }

    function saveEditElement()
    {
        var element = $scope.selectedElement;

        checkElementOk(element, function(result){

            if (result.result == 1)
            {
                for (var collection in $scope._Layer.params.schema)
                {
                    if ( $scope._Layer.params.schema[collection].collectionID == element.collectionID)
                    {
                        for (var e in $scope._Layer.params.schema[collection].elements)
                        {
                            if ($scope._Layer.params.schema[collection].elements[e].elementID == element.elementID)
                            {
                                $scope._Layer.params.schema[collection].elements[e] = element;

                                $scope.layerSelectedElement.elementRole = element.elementRole;
                                $scope.layerSelectedElement.elementType = element.elementType;
                                $scope.layerSelectedElement.elementLabel = element.elementLabel;
                                if (element.defaultAggregation)
                                    $scope.layerSelectedElement.defaultAggregation = element.defaultAggregation;
                                if (element.values)
                                    $scope.layerSelectedElement.values = element.values;
                                if (element.format)
                                    $scope.layerSelectedElement.format = element.format;
                                if (element.associatedElements)
                                    $scope.layerSelectedElement.associatedElements = element.associatedElements;
                                $scope.elementEditing = false;
                                $('#elementModal').modal('hide');
                            }
                        }
                    }
                }
            } else {
                $scope.elementEditingWarning = result.message;
            }
        });
    }

    function  checkElementOk(element, done)
    {
        var isOk = true;
        var message = '';

        if (element.elementType == 'date')
        {
            if (element.extractFromString == true)
            {
                if (!element.yearPositionFrom ) //|| !angular.isNumber(element.yearPositionFrom))
                {

                    isOk = false;
                    message = 'You have to setup a valid "FROM" position number to extract the year from the string';
                }

                if (angular.isNumber(element.yearPositionFrom))
                {

                    isOk = false;
                    message = 'You have to setup a valid "FROM" position number to extract the year from the string';
                }


                if (!element.yearPositionTo || angular.isNumber(element.yearPositionTo))
                {
                    isOk = false;
                    message = 'You have to setup a valid "TO" position number to extract the year from the string';
                }

                if (!element.monthPositionFrom || angular.isNumber(element.monthPositionFrom))
                {
                    isOk = false;
                    message = 'You have to setup a valid "FROM" position number to extract the month from the string';
                }

                if (!element.monthPositionTo || angular.isNumber(element.monthPositionTo))
                {
                    isOk = false;
                    message = 'You have to setup a valid "TO" position number to extract the month from the string';
                }

                if (!element.dayPositionFrom || angular.isNumber(element.dayPositionFrom))
                {
                    isOk = false;
                    message = 'You have to setup a valid "FROM" position number to extract the day from the string';
                }

                if (!element.dayPositionTo || angular.isNumber(element.dayPositionTo))
                {
                    isOk = false;
                    message = 'You have to setup a valid "TO" position number to extract the day from the string';
                }


            }
        }


        var theResult = {};
        if (isOk == true)
            theResult.result = 1;
            else
            theResult.result = 0;

        theResult.message = message;

        done(theResult);

    }

    $scope.zoom = function(ratio)
    {
        var theWidth = 200*ratio+'px';
        var theFontSize = '10px';
        var theIconSize = '12px';


        if (ratio == 0.5)
        {
            theFontSize = '8px';
            theIconSize = '12px';
        }
        if (ratio == 2)
        {
            theFontSize = '12px';
            theIconSize = '14px';
        }

        $('.jtk-field').css('width', theWidth);
        $('.jtk-header').css('width', theWidth);
        $('.window').css('width', theWidth);
        $('.jtk-node').css('width', theWidth);

        $('.jtk-field-label').css('font-size', theFontSize);
        $('.jtk-header').css('font-size', theFontSize);
        $('.window').css('font-size', theFontSize);
        $('.jtk-node').css('font-size', theFontSize);

        $('.jtk-field-icon').css('font-size', theIconSize);
        $('.jtk-field-selected').css('font-size', theIconSize);


        var leftCorrection = (200*ratio) ;

        for (var collection in $scope._Layer.params.schema)
        {
            var theID = $scope._Layer.params.schema[collection].collectionID;

            var p = $(theID);
            var position = p.parent().position();
            var theLeft = position.left;

            $($scope._Layer.params.schema[collection].collectionID).css('left', theLeft+leftCorrection+'px');
        }

            for (var collection in $scope._Layer.params.schema)
            {
                for (var element in $scope._Layer.params.schema[collection].elements)
                {
                    instance.revalidate($scope._Layer.params.schema[collection].elements[element].elementID);
                }
            }
    }

    var setZoom = function(z, el) {
        var p = [ "-webkit-", "-moz-", "-ms-", "-o-", "" ],
            s = "scale(" + z + ")";
        for (var i = 0; i < p.length; i++)
            el.css(p[i] + "transform", s);
        jsPlumb.setZoom(z);
    };



    $scope.addValueToElement = function(element, value, label) {
        if (!element.values) element.values = [];

        element.values.push({value: value, label: label});
    };

    $scope.addAssociatedElementToElement = function(element, associatedElement, isVisible) {
        if (!element.associatedElements) element.associatedElements = [];

        element.associatedElements.push({element: associatedElement, visible: isVisible});
    };

    $scope.addFolder = function()
    {
        var elementID = uuid2.newguid();

        var element = {};
        element.elementLabel = 'my folder';
        element.elementRole = 'folder';
        element.elementID = elementID;
        element.editing = true;
        element.elements = [];
        $scope._Layer.objects.push(element);
    }

    $scope.getView = function (item) {
        if (item) {
            return 'nestable_item.html';
        }
        return null;
    };

    $scope.deleteSchemaElement = function(element)
    {

        var elementID = element.elementID;

        for (var s in $scope._Layer.params.schema)
        {
            for (var e in $scope._Layer.params.schema[s].elements)
            {
                if ($scope._Layer.params.schema[s].elements[e].elementID == elementID)
                {
                    delete $scope._Layer.params.schema[s].elements[e]['elementRole'];
                }
            }
        }

        checkfordelete($scope.rootItem.elements,elementID);

    }

    function checkfordelete(elements,elementID)
    {

        for (var i in elements)
        {

            if (elements[i].elementID == elementID)
            {
                unassingElementRole(elements[i]);
                elements.splice(i,1);
                return;
            } else {
                if (elements[i].elements)
                    if (elements[i].elements.length > 0)
                        checkfordelete(elements[i].elements,elementID);


            }
        }
    }

    function unassingElementRole(element)
    {
        var elementID = element.elementID;

        for (var s in $scope._Layer.params.schema)
        {
            for (var e in $scope._Layer.params.schema[s].elements)
            {
                if ($scope._Layer.params.schema[s].elements[e].elementID == elementID)
                {
                    delete $scope._Layer.params.schema[s].elements[e]['elementRole'];
                }
            }
        }

        if (element.elements)
            if (element.elements.length > 0)
            {
                for (var i in element.elements)
                {
                    unassingElementRole(element.elements[i])
                }
            }
    }

    $scope.onElementTypeChange = function(element) {

        var params = {datasourceID: element.datasourceID,layerID: $scope._Layer._id, collectionID: element.collectionID,collectionName: element.collectionName, elementName: element.elementName, defaultAggregation: element.defaultAggregation};

        if (element.elementType == 'array') {
            connection.get('/api/data-sources/get-element-distinct-values', params, function(data) {
                for (var i in data.items) {
                    $scope.addValueToElement(element, data.items[i]["_id"][element.elementName], data.items[i]["_id"][element.elementName]);
                }
            });
        }
    };


    //Drag & drop elements
    $scope.onDrag = false;
    $scope.sortableOptions = {
        connectWith: ".schema-container",
        update: function(e, ui) {

        },
        start: function(e, ui) {
            $scope.$apply(function () {
                $scope.onDrag = true;
            });
        },
        stop: function(e, ui) {
            $scope.$apply(function () {
                $scope.onDrag = false;
            });
        }
    };


    $scope.deleteCollection = function(collection)
    {
        var theCollectionID = collection.collectionID;

        deleteAllCollectionJoins(theCollectionID);

        deleteAllCollectionElements($scope.rootItem.elements,theCollectionID);

        //delete all joins related to this collection

        for (var c in $scope._Layer.params.schema)
        {
            if ($scope._Layer.params.schema[c].collectionID == theCollectionID)
            {

                for (var element in $scope._Layer.params.schema[c].elements)
                {
                    instance.deleteEndpoint($scope._Layer.params.schema[c].elements[element].elementID);
                    instance.deleteEndpoint($scope._Layer.params.schema[c].elements[element].elementID);
                }
                $scope._Layer.params.schema.splice(c, 1);
            }

        }


        $scope.selectedCollection = undefined;


        //Clear selectedDts if collections == 0
        var totalCollections = 0;

        for (var c in $scope._Layer.params.schema)
        {

            totalCollections = totalCollections +1;

        }

        if (totalCollections == 0)
            $scope.selectedDts = {};

    }



    function deleteAllCollectionJoins(collectionID)
    {
        var joinsToDelete = [];

        for (var o in $scope._Layer.params.schema)
            {
                if ($scope._Layer.params.schema[o].collectionID == collectionID)
                    {
                        for (var e in $scope._Layer.params.schema[o].elements)
                            {
                                for (var j in $scope._Layer.params.joins)
                                    {
                                        if (($scope._Layer.params.joins[j].sourceElementID == $scope._Layer.params.schema[o].elements[e].elementID) ||
                                            ($scope._Layer.params.joins[j].targetElementID == $scope._Layer.params.schema[o].elements[e].elementID))
                                            {

                                                joinsToDelete.push({sourceElementID: $scope._Layer.params.joins[j].sourceElementID,targetElementID: $scope._Layer.params.joins[j].targetElementID});
                                            }
                                    }
                            }
                    }
            }

        for (var jtd in joinsToDelete)
            {
               deleteJoin(joinsToDelete[jtd].sourceElementID,joinsToDelete[jtd].targetElementID);
            }
    }

    function deleteAllCollectionElements(elements,collectionID)
    {
        for( var e=elements.length -1;e>=0;e--)
        //for (var e = elements.length -1 to 0)
        {

            if (elements[e].elements)
                deleteAllCollectionElements(elements[e].elements,collectionID);

            if (elements[e].collectionID == collectionID)
            {
                elements.splice(e, 1);
            }

        }
    }

    $scope.getCollectionElements = function(collectionID)
    {
            if ($scope._Layer)
                if ($scope._Layer.params) {
                        if ($scope._Layer.params.schema) {
                            if ($scope._Layer.params.schema.length > 0) {
                                for (var e in $scope._Layer.params.schema)
                                    {
                                        if ($scope._Layer.params.schema[e].collectionID == collectionID)
                                            return $scope._Layer.params.schema[e].elements;
                                    }
                            }
                        }
                    }



    }

    $scope.checkIfMongoDbForSQL = function()
    {
        for (var i in $scope.datasources)
            {
                if ($scope.selectedDts.id == $scope.datasources[i]._id)
                    {
                        if ($scope.datasources[i].type == 'MONGODB')
                            {
                                $window.alert("SQL Queries are not compatible with MONGODB datasources");
                                $scope.selectedDts.id = undefined;
                            }
                    }
            }
    }

    $scope.openSetup = function() {
        $rootScope.currentModal = $modal.open({templateUrl: 'setupModal', scope: $scope});
    };


     $scope.getDatasetsForThisDts = function (_id, theDataSource)
    {
        if (!theDataSource.loading)
            {
               theDataSource.loading = true;
                    connection.get('/api/data-sources/getEntities', {id: _id}, function(data) {

                        theDataSource.loading = false;
                        if (data.result == 1)
                            {
                                theDataSource.entities = data.items;
                            } else {
                                if (data.actionCode == 'INVALIDATEDTS')
                                    {
                                        theDataSource.status = -1;
                                        theDataSource.statusInfo = {errorCode:data.code,actionCode:data.actionCode,message:data.msg,lastDate:new Date()}
                                    }
                            }
                    });
            }

    }

    $scope.getFieldsForThisEntity = function (dataSourceID,entity, theEntity)
    {
        datasourceModel.getEntitiesSchema([dataSourceID],[entity],function(result){

            if (result.result == 1)
                {
                   theEntity.fields = result.items[0].elements;
                }
            bsLoadingOverlayService.stop({referenceId: 'layerView'});
            });
    }

    $scope.selectedCanvas = function(event)
    {
        unSelect();
        $scope.selectedItem = 'layer';
        $scope.theSelectedElement = $scope._Layer;
        $scope.tabs.selected = 'properties';
    }

    function unSelect()
    {
                for (var s in $scope.selectedElements)
                    {
                       $("#"+$scope.selectedElements[s]).removeClass( "selectedElement" );
                    }
                var connections = instance.getAllConnections();

                    for (var c in connections)
                    {
                        //connections[c].setType("default"); esto cambia el tipo left right, es solo el color lo que queremos cambiar
                        connections[c].setPaintStyle({strokeStyle: "#61B7CF", lineWidth: 4 });
                        connections[c].selected = false;

                    }

                $("#"+$scope.selectedTargetId).css({ backgroundColor: "#D5D5D5" });
                $("#"+$scope.selectedSourceId).css({ backgroundColor: "#D5D5D5" });
                $scope.selectedTargetId = undefined;
                $scope.selectedSourceId = undefined;
                $scope.selectedConnection = undefined;
                $scope.selectedElements = [];
        $scope.selectedItem = '';
    }




    $scope.selectCollection = function(theCollection,event)
    {
        event.stopPropagation();
        if(!event.shiftKey || $scope.selectedItem != 'collection')
        {
           unSelect();
        }

        $scope.selectedItem = 'collection';
        $scope.theSelectedElement = theCollection;
        $scope.selected_name = theCollection.table_name;
        $scope.selected_schema_name = theCollection.schema_name;
        $scope.selected_decription = theCollection.description;
        //if ($scope.joinMode)
          //  collectionHighliter(theCollection.collectionID);

        if ($scope.selectedElements)
            if ($scope.selectedElements.indexOf(theCollection.collectionID) == -1)
                $scope.selectedElements.push(theCollection.collectionID);

        setSelectedElements();

    }


    $scope.selectElement = function(theElement, event)
    {
        event.stopPropagation();
        unSelect();
        $scope.selectedItem = 'element';
        $scope.theSelectedElement = theElement;
        $scope.selected_name = theElement.column_name;
        $scope.selected_schema_name = theElement.table_schema;
        $scope.selected_table_name = theElement.table_name;
        $scope.selected_decription = theElement.description;
        $scope.selected_data_type = theElement.data_type;
        if (theElement.isPK == true)
            $scope.selected_primary_key = true
            else
            $scope.selected_primary_key = false;

        if ($scope.selectedElements)
            if ($scope.selectedElements.indexOf(theElement.elementID) == -1)
                $scope.selectedElements.push(theElement.elementID);

        setSelectedElements();
    }

    $scope.showStatusInfo = function(statusInfo)
    {
        $scope.statusInfo = statusInfo;
        $('#statusInfo').modal('show');
    }

    function setSelectedElements()
    {
        for (var s in $scope.selectedElements)
            {
               $("#"+$scope.selectedElements[s]).addClass( "selectedElement" );
            }
        $scope.tabs.selected = 'properties';
    }

        $scope.addDatasetToLayer = function (datasourceID,entity)
    {

            if ($scope.selectedDts.id == undefined || $scope.selectedDts.id == datasourceID)
                {
                    datasourceModel.getEntitiesSchema(datasourceID,[entity],function(result){

                        if (result.result == 1)
                        {
                            for (i in result.items)
                            {
                                result.items[i].datasourceID = datasourceID;
                                $scope.selectedDts.id = datasourceID;

                                for (e in result.items[i].elements)
                                {
                                    result.items[i].elements[e].datasourceID = datasourceID;
                                    result.items[i].elements[e].collectionID = result.items[i].collectionID;
                                    result.items[i].elements[e].collectionName = result.items[i].collectionName;
                                }

                                if (!$scope._Layer.params)
                                    $scope._Layer.params = {};
                                if (!$scope._Layer.params.schema)
                                    $scope._Layer.params.schema = [];


                                $scope._Layer.params.schema.push(result.items[i]);

                                setTimeout(function () {

                                for (var element in result.items[i].elements)
                                    {
                                        if (!result.items[i].elements[element].painted || result.items[i].elements[element].painted == false)
                                        {
                                            _addEndpoints(result.items[i].elements[element].elementID, [ "RightMiddle"], ["LeftMiddle"]);
                                        }


                                    }
                                    var targetID = '#'+result.items[i].collectionID+'-parent';
                                    setDraggable(".window");

                                },100);

                            }
                        $scope.erDiagramInit();
                        }
                    });
                } else {
                    toastr.error('Datasource must be the same for all entities');
                }



    }

    $scope.deleteObject = function(object,objectType)
    {
        if ($scope.selectedItem == 'join')
            {
                deleteJoin($scope.theSelectedElement.sourceElementID,$scope.theSelectedElement.targetElementID);
                unSelect();

            }
        if ($scope.selectedItem == 'collection')
            {
                $scope.deleteCollection($scope.theSelectedElement);
                unSelect();
            }

    }

    function unSelect()
    {
        $scope.selectedItem = '';
        $scope.theSelectedElement = undefined;
        $scope.tabs.selected = 'elements';
    }

    /*
    function collectionHighliter(collectionID)
    {
        var collectionsFound = [];
        showAll();

        for (var j in $scope.joins)
                {
                    var found = false;

                    if ($scope.joins[j].foreign_collectionID == collectionID)
                        {
                            if (collectionsFound.indexOf($scope.joins[j].collectionID) == -1)
                                collectionsFound.push($scope.joins[j].collectionID);
                            found = true;
                        }
                    if ($scope.joins[j].collectionID == collectionID)
                        {
                            if (collectionsFound.indexOf($scope.joins[j].foreign_collectionID) == -1)
                                collectionsFound.push($scope.joins[j].foreign_collectionID);
                            found = true;
                        }

                    if (found == false)
                        {
                            $scope.instance.hide($scope.joins[j].joinID);
                            $("#"+$scope.joins[j].joinID ).hide();
                            $.each($scope.instance.getAllConnections(), function(idx, connection) {
                                if (connection.id == $scope.joins[j].joinID)
                                    {
                                        connection.setVisible(false);
                                        for (var e in connection.endpoints)
                                            {
                                              connection.endpoints[e].setVisible(false);
                                            }
                                    }

                            });
                        }

                }



        for (var t in $scope.tables)
            {
                if (collectionsFound.indexOf($scope.tables[t].collectionID) == -1 && $scope.tables[t].collectionID != collectionID)
                   {
                      $("#"+$scope.tables[t].collectionID+"-parent" ).hide();
                   }

            }


    }

     function showAll()
    {
        for (var t in $scope.tables)
            {
                $("#"+$scope.tables[t].collectionID+"-parent" ).show();
            }
        $.each($scope.instance.getAllConnections(), function(idx, connection) {

            connection.setVisible(true);
            for (var e in connection.endpoints)
                {
                  connection.endpoints[e].setVisible(true);
                }
        });
    }




    $(document).keyup(function(e){
        if(e.keyCode == 46){
            if(connection != null){
                jsPlumb.detach(connection);
                connection = null;
            }

            if($scope.theSelectedElement != null){
                $scope.instance.remove($scope.theSelectedElement);
                $scope.theSelectedElement = null;
            }
        }

    })
 */


});
