app.service('queryModel' , function ($http, $q, $filter, connection, $compile, $rootScope,uuid2,userSettings) {
    var wrongFilters = [];


    this.initQuery = function(done) {
        var newquery = {};
        newquery.id = uuid2.newguid();
        newquery.columns = [];
        newquery.order = [];
        newquery.groupFilters = [];
        newquery.selectedLayerID = undefined;
        done(newquery);
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
        {value:"#WST-THISQUARTER#",label:"This quarter"},
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
            {name: 'Count Distinct', value: 'count_distinct'},
            {name: 'Raw', value:'raw'}
        ],
        'date': [
            {name: 'Min', value: 'min'},
            {name: 'Max', value: 'max'},
            {name: 'Raw', value:'raw'}
        ],
        'string': [
            {name: 'Count', value: 'count'},
            {name: 'Count Distinct', value: 'count_distinct'},
            {name: 'Raw', value:'raw'}
        ]
    };


    //TODO: Date parts


    /*

    'DATE': [
        {name: 'Year', value: 'year'},
        {name: 'Month', value: 'month'},
        {name: 'Day', value: 'day'},
        {name: 'Count', value: 'count'},
        {name: 'Raw', value:'raw'}
        {name: 'Semester', value: 'semester'},
         {name: 'Quarter', value: 'quarter'},
         {name: 'Trimester', value: 'trimester'}

    */

    this.conditionTypes = [
        {conditionType: 'and', conditionLabel: 'AND'},
        {conditionType: 'or', conditionLabel: 'OR'},
        {conditionType: 'andNot', conditionLabel: 'AND NOT'},
        {conditionType: 'orNot', conditionLabel: 'OR NOT'}
    ];


    this.getElementFilterOptions = function(elementType)
    {
        if (elementType == 'ARRAY')
            return  this.filterArrayOptions;
        if (elementType == 'STRING')
           return  this.filterStringOptions;
        if (elementType == 'DECIMAL' || elementType == 'INTEGER' || elementType == 'FLOAT')
            return  this.filterNumberOptions;
        if (elementType == 'DATE')
            return this.filterDateOptions
    }

    this.getQueryData2 = function(query,done) {
        getQueryData(query,done);
    }

    function getQueryData(query,done)
    {
            var params = {};
            cleanQuery(query);
            wrongFilters = [];
            checkFilters(query.groupFilters);

            if (wrongFilters.length === 0)
                    {
                        params.query = angular.copy(query);
                        delete(params.query.wrongFilters);
                        delete(params.query.data);
                        delete(params.query.sql);
                        delete(params.query.executionTime);
                        delete(params.query.selectedLayerID);

                        params.forceRefresh = (query.params && query.params.forceRefresh) ? query.params.forceRefresh : false;
                        connection.post('/api/v3/connection/get-data', params, function(data) {
                           var sql = data.sql;
                           query.sql = data.sql;
                           query.fromCache = data.fromCache;
                           query.executionTime = data.time;

                            if (data.result === 0)
                            {
                                toastr.error(data.msg);
                                done([],sql,query);
                            } else {
                                prepareData(query, (data.data) ? data.data : data, function(result)
                                {
                                    done(result,sql,query,(data.fromCache),data.time);
                                    $rootScope.$emit('queryExecuted', {query});
                                    if (this.onQueryExecuted)
                                        this.onQueryExecuted(query);
                                });
                            }


                        });
                    } else {

                        done([],'',query);
                    }
    };

    this.getQueryAsAFile = function(query,done) {
        getQueryAsAFile(query,done);
    }

    function getQueryAsAFile(query,name,done)
    {
            var params = {};

                        params.query = angular.copy(query);
                        params.reportName = name.replace(/[\W_]+/g,"_");;
                        delete(params.query.wrongFilters);
                        delete(params.query.data);
                        delete(params.query.sql);
                        delete(params.query.executionTime);
                        delete(params.query.selectedLayerID);

                        params.forceRefresh = (query.params && query.params.forceRefresh) ? query.params.forceRefresh : false;
                        connection.downloadFile('/api/v3/connection/get-data-as-file', params,params.reportName+'.xlsx', function(data) {

                        });

    };

    this.getQueryDataNextPage = function(query,page, done) {
        getQueryDataNextPage(query,page,done);
    }

    function getQueryDataNextPage(query,page, done)
    {
        var params = {};
            wrongFilters = [];
            checkFilters(query.groupFilters);

            if (wrongFilters.length == 0)
                    {
                        params.query = angular.copy(query);
                        cleanQuery(params.query);
                        params.page = page;

                        params.forceRefresh = (query.params && query.params.forceRefresh) ? query.params.forceRefresh : false;

                        connection.post('/api/v3/connection/get-data', params, function(data) {
                           var sql = data.data.sql;
                            if (data.result == 0)
                            {
                                toastr.error(data.msg);
                                done([],sql,query);
                            } else {
                                prepareData(query, (data.data) ? data.data : data, function(result)
                                {
                                    done(result.data,sql,query,(data.fromCache),data.time);
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


        connection.post('/api/v3/connection/get-data', params, function(data) {
            if (data.result === 0)
                {
                    toastr.error(data.msg);
                    done([],data.sql,query);
                } else {
                    prepareData(query, (data.data) ? data.data : data, function(result)
                    {
                        done(result,data.data.sql,query,(data.fromCache),data.time);
                    });
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

        if (data !== undefined)
            done(JSON.parse(JSON.stringify(data),dateTimeReviver));
    }

    this.getDistinct = function(attribute,done) {
        var execute = (typeof execute !== 'undefined') ? execute : true;
        var query = {};
        query.id = uuid2.newguid();
        query.datasources = [];
        query.columns = [];
        query.order = [];

        query.order.push(attribute);

        var datasourcesList = [];
        var layersList = [];
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
                collection.collectionName = attribute.collectionName;
                collection.collectionSchema = attribute.collectionSchema;
                collection.collectionType = attribute.collectionType;
                collection.collectionSQL = attribute.collectionSQL;
                collection.columns = [];
                collection.columns.push(attribute);

                collection.order = [];
                collection.order.push(attribute);

                for (var n1 in query.order) {
                    if (query.order[n1].collectionID === dtsCollections[n])
                    {
                        collection.order.push(query.order[n1]);
                    }
                }

                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }

        query.layers = layersList;

        getData(query, {page: 0}, function(data,sql) {

          var page = data.page;
          var pages = data.pages;

            if (data.items)
                data = data.items;

            done(data,sql,page,pages);


        });
    }


    function pad(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        while (s.length < size) s = "0" + s;
        return s;
    }

    function checkForNtoNEntities(selectableCollections)
    {
          for (var s in selectableCollections)
          {
                var entity = lookForEntity(selectableCollections[s]);
                if (entity.n2n == true)
                    {
                        addN2NEntityLinkedEntities(entity, selectableCollections)
                    }
          }
    }

    function addN2NEntityLinkedEntities(entity, selectableCollections)
    {
      //AQUI para identificar las entidades que son accesibles a través de una bridge table...

    }

    function checkFilters(thefilters)
    {
        for (var g in thefilters) {
                var filter = thefilters[g];
                if (filter)
                    {
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




    this.addColumn = function (query, element, done)
    {

        if (!query.columns)
                 query.columns = [];

        var found = false;

        for (var i in query.columns)
             {
                if (query.columns[i].elementID == element.elementID)
                    found = true;
             }
        if (!found)
        {

            query.columns.push(element);

        $rootScope.$emit('queryDefinitionChanged', {});

        } else {
          toastr.error('That column already exists');
          done();
        }
    }

    this.generateQuery = function(query)
    {
        return generateQuery(query);
    }

    function generateQuery(query)
    {

        query.id = uuid2.newguid();
        query.datasources = [];
        query.wrongFilters = wrongFilters;
        var datasourcesList = [];
        var layersList = [];
        //layersList.push(selectedLayerID);

        for (var i in query.columns) {
            if (datasourcesList.indexOf(query.columns[i].datasourceID) == -1)
                datasourcesList.push(query.columns[i].datasourceID);
            if (query.columns[i].layerID && layersList.indexOf(query.columns[i].layerID) == -1)
                layersList.push(query.columns[i].layerID);
        }

        for (var i in query.groupFilters) {
                if (datasourcesList.indexOf(query.groupFilters[i].datasourceID) == -1)
                    datasourcesList.push(query.groupFilters[i].datasourceID);
                if (query.groupFilters[i].layerID && layersList.indexOf(query.groupFilters[i].layerID) == -1)
                    layersList.push(query.groupFilters[i].layerID);
        }


        for (var i in query.order) {
                if (datasourcesList.indexOf(query.order[i].datasourceID) == -1)
                    datasourcesList.push(query.order[i].datasourceID);
                if (query.order[i].layerID && layersList.indexOf(query.order[i].layerID) == -1)
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
                                    collection.collectionName = query.columns[n1].collectionName;
                                    collection.collectionSchema = query.columns[n1].collectionSchema;
                                    collection.collectionType = query.columns[n1].collectionType;
                                    collection.collectionSQL = query.columns[n1].collectionSQL;

                                }
                            }

                            collection.order = [];

                            for (var n1 in query.order) {
                                if (query.order[n1].collectionID == dtsCollections[n])
                                {
                                    collection.order.push(query.order[n1]);
                                    collection.collectionName = query.order[n1].collectionName;
                                    collection.collectionSchema = query.order[n1].collectionSchema;
                                    collection.collectionType = query.order[n1].collectionType;
                                    collection.collectionSQL = query.order[n1].collectionSQL;
                                }
                            }


                            collection.filters = [];
                             for (var n1 in query.groupFilters) {

                                if (query.groupFilters[n1].collectionID)
                                    if (query.groupFilters[n1].collectionID == dtsCollections[n])
                                        {
                                            collection.filters.push(angular.copy(query.groupFilters[n1]));
                                            collection.collectionName = query.groupFilters[n1].collectionName;
                                            collection.collectionSchema = query.groupFilters[n1].collectionSchema;
                                            collection.collectionType = query.groupFilters[n1].collectionType;
                                            collection.collectionSQL = query.groupFilters[n1].collectionSQL;
                                        }

                             }

                            dtsObject.collections.push(collection);

                        }



                        query.datasources.push(dtsObject);
                        query.layers = layersList;

            });

        }

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

    this.processStructure = function(query,execute, done)
    {
        processStructure(query,execute,done);
    }

    function processStructure(query,execute,done) {
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
                    //toastr.error(errorMsg);
                }

    }

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



});
