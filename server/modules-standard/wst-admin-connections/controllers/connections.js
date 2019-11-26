var connections = connection.model('Connections');
require('../../../core/controller.js');
function ConnectionsController(model) {
    this.model = model;
    this.searchFields = ['actionCategory'];
}
ConnectionsController.inherits(Controller);
var controller = new ConnectionsController(connections);



exports.ConnectionsCreate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;
    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.ConnectionsFindAll = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    req.query.fields = ['name','status','type','params'];

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });

}

exports.ConnectionsFindOne = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    req.query.id = req.params.connectionID;


    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });

}

exports.ConnectionsUpdate = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    req.query.id = req.params.connectionID;

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
}

exports.ConnectionsDelete = function(req,res)
{
    req.query.companyid = true;
    req.params.id = req.params.connectionID;

    controller.remove(req, function(result){
        serverResponse(req, res, 200, result);
    });
}

function getDatasourceConnectionData(datasourceData)
{
    var datasourceConnectionData = {
        datasourceID: datasourceData._id,
        type: datasourceData.type,
        host: datasourceData.params.connection.host,
        port: datasourceData.params.connection.port,
        userName: datasourceData.params.connection.userName,
        password: datasourceData.params.connection.password,
        database: datasourceData.params.connection.database,
    }
    return datasourceConnectionData;
}

exports.getSchemas = function(req,res) {
    var theDatasourceID = req.params.connectionID;
    req.query = {};
    req.query.id = theDatasourceID;
    req.query.companyid = true;

    controller.findOne(req, function(result){

        if (result.result == 1)
        {
            var datasourceConnectionData = getDatasourceConnectionData(result.item);
            var reverse = require('../../wst-connection-drivers/controllers/db/reverse.js');
            reverse.getSchemas(theDatasourceID,datasourceConnectionData, function(result) {
                serverResponse(req, res, 200, result);
            });
        }
    });
}

exports.getsqlQuerySchema = function(req, res)
{
  var theDatasourceID = req.params.connectionID;
  var theSqlQuery = req.query.sqlQuery;

  req.query = {};
  req.query.id = theDatasourceID;
  req.query.companyid = true;




  controller.findOne(req, function(result){

      if (result.result == 1)
      {
          var datasourceConnectionData = getDatasourceConnectionData(result.item);
          var reverse = require('../../wst-connection-drivers/controllers/db/reverse.js');
          reverse.getsqlQuerySchema(req,theSqlQuery,datasourceConnectionData, function(result) {
              serverResponse(req, res, 200, result);
          });
      }
  });
}


exports.getEntitiesForSchema = function(req,res) {
    //get tables and views from a database connection
    var theDatasourceID = req.params.connectionID;
    var schemaName = req.params.schemaID;

    //TODO if datasourceID is empty or schemaName

    req.query = {};
    req.query.id = theDatasourceID;
    req.query.companyid = true;

    controller.findOne(req, function(result){
        if (result.result == 1)
        {
            var datasourceConnectionData = getDatasourceConnectionData(result.item);
            var reverse = require('../../wst-connection-drivers/controllers/db/reverse.js');
            reverse.getTablesAndViewsForSchema(theDatasourceID,schemaName,datasourceConnectionData, function(result) {
                serverResponse(req, res, 200, result);
            });


        } else {
            serverResponse(req, res, 200, result);
        }
    });
}


exports.getEntityFields = function(req,res) {
    //get tables and views from a database connection
    var theDatasourceID = req.params.connectionID;
    var entityName = req.params.entityID;
    var schemaName = req.params.schemaID;

    //TODO if datasourceID is empty or schemaName

    req.query = {};
    req.query.id = theDatasourceID;

    req.query.companyid = true;

    controller.findOne(req, function(result){

        if (result.result == 1)
        {
            var datasourceConnectionData = getDatasourceConnectionData(result.item);

            var reverse = require('../../wst-connection-drivers/controllers/db/reverse.js');
            reverse.getEntityFields(theDatasourceID, schemaName, entityName, datasourceConnectionData, function(result) {
                serverResponse(req, res, 200, result);
            });
        }
    });
}
