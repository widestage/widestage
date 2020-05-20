

var db = function () {

    this.conn = null;
    this.datasourceID = undefined;
};

var sql = require('../../sqlv2.js');

db.prototype.connect = function(data,datasourceID, done) {
    connect(data,datasourceID,done);
};

exports.connect = function(data,datasourceID, done) {
    connect(data,datasourceID,done);
};


function connect(data,datasourceID, done)
{
    var DB = this;

    var MongoClient = require('mongodb').MongoClient , assert = require('assert');

    if (data.userName)
        var dbURI =  'mongodb://'+data.userName+':'+data.password+'@'+data.host+':'+data.port+'/'+data.database;
    else
        var dbURI =  'mongodb://'+data.host+':'+data.port+'/'+data.database;

    MongoClient.connect(dbURI, function(err, db) {
        if (err) {
            saveToLog(undefined, 'Error  connecting to MONGODB data source' + err.message,'','ERROR','MONGODB', 102);
            done(err);
            return;
        }

        DB.conn = db;
        DB.datasourceID = datasourceID;
        DB.database = data.database;

        done(false, DB.conn);

    })

}

db.prototype.end = function() {
    end();
};

exports.end = function() {
    end();
};

function end()
{
  try {
    this.conn.close();
  } catch (e) {

  } finally {

  }

}

db.prototype.internalQuery = function(query, done) {
    runInternalQuery(query, done);
};

function runInternalQuery(query, done)
{

    if (query.id === 'getDatabaseSchemas')
        getDatabaseSchemas(function(err,result){
            if (err) {
                done('Query Error: '+err);
                return;
            }
            done(false, {rows: result.rows});
        });

    if (query.id === 'getTablesAndViewsForSchema')
        getTablesAndViewsForSchema(function(err,result){
            if (err) {
                done('Query Error: '+err);
                return ;
            }
            done(false, {rows: result.rows});
        });

    if (query.id === 'getEntityFieldsSQL')
        getEntityFields(query.collectionName,function(err,result){
            if (err) {
                done('Query Error: '+err);
                return;
            }
            done(false, {rows: result.rows});
        });



    if (query.id === 'getEntityPKsSQL')
        getEntityPKs(query.collectionName,function(err,result){
            if (err) {
                done('Query Error: '+err);
                return;
            }
            done(false, {rows: result.rows});
        });



}

db.prototype.query = function(query, req, queryMetaData, done) {
    runQuery(query,req, queryMetaData, done);
};

exports.runQuery = function(query, req, queryMetaData, done) {
    runQuery(query,req, queryMetaData, done);
};

exports.getDateFormat = function(column,format)
{
  return 'to_char('+column+ ",'"+format+"')";
}


db.prototype.getTop100 = function(table_name, req, done) {
    var startTime = new Date();
    var theTop100Query = table_name+'.find().skip(0).limit(100)'
    var collection = conn.collection(table_name);

    collection.find({},{"limit": 100, "skip": 0}).toArray(function (err, result) {
        var endTime = new Date();
        var executionTime = Math.abs(endTime - startTime)
        var status = 'success';
        var errorMessage = undefined;
        if (err) {

            errorMessage = err;
            status = 'error';
            if (req && global.PROqueries) {
                global.PROqueries.saveQuery(req, theTop100Query, result, status, errorMessage, 'getTop100', executionTime, 'MONGODB');
            }
            done('Query Error: ' + err);
            return;
        } else {
            if (req && global.PROqueries) {
                global.PROqueries.saveQuery(req, theTop100Query, result, status, errorMessage, 'getTop100', executionTime, 'MONGODB');
            }
            done(false, {rows: result});

        }


    });
};

function runQuery(query,req, queryMetaData,done) {
    if (query)
    {

    var collectionName = query.substr(0, query.indexOf('.'));
    var operation = query.substr(query.indexOf('.') + 1, query.indexOf('(') - (query.indexOf('.') + 1));

    var collection = this.conn.collection(collectionName);


    var paramsStr = query.substr(query.indexOf('(') + 1, query.lastIndexOf(")") - (query.indexOf('(') + 1));

    var startTime = new Date();


    if (operation === 'aggregate' || operation === 'findOne') {

            if (paramsStr && paramsStr != '')
                try {
                    var params = JSON.parse(paramsStr);
                }
                catch (err) {
                    console.log(err);
                    var errorMessage = err;
                    var status = 'error';
                    var result = undefined;
                    if (req && global.PROqueries) {
                        global.PROqueries.saveQuery(req, query, result, status, errorMessage, queryMetaData, 0, 'MONGODB');
                    }
                    done('Query Error: ' + err);
                    return;
                }


        collection[operation](params, function (err, result) {
            var endTime = new Date();
            var executionTime = Math.abs(endTime - startTime)
            var status = 'success';
            var errorMessage = undefined;
            if (err) {

                errorMessage = err;
                status = 'error';
                if (req && global.PROqueries) {
                    global.PROqueries.saveQuery(req, query, result, status, errorMessage, queryMetaData, executionTime, 'MONGODB');
                }
                done('Query Error: ' + err);
                return
            } else {
                if (operation === 'aggregate' && queryMetaData) {
                    processAggregationResults(result, collectionName, queryMetaData, function (err, rows) {
                        if (req && global.PROqueries) {
                            global.PROqueries.saveQuery(req, query, rows, status, errorMessage, queryMetaData, executionTime, 'MONGODB');
                        }
                        done(false, {rows: rows});
                    });
                } else {
                    if (!Array.isArray(result)) //this is mainly for the findOne operation
                        result = [result];

                    if (req && global.PROqueries) {
                        global.PROqueries.saveQuery(req, query, result, status, errorMessage, queryMetaData, executionTime, 'MONGODB');
                    }
                    done(false, {rows: result});
                }
            }


        });
    }

    if (operation === 'find') {
            if (paramsStr && paramsStr != '')
                try {
                    var Findparams = JSON.parse('{"query":['+paramsStr+']}');
                    var filter = Findparams.query[0];
                    var projection = Findparams.query[1];
                }
                catch (err) {
                    console.log(err);
                    var errorMessage = err;
                    var status = 'error';
                    var result = undefined;
                    if (req && global.PROqueries) {
                        global.PROqueries.saveQuery(req, query, result, status, errorMessage, queryMetaData, 0, 'MONGODB');
                    }
                    done('Query Error: ' + err);
                    return;
                }


        collection[operation](filter,projection).toArray(function (err, result) {
            var endTime = new Date();
            var executionTime = Math.abs(endTime - startTime)
            var status = 'success';
            var errorMessage = undefined;
            if (err) {
                errorMessage = err;
                status = 'error';
                if (req && global.PROqueries) {
                    global.PROqueries.saveQuery(req, query, result, status, errorMessage, queryMetaData, executionTime, 'MONGODB');
                }
                done('Query Error: ' + err);
                return
            } else {
                if (req && global.PROqueries) {
                    global.PROqueries.saveQuery(req, query, result, status, errorMessage, queryMetaData, executionTime, 'MONGODB');
                }
                done(false, {rows: result});

            }
        });
    }

    if (operation != 'aggregate' && operation != 'findOne' && operation != 'find') {
        done('Query Error: ' + 'MongoDB Method ' + operation + ' not supported by widestage. Methods allowed are find, findOne and aggregate');
    }
}

}


function processAggregationResults(docs,collectionName,queryMetaData,done)
{
    var result = [];
    var collection = undefined;

    for (var d in queryMetaData.datasources)
    {
        for (var c in queryMetaData.datasources[d].collections)
        {
            if (queryMetaData.datasources[d].collections[c].collectionName === collectionName)
                collection = queryMetaData.datasources[d].collections[c];
        }
    }


    for (var i in docs) {
     var item = {};

     for(var group in docs[i]) {
         if (group == '_id') {
         for(var field in docs[i][group]) {
         item[field] = docs[i][group][field];
         }
         }
         else {
         item[group] = docs[i][group];
         }
     }



     for (var field in item) {

             for (var e in collection.columns) {

                 if (field == collection.columns[e].elementName && collection.columns[e].values) {
                 for (var v in collection.columns[e].values) {
                 if (collection.columns[e].values[v].value == item[field]) {
                 item[field] = collection.columns[e].values[v].label;
                 }
                 }
                 }

                 if ((field == collection.columns[e].elementName ||
                 field == collection.columns[e].elementName+'sum' ||
                 field == collection.columns[e].elementName+'avg' ||
                 field == collection.columns[e].elementName+'min' ||
                 field == collection.columns[e].elementName+'max' ||
                 field == collection.columns[e].elementName+'count' ||
                 field == collection.columns[e].elementName+'count_distinct'
                 )  && collection.columns[e].format) {

                 if (collection.columns[e].elementType == 'DATE') {
                     item[field+'_original'] = item[field];

                     var moment = require('moment');
                     var dFormat = 'DD/MM/YYYY';
                     if (collection.columns[e].format)
                         dFormat = collection.columns[e].format;


                     if (collection.columns[e].format == 'dd MON YYYY')
                         dFormat = 'DD MMM YYYY';
                     if (collection.columns[e].format == 'MON dd YYYY')
                         dFormat = 'MMM DD YYYY'

                     item[field] = moment(item[field]).format(dFormat);
                 }

                 if (collection.columns[e].elementType == 'DECIMAL'  || collection.columns[e].elementType == 'INTEGER' || collection.columns[e].elementType == 'FLOAT') {
                   item[field+'_original'] = item[field];
                   var numeral = require('numeral');
                   item[field] = numeral(item[field]).format(collection.columns[e].format);
                 }

                 }
             }
		 }

     var finalItem = {};
     for (var field in item)
     {
     //columns for results
     for (var e in collection.columns) {
     if (field == collection.columns[e].elementName ||
     field == collection.columns[e].elementName+'sum' ||
     field == collection.columns[e].elementName+'avg' ||
     field == collection.columns[e].elementName+'min' ||
     field == collection.columns[e].elementName+'max' ||
     field == collection.columns[e].elementName+'count')
     {
     if (collection.columns[e].aggregation)
     var elementID = 'wst'+collection.columns[e].elementID.toLowerCase()+collection.columns[e].aggregation;
     else
     var elementID = 'wst'+collection.columns[e].elementID.toLowerCase();

     var elementName = elementID.replace(/[^a-zA-Z ]/g,'');



     finalItem[elementName] = item[field];

     }

     }
     //joins for results


         for (var f in collection.joins)
         {
             if (field == collection.joins[f].sourceElementName) {

                 var elementName = collection.joins[f].sourceElementName;

                 finalItem[elementName] = item[field];
             }

             if (field == collection.joins[f].targetElementName) {

                 var elementName = collection.joins[f].targetElementName;

                 finalItem[elementName] = item[field];
             }
         }
     }

     result.push(finalItem);
     }

     done(false,result);
}


db.prototype.getDatabaseSchemas = function() {
    return {id:'getDatabaseSchemas'};
};

function getDatabaseSchemas(done)
{
    //MongoDB doesn't have schemas, so we back the name of the database
    done(false, {rows: [{table_schema: database}]});
}

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return 'getSchemaQuery';
};

db.prototype.getTables = function() {
    return 'getTables';
}

db.prototype.getViews = function() {
    return 'getViews';
}


db.prototype.getTablesAndViews = function() {

    return 'getTablesAndViews';
}

db.prototype.getTablesAndViewsForSchema = function(schemaName) {
    return {id:'getTablesAndViewsForSchema'};
}

function getTablesAndViewsForSchema(done)
{
    this.conn.listCollections().toArray(function (err, items) {
        if (err) {
            done(err);
            conn.close();
        } else {

            var rows = [];
            for (var i in items)
            {
                var theTable = {};
                theTable.name = items[i].name;
                theTable.table_name = items[i].name;
                theTable.table_schema = database;
                theTable.type = 'table';
                rows.push(theTable);
            }

            done(false, {rows: rows});

        }
    });
}

db.prototype.getColumns = function ()
{
    return 'getColumns';
}

db.prototype.getTableJoins = function()
{
    return 'getTableJoins';
}

db.prototype.getPKs = function()
{
    return 'getPKs';
}

db.prototype.getEntityFieldsSQL = function(tableSchema,tableName)
{
    return {id:'getEntityFieldsSQL',collectionName:tableName};
}

function getEntityFields(collectionName, done)
{

//TODO: the limit of results must be a parameter in the config or the datasource
    var collection = this.conn.collection(collectionName);
    collection.find().limit(100).toArray(function(err, results) {
        if (err)
        {
            done(err);
        }

        var dbstruc = {};
        var elements = [];
        var rows = [];

        for (var i = 0; i < results.length; i++) {
            getElementList(results[i],elements,'');
        }

        var names = [];

        for (i = 0; i < elements.length; i++) {

            var str = elements[i];
            if (str) {
                if (str != 'undefined') {
                    var pos = str.indexOf(":");
                    var name = str.substring(0,pos);
                    var type = str.substring(pos+1,str.length);

                   // var elementID = uuid.v4();

                    if (name != '_id._bsontype' && name != '_id.id' && name != '__v' )  {

                        if (names.indexOf(name) == -1)
                        {
                            names.push(name);
                            rows.push({table_schema:database,table_name:collectionName,column_name:name,data_type:type,required:false,length:undefined,precission:undefined,scale:undefined})
                        } else {

                            //el tipo puede cambiar por lo que hay que hacer una comprobación de tipo
                            for (n = 0; n < rows.length; n++) {
                                if (rows[n].column_name == name)
                                {
                                    if (rows[n].data_type == 'object' && type != 'object')
                                    {
                                        rows[n].elementType = type;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        done(false, {rows: rows});

    });
}

function getElementList (target,elements,parent) {
    for (var k in target) {
        if(typeof target[k] !== "object") {
            if (target.hasOwnProperty(k) ) {
                if (k >= 0) {
                    /*
                     if (parent != '')
                     {
                     var node = parent+'.'+k+':array';
                     } else {
                     var node = k+':array';
                     }
                     */
                } else {
                    if (parent != '')
                    {
                        var node = parent+'.'+k+':'+typeof target[k];
                    } else {
                        var node = k+':'+typeof target[k];
                    }

                    if (elements.indexOf(node) == -1)
                        elements.push(node);

                }
            }
        } else {
            if (target[k] && target[k][0] == 0) {

            }

            if (parseInt(k) != k) {
                if (parent != '') {
                    var nodeDesc = parent+'.'+k+':'+typeof target[k];
                    var node = parent+'.'+k;
                } else {
                    var nodeDesc = k+':'+typeof target[k];
                    var node = k;
                }
            } else {
                var node = parent;
            }

            if (elements.indexOf(nodeDesc) == -1) {
                elements.push(nodeDesc);

            }
            getElementList(target[k],elements,node);
        }
    }
}


db.prototype.getEntityPKsSQL = function(tableSchema,tableName) {
    return {id:'getEntityPKsSQL',table_name:tableName};
}

function getEntityPKs(collectionName, done)
{
    done(false, {rows: []});
}


db.prototype.getLimitString = function(limit, offset) {
    return ' LIMIT '+limit+' OFFSET '+offset;
};

db.prototype.setLimitToSQL = function(sql,limit,offset)
{
    return setLimitToSQL(sql,limit,offset);
}

exports.setLimitToSQL = function(sql,limit,offset)
{
    return setLimitToSQL(sql,limit,offset);
}

function setLimitToSQL(sql,limit,offset)
{
        return sql
}

exports.db = db;

exports.testConnection = function(req,data, done) {
    var mongoose = require('mongoose');


    if (data.userName)  //data.userName+':'+data.password
        var dbURI =  'mongodb://'+data.userName+':'+data.password+'@'+data.host+':'+data.port+'/'+data.database;
    else
        var dbURI =  'mongodb://'+data.host+':'+data.port+'/'+data.database;

    var conn = mongoose.createConnection(dbURI,{ server: { poolSize: 5 } });

    conn.on('connected', function () {
        conn.db.listCollections().toArray(function (err, names) {
            if (err)
            {
                saveToLog(req, 'Error testing MONGODB connection for data source' + err.message,'','ERROR','MONGODB', 102);
                done({result:0, msg: err});
                conn.close();
            } else {
                done({result: 1, items: names});
                conn.close();
            }
        });
    });

    conn.on('error',function (err) {
        saveToLog(req, 'Error on MONGODB connection for data source' + err.message,'','ERROR','MONGODB', 102);

        done({result: 0, msg: 'Connection Error'});
    });

};




function getEntityPKsSQL(done)
{

}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function getSqlEntityName(collection)
{
  var tableName = collection.collectionName;
  if (collection.collectionSchema)
      tableName = collection.collectionSchema + '_' +collection.collectionName;

  return tableName;
}

exports.processJoinedCollections = function(req,query,collections, dataSource, thereAreJoins,params,sqlString, done) {
    processJoinedCollections(req,query,collections, dataSource,thereAreJoins, 0,params,sqlString, function(){
        if (collections.length > 1)
        {
            var sqlMem = require('../../sqlMem.js');
            sqlMem.generateMemSQL(req, query, collections, dataSource, params, function(theQuery){

                      var alasql = require('alasql');
                      var allElements = [];
                      var allQueries = '';
                      for (var c in collections)
                      {
                        var tableName = getSqlEntityName(collections[c]);
                        alasql('DROP TABLE IF EXISTS '+tableName);
                      }

                      for (var c in collections)
                      {
                        var tableName = getSqlEntityName(collections[c]);
                        alasql('CREATE TABLE '+tableName);
                        alasql.tables[tableName].data = collections[c].result;
                        allElements.push(collections[c].elements);
                        allQueries = allQueries + '   '+collections[c].sql;
                      }

                      alasql.promise(theQuery).then(function(res){
                        for (var c in collections)
                        {
                          var tableName = getSqlEntityName(collections[c]);
                          alasql('DROP TABLE IF EXISTS '+tableName);
                        }

                        done(res,allElements,allQueries);
                      }).catch(function(err){
                        console.log(err);

                      });

            });


        } else {
          done(collections[0].result,collections[0].elements,collections[0].sql);
        }

    });
};



function processJoinedCollections(req,query,collections, dataSource, thereAreJoins, index,params,sqlString, done)
{
    var collection = (collections[index]) ? collections[index] : false;

    if (!collection) {
        done();
        return;
    }

    //No pagination when there are joins as all data is processed

    if (thereAreJoins && params.page > 1 )
    {
        done();
        return;
    }

    var sql = require('./mongoQuery.js');

    sql.generateSQLForCollection(req,query,collection, dataSource,params, thereAreJoins, function(Querystring,elements){

        connect(dataSource.params.connection, dataSource._id,function (err, connect) {
                    if (err) {
                        saveToLog(req, 'Error on MONGODB connection for data source' + err.message,'','ERROR','MONGODB', 102);
                        done({result: 0, msg: 'Connection Error: ' + err});
                        return;
                    }

                    datasourceID = dataSource._id;
                    runQuery(Querystring, req, query, function (err, result) {
                        if (err) {
                            saveToLog(req, 'error running MONGODB query '+Querystring +' '+ err.message,'','ERROR','MONGODB', 102);
                            done({result: 0, msg: 'Generated Query Error: ' + Querystring, sql: Querystring});
                            end();
                        } else {
                            if (result) {
                                collection.result = result.rows;
                                collection.elements = elements;
                                collection.sql = Querystring;
                                processJoinedCollections(req, query, collections, dataSource, thereAreJoins, index + 1,params,sqlString, done);
                            } else {
                                collection.result = [];
                                collection.elements = elements;
                                collection.sql = Querystring;
                                processJoinedCollections(req,query,collections, dataSource, thereAreJoins, index+1,params,sqlString, done);
                            }

                            end();
                        }
                    });
                });
    });
};
