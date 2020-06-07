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
        name: datasourceData.name,
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

exports.getConnectionReverseEngineering = function(req,res)
{
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

        reverse.getReverseEngineering(theDatasourceID,datasourceConnectionData, function(result) {
            serverResponse(req, res, 200, result);
        });
    }
});
}

exports.getConnectionLayerDefinition = function(req,res)
{
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
        reverse.getReverseEngineering(theDatasourceID,datasourceConnectionData, function(result) {
            var virtualLayer = generateLayerFromReverseEngineering(theDatasourceID,result);
            //console.log('virtualLayer',virtualLayer);
            serverResponse(req, res, 200, virtualLayer);
        });
    }
});
}

exports.getReverseEngineering4Schema = function(req,res)
{
//get tables and views from a database connection
var theDatasourceID = req.params.connectionID;
var schemaName = req.params.schema;

//TODO if datasourceID is empty or schemaName

req.query = {};
req.query.id = theDatasourceID;

req.query.companyid = true;

controller.findOne(req, function(result){

    if (result.result == 1)
    {
        var datasourceConnectionData = getDatasourceConnectionData(result.item);
        var reverse = require('../../wst-connection-drivers/controllers/db/reverse.js');
        reverse.getReverseEngineering4Schema(theDatasourceID,schemaName,datasourceConnectionData, function(result) {
            var virtualLayer = generateLayerFromReverseEngineering(theDatasourceID,result);
            serverResponse(req, res, 200, virtualLayer);
        });
    }
});
}

function generateLayerFromReverseEngineering(theDatasourceID,reverse)
{
    var objects = [];
    var entities = [];
    var joins = [];

    
    for (var s in reverse.items.schemas)
    {
        var theSchema = getFolderElement(reverse.items.schemas[s].schemaID,reverse.items.schemas[s].schema_name);
        for (var t in reverse.items.schemas[s].entities)
        {
            var schemaTable =  reverse.items.schemas[s].entities[t];
            var theTable = getFolderElement(schemaTable.entityID,schemaTable.table_name);
            entities.push(getEntity(schemaTable));
            for (var a in schemaTable.attributes)
            {
                var tableAttribute =  schemaTable.attributes[a];
                var theAttribute = getAttributeElement(tableAttribute,schemaTable);
                theTable.elements.push(theAttribute);
            }
            theSchema.elements.push(theTable);
        }
        for (var j in reverse.items.schemas[s].joins)
        {
            var theJoin = getJoin(reverse.items.schemas[s].joins[j]);
            joins.push(theJoin);
        }
        objects.push(theSchema);
    }


    var virtualLayer = {
        _id: theDatasourceID,
        objects: objects,
        model: {
            "dialect":'GENERIC',
            "entities":entities,
            "joins":joins,
            datasourceID: theDatasourceID
        }
    }

    return virtualLayer;

    //objects is done

    //datasources and joins
    /*
    var model = {
        "dialect": "GENERIC",
        "entities": [
            "datasourceID": theDatasourceID,
          "entityID": "48jg",
          "entityType": "table",
          "parentEntityID": "5e346dfbec9b69f4ea97547awstorders",
          "schema_name": "wst",
          "description": "",
          "table_name": "orders",
          "left": 400,
          "top": 61,
          "attributes": [
            {
              "collectionID": "48jg",
              "collectionName": "orders",
              "collectionSchema": "wst",
              "collectionType": "table",
              "datasourceID": "5e346dfbec9b69f4ea97547a",
              "elementID": "evsa",
              "elementName": "order_id",
              "elementLabel": "number of orders",
              "data_type": "smallint",
              "table_name": "smallint",
              "elementType": "INTEGER",
              "length": null,
              "precission": 16,
              "scale": 0,
              "required": true,
              "isPK": true,
              "elementRole": "measure",
              "defaultAggregation": "count"
            }
        ],
        "joins": [
            {
                "joinID": "WSTjwlu",
                "joinType": "QJOIN",
                "multiplicity": "default",
                "joinHeight": 2,
                "joinColor": "#CCC",
                "sourceObjectID": "ogmu",
                "sourceParentID": "c7hk",
                "targetObjectID": "40sh",
                "targetParentID": "v8tt",
                "sourceElementName": "product_id",
                "targetElementName": "product_id",
                "svg": {
                  "shape_path": {}
                }
              }
        ],
        "datasourceID": theDatasourceID
      }
*/



}

function getEntity(sourceEntity)
{
          var ent = {};

          ent.datasourceID = sourceEntity.connectionID;
          ent.entityID = sourceEntity.entityID;
          ent.entityType = sourceEntity.entityType;
          //ent.parentEntityID": "5e346dfbec9b69f4ea97547awstorders",
          ent.schema_name = sourceEntity.schema_name;
          ent.description = '';
          ent.table_name = sourceEntity.table_name;
          //ent.left": 400,
          //ent.top": 61,
          ent.attributes = [];

          for (var a in sourceEntity.attributes)
          {
            ent.attributes.push(getAttributeElement(sourceEntity.attributes[a],sourceEntity));
          }

    return ent;
          
}

function getJoin(sourceJoin)
{
    var join = {
            "joinID": generateShortUID(),
            "joinType": "QJOIN",
            "multiplicity": "default",
            "sourceObjectID": sourceJoin.sourceObjectID,
            "sourceParentID": sourceJoin.sourceParentID,
            "targetObjectID": sourceJoin.targetObjectID,
            "targetParentID": sourceJoin.targetParentID,
            "sourceElementName": sourceJoin.column_name,
            "targetElementName": sourceJoin.foreign_column_name
        }

    return join;
/* reverse join structure
        "constraint_name": "fk_orders_customers",
				"table_schema": "wst",
				"table_name": "orders",
				"column_name": "customer_id",
				"foreign_table_schema": "wst",
				"foreign_table_name": "customers",
				"foreign_column_name": "customer_id",
				"joinColor": "#ccc",
				"joinHeight": 2,
				"joinType": "IE",
				"sourceCardinality": "One",
				"targetCardinality": "ZeroOrMore",
				"sourceObjectID": "6pze",
				"sourceParentID": "8ro3",
                "targetObjectID": "b0db",
                "targetParentID": "a22q"
                
    */
}

function getFolderElement(folderID,folderLabel)
{
    var folder = {};
        folder.elementLabel = folderLabel;
        folder.elementRole = "folder";
        folder.elementID = folderID;
        folder.elements = [];

    return folder;
}

function getAttributeElement(attribute, collection)
{
   var attr = {}; 
    attr.collectionID = collection.entityID
    attr.collectionSchema = attribute.table_schema;
    attr.collectionName = attribute.table_name;
    attr.collectionType = collection.entityType;
    attr.datasourceID = collection.connectionID;
    attr.elementID = attribute.attributeID;
    attr.elementName = attribute.column_name;
    attr.elementLabel = attribute.column_name;
    attr.data_type = attribute.data_type;
    attr.length = attribute.length;
    attr.precission = attribute.precission;
    attr.scale = attribute.scale;
    attr.isPK = attribute.isPK;
    attr.required = attribute.required;
    attr.lineage = attribute.lineage;
    if (attribute.elementType == 'DECIMAL' || attribute.elementType == 'INTEGER' || attribute.elementType == 'FLOAT')
                            attr.elementRole = 'measure';
                            else
                            attr.elementRole = 'dimension';
    attr.elementType = attribute.elementType;
    //attr.defaultAggregation = 'raw';

    return attr;
}

function generateShortUID() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
}


exports.getTop100 = function(req, res)
{
//get top 100 records from a given table
var theDatasourceID = req.params.connectionID;
var schemaName = req.params.schema;
var tableName = req.params.entity;

req.query = {};
req.query.id = theDatasourceID;
req.query.companyid = true;


controller.findOne(req, function(result){

    if (result.result == 1)
    {
        var datasourceConnectionData = getDatasourceConnectionData(result.item);
        var queryProcessor = require('../../wst-connection-drivers/controllers/query/queryProcessor.js');
        queryProcessor.getTop100(req,theDatasourceID,tableName,datasourceConnectionData, function(result) {
            serverResponse(req, res, 200, result);
        });


    }
});
}
