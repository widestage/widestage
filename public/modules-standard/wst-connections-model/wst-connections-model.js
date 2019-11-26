app.service('connectionModel' , function ($http, $q, $filter, connection) {


    this.getConnections = function(params, done)
    {
        connection.get('/api/v3/admin/connections', params, function(data) {

            done(data);
        });
    }

    this.getSchemasForConnection = function(datasourceID,done)
    {
        var params = {};
        params.datasourceID = datasourceID;
        connection.get('/api/v3/admin/connections/'+datasourceID+'/schema', params, function(result) {
            done(result);
        });
    };

    this.getReverseEngineering = function(datasourceID, done){
        var data = {};
        data.datasourceID = datasourceID;

        connection.get('/api/data-sources/getReverseEngineering', data, function(result) {
            done(result);
        });
    };

    this.getModel = function(datasourceID, done){
        var data = {};
        data.datasourceID = datasourceID;

        connection.get('/api/data-sources/getModel', data, function(result) {
            done(result);
        });
    };

    this.rebootModel = function(datasourceID, done){
        var data = {};
        data.datasourceID = datasourceID;

        connection.get('/api/data-sources/rebootModel', data, function(result) {
            done(result);
        });
    };


    this.getEntityfields = function(datasourceID,schema,entity,done)
    {
        var data = {};

        connection.get('/api/v3/admin/connections/'+datasourceID+'/schema/'+schema+'/entities/'+entity+'/attributes', data, function(result) {
            if (result.result == 1) {
                done(result);
            }
        });
    }

    this.getTablesForSchema = function(datasourceID,schemaName,done)
    {
        var data = {};

        connection.get('/api/v3/admin/connections/'+dataSourceID+'/schema/'+schemaName+'/entities', data, function(result) {
            done(result);
        });
    }

    this.getSqlQuerySchema = function(datasourceID,sqlQuery,done)
    {
        var data = {};
        data.datasourceID = datasourceID;
        data.sqlQuery = sqlQuery;

        connection.get('/api/v3/admin/connections/'+datasourceID+'/query/schema', data, function(result) {

                done(result);

        });
    }

    this.runQuery = function(datasourceID,queryText,done)
    {
        var data = {};
        data.datasourceID = datasourceID;
        data.sqlQuery = queryText;

        connection.post('/api/v3/connection/'+datasourceID+'/query', data, function(result) {

                done(result);

        });
    }

    this.getTop100 = function(datasourceID,tableName,done)
    {
        var data = {};
        data.datasourceID = datasourceID;
        data.tableName = tableName;

        connection.get('/api/data-sources/getTop100', data, function(result) {

            done(result);

        });
    }

});
