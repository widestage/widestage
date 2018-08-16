app.service('queryModel' , function ($http, $q, $filter, connection, $compile, $rootScope,uuid2) {
    this.data = null;
    this.scope = null;
    this.reverse = false;
    this.predicate = undefined;
    this.selectedReport = null;
    var wrongFilters = [];
    var query = {};
    query.id = uuid2.newguid();
    this.query = function()
    {
        return query;
    }

    var datasources = [];
    var queries = [];
    this.queries = function()
    {
        return queries;
    }

    var layers = [];
    this.layers = function()
    {
        return layers;
    }

    var selectedLayer = undefined;

    function setSelectedLayer(layer)
    {
       selectedLayer = layer;
        selectedLayerID = layer._id;
        query.selectedLayerID = layer._id;
        rootItem.elements = layer.objects;
        calculateIdForAllElements(rootItem.elements);
    }

    this.changeLayer = function(selectedLayerID)
    {
        for (var i in layers)
        {
            if (layers[i]._id == selectedLayerID)
            {
                setSelectedLayer(layers[i]);
            }
        }
    }

    var selectedLayerID = undefined;
    this.selectedLayerID = function()
    {
        return selectedLayerID;
    }

    var rootItem = {elementLabel: '', elementRole: 'root', elements: []};
    this.rootItem = function()
    {
        return rootItem;
    }

    var page = 0;
    var pages = 0;

    this.initQuery = function() {
        query = {};
        query.id = uuid2.newguid();
        query.columns = [];
        query.order = [];
        query.groupFilters = [];
        dataSources = [];
        queries = [];
        if (selectedLayer)
            detectLayerJoins();
    }

    this.loadQuery = function(theQuery)
    {


        query = theQuery;
        query.selectedLayerID = query.layers[0];
        for (var i in layers)
                              {
                                  if (layers[i]._id == query.selectedLayerID)
                                      {
                                           // selectedLayer = layers[i];
                                          setSelectedLayer(layers[i])
                                      }
                              }
    }

    this.filterStringOptions = [
                                    {value:"equal",label:"equal"},
                                    {value:"in",label:"in"},
                                    {value:"diferentThan",label:"different than"},
                                    {value:"notIn",label:"not in"},
                                    {value:"biggerThan",label:"bigger than"},
                                    {value:"biggerOrEqualThan",label:"bigger or equal than"},
                                    {value:"lessThan",label:"less than"},
                                    {value:"lessOrEqualThan",label:"less or equal than"},
                                    {value:"between",label:"between"},
                                    {value:"notBetween",label:"not between"},
                                    {value:"contains",label:"contains"},
                                    {value:"notContains",label:"not contains"},
                                    {value:"startWith",label:"start with"},
                                    {value:"notStartWith",label:"not start with"},
                                    {value:"endsWith",label:"ends with"},
                                    {value:"notEndsWith",label:"not ends with"},
                                    {value:"like",label:"like"},
                                    {value:"notLike",label:"not like"},
                                    {value:"null",label:"is null"},
                                    {value:"notNull",label:"is not null"}

                                    ];
    this.filterArrayOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},   //TODO: el different than no está funcionando
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"},
        {value:"in",label:"in"},
        {value:"notIn",label:"not in"}
    ];

    this.filterNumberOptions = [
        {value:"equal",label:"equal"},
        {value:"in",label:"in"},
        {value:"diferentThan",label:"different than"},
        {value:"notIn",label:"not in"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"},
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"}

        /* RANKING
        el (los) primeros
        el (los) ultimos
        el (los) primeros %
        el (los) ultimos % */

    ];

    this.signalOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"}
    ];

    this.getDatePatternFilters = function()
    {
        return this.datePatternFilters;
    }

    this.datePatternFilters = [
        {value:"#WST-TODAY#",label:"Today"},
        {value:"#WST-THISWEEK#",label:"This week"},
        {value:"#WST-THISMONTH#",label:"This month"},
        {value:"#WST-THISYEAR#",label:"This year"},
        {value:"#WST-FIRSTQUARTER#",label:"First quarter"},
        {value:"#WST-SECONDQUARTER#",label:"Second quarter"},
        {value:"#WST-THIRDQUARTER#",label:"Third quarter"},
        {value:"#WST-FOURTHQUARTER#",label:"Fourth quarter"},
        {value:"#WST-FIRSTSEMESTER#",label:"First semester"},
        {value:"#WST-SECONDSEMESTER#",label:"Second semester"},
        {value:"#WST-YESTERDAY#",label:"Yesterday"},
        {value:"#WST-LASTWEEK#",label:"Last week"},
        {value:"#WST-LASTMONTH#",label:"Last month"},
        {value:"#WST-LASTYEAR#",label:"Last year"},
        {value:"#WST-LYFIRSTQUARTER#",label:"Last year first quarter"},
        {value:"#WST-LYSECONDQUARTER#",label:"Last year second quarter"},
        {value:"#WST-LYTHIRDQUARTER#",label:"Last year third quarter"},
        {value:"#WST-LYFOURTHQUARTER#",label:"Last year fourth quarter"},
        {value:"#WST-LYFIRSTSEMESTER#",label:"Last year first semester"},
        {value:"#WST-LYSECONDSEMESTER#",label:"Last year second semester"}
    ]

    this.filterDateOptions = [
        {value:"equal",label:"equal"},
        {value:"equal-pattern",label:"equal (pattern)"},
        //{value:"in",label:"in"},
        {value:"diferentThan",label:"different than"},
        {value:"diferentThan-pattern",label:"different than (pattern)"},
        //{value:"notIn",label:"not in"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerThan-pattern",label:"bigger than (pattern)"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"biggerOrEqualThan-pattern",label:"bigger or equal than (pattern)"},
        {value:"lessThan",label:"less than"},
        {value:"lessThan-pattern",label:"less than (pattern)"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"lessOrEqualThan-pattern",label:"less or equal than (pattern)"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"},
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"}
        //TODO: in , not in or date elements
    ];

    this.fieldsAggregations = {
        'number': [
            {name: 'Sum', value: 'sum'},
            {name: 'Avg', value: 'avg'},
            {name: 'Min', value: 'min'},
            {name: 'Max', value: 'max'},
            {name: 'Count', value: 'count'},
            {name: 'Raw', value:'original'}
        ],
        'date': [
            {name: 'Year', value: 'year'},
            {name: 'Month', value: 'month'},
            {name: 'Day', value: 'day'},
            {name: 'Count', value: 'count'},
            {name: 'Raw', value:'original'}
            /*{name: 'Semester', value: 'semester'},
            {name: 'Quarter', value: 'quarter'},
            {name: 'Trimester', value: 'trimester'}*/
        ],
        'string': [
            {name: 'Count', value: 'count'},
            {name: 'Raw', value:'original'}
        ]
    };

    this.conditionTypes = [
        {conditionType: 'and', conditionLabel: 'AND'},
        {conditionType: 'or', conditionLabel: 'OR'},
        {conditionType: 'andNot', conditionLabel: 'AND NOT'},
        {conditionType: 'orNot', conditionLabel: 'OR NOT'}
    ];


    this.getElementFilterOptions = function(elementType)
    {
        if (elementType == 'array')
            return  this.filterArrayOptions;
        if (elementType == 'string')
           return  this.filterStringOptions;
        if (elementType == 'number')
            return  this.filterNumberOptions;
        if (elementType == 'date')
            return this.filterDateOptions
    }


    this.removeQueryItem = function(object,type)
    {
        if (type == 'column')
                {
                    if (query.columns)
                        $rootScope.removeFromArray(query.columns, object);

                    for (var i in query.columns)
                        {
                            if (query.columns[i].elementID == object.elementID)
                                {

                                    query.columns.splice(i,1);
                                }
                        }
                }

        if (type == 'order')
                {
                    $rootScope.removeFromArray(query.order, object);
                    for (var i in query.order)
                        {
                            if (query.order[i].elementID == object.elementID)
                                {

                                    query.order.splice(i,1);
                                }
                        }
                }

       if (type == 'filter')
                {

                     $rootScope.removeFromArray(query.groupFilters, object);

                   /* for (var i in query.groupFilters)
                        {
                            if (query.groupFilters[i].elementID == object.elementID)
                                {

                                    query.groupFilters.splice(i,1);
                                }
                        }*/
                }

        detectLayerJoins();

    }

    this.getQueryData = function( done) {
        getQueryData(done);
    }

    this.getQueryData = function(queryObject, done) {
        query = queryObject;
        getQueryData(done);
    }


    function getQueryData(done)
    {
            var params = {};
            cleanQuery(query);
            wrongFilters = [];
            checkFilters(query.groupFilters);

            if (wrongFilters.length == 0)
                    {
                        params.query = angular.copy(query);

                        connection.get('/api/reports/get-data', params, function(data) {
                           var sql = data.sql;

                            if (data.result == 0)
                            {
                                noty({text: data.msg,  timeout: 2000, type: 'error'});
                                done([],sql,query);
                            } else {
                                prepareData(query,data.data, function(result)
                                {
                                    done(result,sql,query);
                                });
                            }


                        });
                    } else {

                        done([],'',query);
                    }
    };

    this.getQueryDataNextPage = function(page, done) {
        getQueryDataNextPage(page,done);
    }

    function getQueryDataNextPage(page, done)
    {
        var params = {};
            wrongFilters = [];
            checkFilters(query.groupFilters);

            if (wrongFilters.length == 0)
                    {
                        params.query = angular.copy(query);
                        cleanQuery(params.query);
                        params.page = page;

                        connection.get('/api/reports/get-data', params, function(data) {
                           var sql = data.sql;
                            if (data.result == 0)
                            {
                                noty({text: data.msg,  timeout: 2000, type: 'error'});
                                done([],sql,query);
                            } else {
                                prepareData(query,data.data, function(result)
                                {
                                    done(result,sql,query);
                                });


                            }
                        });
                    } else {
                        done([],'',query);
                    }
    }

    function cleanQuery(theQuery)
    {
        theQuery.data = [];
        for (f in theQuery.groupFilters)
            {
                theQuery.groupFilters[f].data = [];
                theQuery.groupFilters[f].values = [];
            }
        for (var c in theQuery.collections)
            {
                for (var cf in theQuery.collections[c].filters)
                    {
                        theQuery.collections[c].filters[cf].data = [];
                        theQuery.collections[c].filters[cf].values = [];
                    }
            }
    }

    function getData(query, params,  done) {
        params.query = query;

        connection.get('/api/reports/get-data', params, function(data) {
            if (data.result == 0)
                {
                    noty({text: data.msg,  timeout: 2000, type: 'error'});
                    done([]);
                } else {
                    done(data.data,data.sql,query);
                }
        });
    }

    function prepareData(query,data,done)
    {
        var dateTimeReviver = function (key, value) {
            var a;
            if (typeof value === 'string') {
                a = /\/Date\((\d*)\)\//.exec(value);
                if (a) {
                    return new Date(+a[1]);
                }
            }
            return value;
        }

        if (data != undefined)
            done(JSON.parse(JSON.stringify(data),dateTimeReviver));
    }

    this.getDistinct = function($scope,attribute,done) {

        var execute = (typeof execute !== 'undefined') ? execute : true;

        var query = {};
        query.id = uuid2.newguid();
        query.datasources = [];
        query.columns = [];
        query.order = [];

        var datasourcesList = [];
        var layersList = [];
        layersList.push(selectedLayerID);
        datasourcesList.push(attribute.datasourceID);
        layersList.push(attribute.layerID);

        for (var i in datasourcesList) {
            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];
            dtsCollections.push(attribute.collectionID);

            for (var n in dtsCollections) {

                var collection = {};
                collection.collectionID = dtsCollections[n];

                collection.columns = [];
                collection.columns.push(attribute);

                collection.order = [];
                collection.order.push(attribute);

                for (var n1 in query.order) {
                    if (query.order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push(query.order[n1]);
                    }
                }

                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }

        query.layers = layersList;
        //query.order = [];
        //query.order.push(attribute);

        getData(query, {page: 0}, function(data,sql) {

            if (data.items)
                data = data.items;

            attribute.data = data;
            $scope.searchValues = data;
            $scope.errorMsg = (data.result === 0) ? data.msg : false;
            page = data.page;
            pages = data.pages;

            done(data,sql);
            //$scope.data = data;

        });
    }


    this.getDistinctFiltered = function(attribute,search,done) {

        if (attribute)
            {

        var execute = (typeof execute !== 'undefined') ? execute : true;

        var query = {};
        query.id = uuid2.newguid();
        query.datasources = [];
        query.columns = [];
        query.order = [];


        var datasourcesList = [];
        var layersList = [];
        layersList.push(selectedLayerID);
        datasourcesList.push(attribute.datasourceID);
        layersList.push(attribute.layerID);

        for (var i in datasourcesList) {
            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];
            dtsCollections.push(attribute.collectionID);

            for (var n in dtsCollections) {

                var collection = {};
                collection.collectionID = dtsCollections[n];

                collection.columns = [];
                collection.columns.push(attribute);

                collection.order = [];
                collection.order.push(attribute);

                for (var n1 in query.order) {
                    if (query.order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push(query.order[n1]);
                    }
                }

                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }

        query.layers = layersList;
        //query.order = [];
        //query.order.push(attribute);
        getData(query, {page: 0}, function(data,sql) {
            done(data,sql);
        });
            }
    }

    this.getFilterValues = function(attribute,done) {

        var execute = (typeof execute !== 'undefined') ? execute : true;

        var query = {};
        query.id = uuid2.newguid();
        query.datasources = [];
        query.columns = [];
        query.order = [];

        var datasourcesList = [];
        var layersList = [];
        layersList.push(selectedLayerID);
        datasourcesList.push(attribute.datasourceID);
        layersList.push(attribute.layerID);

        for (var i in datasourcesList) {
            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];
            dtsCollections.push(attribute.collectionID);

            for (var n in dtsCollections) {

                var collection = {};
                collection.collectionID = dtsCollections[n];

                collection.columns = [];
                collection.columns.push(attribute);

                collection.order = [];
                collection.order.push(attribute);

                for (var n1 in query.order) {
                    if (query.order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push(query.order[n1]);
                    }
                }

                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }

        query.layers = layersList;
        //query.order = [];
        //query.order.push(attribute);

        getData(query, {page: 0}, function(data,sql) {

            if (data.items)
                data = data.items;

            attribute.data = data;
            //$scope.searchValues = data;
            //$scope.errorMsg = (data.result === 0) ? data.msg : false;
            page = data.page;
            pages = data.pages;
            //$scope.data = data;
            done(data,sql);
        });
    }


    this.onDateSet = function (newDate, oldDate, filter) {
        if (angular.isDate(newDate))
            {
                var year = newDate.getFullYear();
                var month = pad(newDate.getMonth()+1,2);
                var day = pad(newDate.getDate(),2);
                var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
                if (filter.filterType == 'in' || filter.filterType == 'notIn')
                {
                    if (!filter.filterText1)
                        filter.filterText1 = [];
                    filter.filterText1.push(theDate);
                } else
                    filter.filterText1 = theDate;

                filter.searchValue = theDate;
                filter.filterValue = theDate;
                filter.dateCustomFilterLabel = undefined;
            }
    }

    this.onDateEndSet = function (newDate, oldDate, filter) {
        if (angular.isDate(newDate))
            {
                var year = newDate.getFullYear();
                var month = pad(newDate.getMonth()+1,2);
                var day = pad(newDate.getDate(),2);
                var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
                filter.filterText2 = theDate;
                filter.dateCustomFilterLabel = undefined;
            }
    }


    this.layers = function()
    {
        return layers;
    }

    this.getLayers = function(done) {


        if (layers.length == 0)
            {
                connection.get('/api/layers/get-layers', {}, function(data) {
                    //$scope.errorMsg = (data.result === 0) ? data.msg : false;

                    if (data.result == 1)
                        {
                            page = data.page;
                            pages = data.pages;
                            layers = data.items;
                            if (selectedLayerID)
                                {
                                  for (var i in data.items)
                                      {
                                          if (data.items[i]._id == selectedLayerID)
                                              {
                                                    rootItem.elements = data.items[i].objects;
                                                   selectedLayer = data.items[i];

                                              }
                                      }
                                } else {
                                    if (data.items.length) {
                                        setSelectedLayer(data.items[0]);
                                    } else {
                                        // TODO Add correct error notification for user
                                        console.error('There is no active layer');
                                    }
                                }

                            calculateIdForAllElements(rootItem.elements);
                            done(layers,selectedLayerID);
                        }
                });
            }
    };

    function pad(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        while (s.length < size) s = "0" + s;
        return s;
    }

    this.calculateIdForAllElements = function(elements)
    {
        calculateIdForAllElements(elements);
    }


    function calculateIdForAllElements(elements)
    {
        for (var e in elements)
        {
                if (elements[e].collectionID)
                {
                //var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;

                if (!elements[e].aggregation)
                    var elementID = 'wst'+elements[e].elementID.toLowerCase();
                    else
                    var elementID = 'wst'+elements[e].elementID.toLowerCase()+elements[e].aggregation;

                elements[e].id = elementID.replace(/[^a-zA-Z ]/g,'');
                }

            if (elements[e].elements)
                calculateIdForAllElements(elements[e].elements);
        }
    }

    this.detectLayerJoins = function()
    {
        detectLayerJoins();
    }

    function detectLayerJoins()
    {
        if (layers.length > 0)
            {
        checkChoosedElements();

        generateQuery();

            //this function enables and disables elements in the layer if there is a join between the elements in the report and the element in the layer...
            var reportCollections = [];
            var selectableCollections = [];

            for (var i in query.datasources) {
                for (var c in query.datasources[i].collections) {
                     reportCollections.push(query.datasources[i].collections[c].collectionID);
                     selectableCollections.push(query.datasources[i].collections[c].collectionID);
                }
            }

        if (!selectedLayer)
            {
                for (var i in layers)
                    {
                        if (layers[i]._id == query.selectedLayerID)
                            {
                                selectedLayer = layers[i];


                            }
                    }
            }

                    if (selectedLayer.params && selectedLayer.params.joins)
                    for (var j in selectedLayer.params.joins)
                    {
                        for (var c in reportCollections)
                        {
                            if (selectedLayer.params.joins[j].sourceCollectionID == reportCollections[c])
                            {
                                     if (selectableCollections.indexOf(selectedLayer.params.joins[j].sourceCollectionID) == -1)
                                         selectableCollections.push(selectedLayer.params.joins[j].sourceCollectionID);

                                     if (selectableCollections.indexOf(selectedLayer.params.joins[j].targetCollectionID) == -1)
                                         selectableCollections.push(selectedLayer.params.joins[j].targetCollectionID);
                            }

                            if (selectedLayer.params.joins[j].targetCollectionID == reportCollections[c])
                            {
                                if (selectableCollections.indexOf(selectedLayer.params.joins[j].sourceCollectionID) == -1)
                                    selectableCollections.push(selectedLayer.params.joins[j].sourceCollectionID);

                                if (selectableCollections.indexOf(selectedLayer.params.joins[j].targetCollectionID) == -1)
                                    selectableCollections.push(selectedLayer.params.joins[j].targetCollectionID);
                            }
                        }
                    }

                    if (selectableCollections.length == 0)
                        enableAllElements(rootItem.elements);
                    else
                        detectLayerJoins4Elements(rootItem.elements,selectableCollections);
            }

    }

    function detectLayerJoins4Elements(elements,selectableCollections)
    {
        for (var e in elements)
        {
            if (elements[e].elementRole != 'folder')
            {
                if (selectableCollections.indexOf(elements[e].collectionID) == -1)
                {
                    elements[e].enabled = false;
                 } else {
                    elements[e].enabled = true;
                }

            }
            if (elements[e].elements)
                detectLayerJoins4Elements(elements[e].elements,selectableCollections);

        }
    }


    this.enableAllElements = function()
    {
        enableAllElements(rootItem.elements);
    }

    function enableAllElements(elements)
    {
        for (var e in elements)
        {
            if (elements[e].elementRole != 'folder')
            {
                    elements[e].enabled = true;
            }

            if (elements[e].id == undefined)
            {
                if (elements[e].collectionID)
                    {
                       //var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;
                        var elementID = 'wst'+elements[e].elementID.toLowerCase();

                        if (elements[e].aggregation)
                          var elementID = 'wst'+elements[e].elementID.toLowerCase()+elements[e].aggregation;

                        elements[e].id = elementID.replace(/[^a-zA-Z ]/g,'');
                    }

            }

            if (elements[e].elements)
                enableAllElements(elements[e].elements);
        }
    }


    function checkFilters(thefilters)
    {
        for (var g in thefilters) {
                var filter = thefilters[g];
                if (filter)
                    {
                        /*if ((filter.searchValue == undefined || filter.searchValue == '' || filter.searchValue == 'Invalid Date') && filter.filterPrompt == false )
                            {
                            wrongFilters.push(filter.id);
                            } else {
                               if ((filter.filterType == 'between' || filter.filterType == 'notBetween') && (filter.filterText2 == undefined || filter.filterText2 == '' || filter.filterText2 == 'Invalid Date'))
                                    wrongFilters.push(filter.id);
                            }*/

                        if (isfilterComplete(filter) == false && filter.promptMandatory == true)
                             wrongFilters.push(filter.id);

                        if (filter.group == true)
                        {
                            checkFilters(filter.filters)
                        }
                    }
            }
    }


    var lastDrop = null;


    // Drop handler.
    this.onDrop = function ($scope,data, event, type, group, done) {
        event.stopPropagation();
        if (lastDrop && lastDrop == 'onFilter') {
            lastDrop = null;
            return;
        }

        // Get custom object data.
        var customObjectData = data['json/custom-object']; // {foo: 'bar'}

        // Get other attached data.
        var uriList = data['text/uri-list']; // http://mywebsite.com/..


        if (type == 'column') {
            if (!query.columns)
                 query.columns = [];
            query.columns.push(customObjectData);

            }

        if (type == 'order') {
            customObjectData.sortType = -1;
            query.order.push(customObjectData);
        }
        if (type == 'filter') {

            var el = document.getElementById('filter-zone');
            if (query.groupFilters.length > 0)
            {
               customObjectData.condition = 'AND';
               customObjectData.conditionLabel = 'AND';
            }

            query.groupFilters.push(customObjectData);
            this.filtersUpdated();

        }
        if (type == 'group') {

            query.groupFilters.push(customObjectData);
            this.filtersUpdated();
        }


        detectLayerJoins();

        processStructure(undefined,done);
    };

    this.addColumn = function (element, done) {

        if (!query.columns)
                 query.columns = [];
            query.columns.push(element);
        detectLayerJoins();

        processStructure(undefined,done);
    }

   /* this.onDropOnFilter = function (data, event, filter) {
        lastDrop = 'onFilter';

        var droppedFilter = data['json/custom-object'];

        filter.filters = [jQuery.extend({}, filter), droppedFilter];

        filter.group = true;

        updateConditions(filter.filters);

        delete(filter.collectionID);
        delete(filter.datasourceID);
        delete(filter.elementID);
        delete(filter.elementName);
        delete(filter.elementType);
        delete(filter.filterType);
        delete(filter.filterTypeLabel);
        delete(filter.objectLabel);
        delete(filter.filterText1);
        delete(filter.filterText2);

        event.stopPropagation();
        return;
    };*/

    function checkChoosedElements()
    {
        if (query.columns.length > 1)
        {
            for( var e=query.columns.length -1;e>=0;e--)
            {
                if (thereIsAJoinForMe(query.columns[e]) == 0)
                {
                    query.columns.splice(e,1);
                }
            }
        }
    }


    this.generateQuery = function()
    {
        return generateQuery();
    }

    this.hideColumn = function(elementID,hidden)
    {
        for( var i  in query.columns)
            {
                if (query.columns[i].elementID == elementID)
                {
                    query.columns[i].hidden = hidden;
                }

            }
    }

    function generateQuery()
    {
        query.id = uuid2.newguid();
        query.datasources = [];
        query.wrongFilters = wrongFilters;
        var datasourcesList = [];
        var layersList = [];
        layersList.push(selectedLayerID);

        for (var i in query.columns) {
            if (datasourcesList.indexOf(query.columns[i].datasourceID) == -1)
                datasourcesList.push(query.columns[i].datasourceID);
            if (layersList.indexOf(query.columns[i].layerID) == -1)
                layersList.push(query.columns[i].layerID);
        }


        for (var i in query.groupFilters) {
                if (datasourcesList.indexOf(query.groupFilters[i].datasourceID) == -1)
                    datasourcesList.push(query.groupFilters[i].datasourceID);
                if (layersList.indexOf(query.groupFilters[i].layerID) == -1)
                    layersList.push(query.groupFilters[i].layerID);
        }


        for (var i in query.order) {
                if (datasourcesList.indexOf(query.order[i].datasourceID) == -1)
                    datasourcesList.push(query.order[i].datasourceID);
                if (layersList.indexOf(query.order[i].layerID) == -1)
                    layersList.push(query.order[i].layerID);
        }

        for (var i in datasourcesList) {

            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];


            for (var z in query.columns) {
                if (query.columns[z].datasourceID == datasourcesList[i])
                {
                    if (dtsCollections.indexOf(query.columns[z].collectionID) == -1)
                        dtsCollections.push(query.columns[z].collectionID);
                }
            }

            for (var z in query.order) {
                if (query.order[z].datasourceID == datasourcesList[i])
                {
                    if (dtsCollections.indexOf(query.order[z].collectionID) == -1)
                        dtsCollections.push(query.order[z].collectionID);
                }
            }


            getFiltersCollections(query.groupFilters,dtsCollections,datasourcesList[i], function(){

                        for (var n in dtsCollections) {

                            var collection = {};
                            collection.collectionID = dtsCollections[n];

                            collection.columns = [];

                            for (var n1 in query.columns) {
                                if (query.columns[n1].collectionID == dtsCollections[n])
                                {
                                    collection.columns.push(query.columns[n1]);
                                }
                            }

                            collection.order = [];

                            for (var n1 in query.order) {
                                if (query.order[n1].collectionID == dtsCollections[n])
                                {
                                    collection.order.push(query.order[n1]);
                                }
                            }


                            collection.filters = [];
                             for (var n1 in query.groupFilters) {
                                /*for (var n1f in query.filters[n1].filters)
                                {
                                if (query.filters[n1].filters[n1f].collectionID)
                                    if (query.filters[n1].filters[n1f].collectionID == dtsCollections[n])
                                        {
                                            collection.filters.push(query.filters[n1].filters[n1f]);
                                        }
                                }*/

                                if (query.groupFilters[n1].collectionID)
                                    if (query.groupFilters[n1].collectionID == dtsCollections[n])
                                        {
                                            //collection.filters.push(angular.copy(query.groupFilters[n1]));
                                        }

                             }

                            dtsObject.collections.push(collection);

                        }



                        query.datasources.push(dtsObject);
                        query.layers = layersList;

            });

        }

       // query.groupFilters = filters;

        return query;
    }


    function getFiltersCollections(thefilters,dtsCollections,dtsID,done)
    {

        for (var z in thefilters) {
                if (thefilters[z].datasourceID == dtsID)
                            {
                                    if (dtsCollections.indexOf(thefilters[z].collectionID) == -1)
                                    {
                                        dtsCollections.push(thefilters[z].collectionID);
                                    }
                            }
            }

        done();
    }
/*
    function getGroupCollections(theGroup,dtsCollections,dtsID,isRoot,done)
    {
            for (var ff in theGroup)
                {
                    if (theGroup[ff].datasourceID)
                      {
                        if (theGroup[ff].datasourceID == dtsID)
                            {
                                    if (dtsCollections.indexOf(theGroup[ff].collectionID) == -1)
                                    {
                                        dtsCollections.push(theGroup[ff].collectionID);
                                    }
                            }
                        }
                        var well = theGroup[ff];

                       if (theGroup[ff].group == true)
                        {
                            getGroupCollections(theGroup[ff].filters,dtsCollections,false,done);
                        }

                }

            if (isRoot == true)
                done();

    }
*/
    this.processStructure = function(execute, done)
    {
        processStructure(execute,done);
    }

    function processStructure(execute,done) {
        var execute = (typeof execute !== 'undefined') ? execute : true;
        wrongFilters = [];
        checkFilters(query.groupFilters);
            if (wrongFilters.length == 0)
                {
                    $('#reportLayout').empty();
                    if (query.columns.length > 0 && execute)
                        {
                          if (done)
                              done(true);
                        } else {
                            if (done)
                              done(false);
                        }


                } else {
                    //var errorMsg = 'There are incomplete filters'
                    //noty({text: errorMsg,  timeout: 6000, type: 'error'});
                }

    }


    function thereIsAJoinForMe(element)
    {
        var found = 0;
        for (var i in query.columns)
        {
             if (element.elementID != query.columns[i].elementID)
             {
                 if (joinExists(element.collectionID,query.columns[i].collectionID) || (element.collectionID == query.columns[i].collectionID))
                    found = found+1;
             }
        }

        return found;
    }

    function joinExists(collection1,collection2)
    {
        var found = false;


        if (!selectedLayer || !selectedLayer.params || !selectedLayer.params.joins) return false;


        if (collection1 != collection2)
        {
            for (var j in selectedLayer.params.joins)
            {
                if ((selectedLayer.params.joins[j].sourceCollectionID == collection1 && selectedLayer.params.joins[j].targetCollectionID == collection2) ||
                    (selectedLayer.params.joins[j].sourceCollectionID == collection2 && selectedLayer.params.joins[j].targetCollectionID == collection1))
                {
                    found = true;
                }
            }
        } else
            found = true;

        return found;
    }


    this.updateCondition = function(filter, condition) {
        filter.conditionType = condition.conditionType;
        filter.conditionLabel = condition.conditionLabel;
        this.processStructure();
    };


    this.filtersUpdated = function(theFilters, mainFilters) {
        var theFilters = (theFilters) ? theFilters : query.groupFilters;
        var mainFilters = (typeof mainFilters === 'undefined') ? true : mainFilters;
    };
/*
    function updateGroups(theFilters, mainFilters) {
        var theFilters = (theFilters) ? theFilters : query.groupFilters;

        for (var i in theFilters) {
            if (theFilters[i])
                if (theFilters[i].group && theFilters[i].filters.length == 0 && !mainFilters) {
                    theFilters.splice(i, 1);
                    updateConditions(theFilters);
                    return updateGroups(theFilters, mainFilters);
                }
        }
    };
*/
    function updateConditions(theFilters) {
        var theFilters = (theFilters) ? theFilters : query.groupFilters;
        for (var i in theFilters) {
            if (i%2) { //must be condition
                if (!theFilters[i].condition) {
                    theFilters.splice(i, 0, {
                        condition: true,
                        conditionType: 'and',
                        conditionLabel: 'AND'
                    });
                    return updateConditions(theFilters);
                }
                else { //is a condition, next is a filter?
                    if (theFilters[Number(i)+1]) {
                        if (theFilters[Number(i)+1].condition) { //if next is a condition
                            theFilters.splice(i, 1);
                            return updateConditions(theFilters);
                        }
                    }
                    else {
                        theFilters.splice(i, 1);
                        return updateConditions(theFilters);
                    }
                }
            }
            else { //must not be condition
                if (theFilters[i])
                    if (theFilters[i].condition) {
                        theFilters.splice(i, 1);
                        return updateConditions(theFilters);
                    }
            }
        }
    };


    this.setFilterType = function(filter, filterOption)
    {
        filter.filterType = filterOption.value;
        filter.filterTypeLabel = filterOption.label;

        if (filter.filterType == 'in' || filter.filterType == 'notIn')
        {
            filter.filterText1 = [];
            filter.filterLabel1 = [];
        } else {
            filter.filterText1 = '';
            filter.filterLabel1 = '';
            filter.filterText2 = '';
            filter.filterLabel2 = '';
        }
        //set the appropiate interface for the choosed filter relation

    }

    this.orderColumn = function(predicate) {
        this.reverse = (this.predicate === predicate) ? !this.reverse : false;
        this.predicate = predicate;
    };


    this.isfilterComplete = function(filter)
    {
        return isfilterComplete(filter);
    }

    function isfilterComplete(filter)
    {
        var result = true;
        if ((filter.searchValue == '' || filter.searchValue == undefined || filter.searchValue == 'Invalid Date') )
            {
                result = false;

            } else {
                if ((filter.filterType == 'between' || filter.filterType == 'notBetween') && (filter.filterText2 == undefined || filter.filterText2 == '' || filter.filterText2 == 'Invalid Date'))
                        result = false;
            }

        if ((filter.filterType == 'null' || filter.filterType == 'notNull'))
            result = true;

        return result;
    }

    this.setDatePatternFilterType = function(filter,option)
    {
        filter.searchValue = option.value;
        filter.filterText1 = option.value;
        filter.filterLabel1 = option.label;
    }

    this.reorderFilters = function()
    {
        reorderFilters();
    }

    function reorderFilters()
    {
        for (var i in query.groupFilters)
                {
                    if (i == 0)
                        {
                           delete(query.groupFilters[0].condition);
                           delete(query.groupFilters[0].conditionLabel);
                        }
                    if (i != 0 && query.groupFilters[i].condition == undefined)
                        {
                            query.groupFilters[i].condition = 'AND';
                            query.groupFilters[i].conditionLabel = 'AND';
                        }
                }



    }


});
