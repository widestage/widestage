angular.module('wice').controller('queriesCtrl', function ($scope,$rootScope, $timeout, $window, connection, PagerService) {

    //$rootScope.layoutOptions.sidebar.isVisible = false;
    $rootScope.$emit('$stateChangeSuccess');

    $scope.connections = [];

    $scope.selectedConnection = undefined;
    $scope.selectedSchema = undefined;

    $scope.selectedConnectionSchemas = [];

    $scope.search = '';

    $scope.gridOpts = {
        columnDefs: [],
        data: $scope.queryResult,
        onRegisterApi: function( gridApi ) {
            $scope.gridApi = gridApi;
        },
        enableGridMenu: true,
        enableSelectAll: true
    };

    $scope.queryListGridOpts = {
        //infiniteScrollRowsFromEnd: 50,
       // infiniteScrollUp: true,
        //infiniteScrollDown: true,
        columnDefs: [
            {name: 'createdOn', width: 150, field: 'createdOn'},
            {name: 'userName', width: 150, field: 'userName'},
            {name: 'status', width: 50, field: 'status'},
            {name: 'sizeInBytes', width: 50, field: 'sizeInBytes'},
            {name: 'numberOfRecords', width: 50, field: 'numberOfRecords'},
            {name: 'executionTime', width: 50, field: 'executionTime'},
            {name: 'queryText', width: '100%', field: 'queryText'}


        ],
        data: $scope.items,
        onRegisterApi: function(gridApi){
            //gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.getDataDown2);
            //gridApi.infiniteScroll.on.needLoadMoreDataTop($scope, $scope.getDataUp);
            $scope.gridApi = gridApi;
        },
        enableGridMenu: true
    };

    $scope.goBack = function()
    {
        $window.history.back();
    }

    $scope.getConnections = function() {
        var params = {};

        params.page = -1; //Get all pages

        datasourceModel.getDataSources(params, function(data){
            $scope.connections = data.items;
        });

    };

    $scope.getSchemasForConnection = function(connection) {
        var connectionID = connection._id;
        $scope.selectedConnectionType = connection.type;
        $scope.selectedConnection = connectionID;
        $scope.selectedConnectionSchemas = [];
        $scope.tables = [];
        datasourceModel.getSchemasForDatasource(connectionID, function(data){
            $scope.selectedConnectionSchemas = data.items;
        });

    };

    $scope.getTablesForSchema = function(schema)
    {
        var connectionID = $scope.selectedConnection;
        var selectedSchema = schema.table_schema;
        $scope.tables = [];
        datasourceModel.getTablesForSchema(connectionID,selectedSchema, function(data){
            $scope.tables = data.items;

        });
    }

    $scope.runQuery = function()
    {
        var cursorStart = $('#sqlTextArea').prop('selectionStart');

        var cursorEnd = $('#sqlTextArea').prop('selectionEnd');

        var query = $scope.sqlText;

        if (cursorEnd > cursorStart)
        {
            query = query.substring(cursorStart, cursorEnd);
        }

        if (query != undefined && query != '') {
            var connectionID = $scope.selectedConnection;
            datasourceModel.runQuery(connectionID, query, function (data) {
                if (data.result == 1 && data.items) {
                    $scope.messagePanelVisible = false;
                    $scope.noRecordsPanelVisible = false;
                    refreshGrid(data.items);
                } else {
                    $scope.messagePanelVisible = true;
                    $scope.errorMessage = data.msg;

                }
            });
        }
    }

    $scope.addToQuery = function(entity)
    {

        var cursorPos = $('#sqlTextArea').prop('selectionStart');
        var v = $('#sqlTextArea').val();
        var textBefore = v.substring(0,  cursorPos);
        var textAfter  = v.substring(cursorPos, v.length);
        if ($scope.selectedConnectionType === 'MONGODB')
        {
            var table_name = entity.table_name;
        } else {
            if (entity.table_schema)
                var table_name = entity.table_schema + '.' + entity.table_name;
            else
                var table_name = entity.table_name;
        }
        $scope.sqlText = textBefore + table_name +  textAfter;
    }

    $scope.getTop100rows = function(entity)
    {
        $scope.gridOpts.columnDefs = [];
        $scope.gridOpts.data = undefined;
        var connectionID = $scope.selectedConnection;

        if ($scope.selectedConnectionType === 'MONGODB')
        {
            var table_name = entity.table_name;
        } else {

            if (entity.table_schema)
                var table_name = entity.table_schema + '.' + entity.table_name;
            else
                var table_name = entity.table_name;
        }

        datasourceModel.getTop100(connectionID, table_name, function (data) {
            if (data.result == 1  && data.items) {
                $scope.messagePanelVisible = false;
                $scope.noRecordsPanelVisible = false;
                refreshGrid(data.items);
            } else {
                $scope.messagePanelVisible = true;
                $scope.errorMessage = data.msg;
            }
        });

    }

    function refreshGrid(newData)
    {
        if (newData[0] == undefined ||  newData[0] == null)
        {
            $scope.noRecordsPanelVisible = true;
        } else {
            $scope.queryResult = newData;

            var dataColumns = Object.keys(newData[0]);
            var columnsDefinition = [];
            for (var c in dataColumns) {
                columnsDefinition.push({name: dataColumns[c], width: 200});
            }
            $scope.gridOpts.columnDefs = columnsDefinition;
            $scope.gridOpts.data = $scope.queryResult;
        }
    }


    $scope.getQueries = function(page, search) {

        $scope.firstPage = 1;
        $scope.lastPage = 1;

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

        $scope.firstPage = 1;

        connection.get('/api/queries/find-all', params, function(data) {
            for (var i in data.items)
            {
                data.items[i].lastExecution = moment(data.items[i].createdOn).fromNow();
                data.items[i].executionTimeInSecs = data.items[i].executionTime / 1000;
                data.items[i].sizeInMB = data.items[i].sizeInBytes / 1048576;

            }


               $scope.items = data.items;
            //if (page > 1)
              //  $scope.items.concat(data.items);

            var columns = [
                {name: 'executed', width: 125, field: 'lastExecution'},
                {name: 'userName', width: 125, field: 'userName'},
                {name: 'status', width: 50, field: 'status',cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                    if (grid.getCellValue(row ,col).toLowerCase() === 'error') {
                        return 'error';
                    } else {
                        return 'success';
                    }
                }},
                {name: 'sizeInBytes', width: 50, field: 'sizeInBytes'},
                {name: 'numberOfRecords', width: 50, field: 'numberOfRecords'},
                {name: 'executionTimeInSecs', width: 50, field: 'executionTimeInSecs'},
                {name: 'queryText', width: '100%', field: 'queryText'}];
            $scope.queryListGridOpts.columnDefs = columns;
            //if (page === 1)
              //  $scope.queryListGridOpts.data = data.items;
            //if (page > 1)
                $scope.queryListGridOpts.data = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.pager = PagerService.GetPager($scope.items.length, data.page,10,data.pages);
            $timeout(function() {
                $scope.gridApi.core.handleWindowResize();
            });

        });
    };


    $scope.getDataDown2 = function() {

        if ($scope.page <= $scope.pages) {
            $scope.getQueries($scope.page + 1, $scope.search);
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.core.refresh();
        }
    };

    $scope.getDataDown = function() {

        var params = {};

        params.page = $scope.page +1;

        if ($scope.search) {
            params.search = $scope.search;
        }

        connection.get('/api/queries/find-all', params, function(data) {
            for (var i in data.items)
            {
                data.items[i].lastExecution = moment(data.items[i].createdOn).fromNow();
                data.items[i].executionTimeInSecs = data.items[i].executionTime / 1000;
                data.items[i].sizeInMB = data.items[i].sizeInBytes / 1048576;

            }
                $scope.lastPage++;
                var newData = $scope.getPage(data.items, $scope.lastPage);
                $scope.gridApi.infiniteScroll.saveScrollPercentage();
                $scope.items = $scope.items.concat(newData);
                return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < 4).then(function() {$scope.checkDataLength('up');});
            });

    };

    $scope.getPage = function(data, page) {
        var res = [];
        for (var i = (page * 50); i < (page + 1) * 50 && i < data.length; ++i) {
            res.push(data[i]);
        }
        return res;
    };

    $scope.checkDataLength = function( discardDirection) {
        // work out whether we need to discard a page, if so discard from the direction passed in
        if( $scope.lastPage - $scope.firstPage > 3 ){
            // we want to remove a page
            $scope.gridApi.infiniteScroll.saveScrollPercentage();

            if( discardDirection === 'up' ){
                $scope.items = $scope.items.slice(50);
                $scope.firstPage++;
                $timeout(function() {
                    // wait for grid to ingest data changes
                    $scope.gridApi.infiniteScroll.dataRemovedTop($scope.firstPage > 0, $scope.lastPage < 4);
                });
            } else {
                $scope.items = $scope.items.slice(0, 200);
                $scope.lastPage--;
                $timeout(function() {
                    // wait for grid to ingest data changes
                    $scope.gridApi.infiniteScroll.dataRemovedBottom($scope.firstPage > 0, $scope.lastPage < 4);
                });
            }
        }
    };

    $scope.getDataUp = function() {

        var params = {};

        params.page = $scope.page -1;

        if ($scope.search) {
            params.search = $scope.search;
        }

        connection.get('/api/queries/find-all', params, function(data) {
            for (var i in data.items)
            {
                data.items[i].lastExecution = moment(data.items[i].createdOn).fromNow();
                data.items[i].executionTimeInSecs = data.items[i].executionTime / 1000;
                data.items[i].sizeInMB = data.items[i].sizeInBytes / 1048576;

            }
            $scope.firstPage--;
            var newData = $scope.getPage(data.items, $scope.firstPage);
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.items =  newData.concat($scope.items);
            return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < 4).then(function() {$scope.checkDataLength('down');});

        });
    };

});
