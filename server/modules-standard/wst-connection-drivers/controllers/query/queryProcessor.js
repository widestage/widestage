exports.runQuery = function(req, datasourceID,queryText, data, setresult) {

    var dbController = require('../db/connect/'+data.type+'/'+data.type+'.js');

    var db = new dbController.db();

    if (queryText.indexOf('{{limitTop100}}') != -1)
    {
        queryText = queryText.replace('{{limitTop100}}','');
        queryText = db.setLimitToSQL(queryText,100,0);
    }

    db.connect(data,datasourceID, function(err, connection) {

        if(err) {
            console.log(data.type+' default connection error: ', err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
        }

        db.query(queryText, req, undefined,function(err, result) {
            if (err)
            {
                setresult({result: 0, msg: 'Error executing the query : '+err});

            } else {
              if (global.PROquotas)
                  global.PROquotas.saveQueryQuota(req,result.rows);
                setresult({result: 1, items: result.rows});
            }
            db.end();
        });

    });
};


exports.getTop100 = function(req, datasourceID, table_name, data, setresult) {

    var dbController = require('../db/connect/'+data.type+'/'+data.type+'.js');

    var db = new dbController.db();

    db.connect(data,datasourceID, function(err, connection) {

        if(err) {
            console.log(data.type+' default connection error: ', err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
        }

        db.getTop100(table_name, req, function(err, result) {
            if (err)
            {
                setresult({result: 0, msg: 'Error executing the query : '+err});

            } else {
              if (global.PROquotas)
                  global.PROquotas.saveQueryQuota(req,result.rows);
                setresult({result: 1, items: result.rows});
            }
            db.end();
        });

    });
};

exports.processQuery = function(req,query,params,done)
{

    processDataSources(req,query.datasources,query.layers, params,query, done, undefined, undefined);
}



function processDataSources(req,dataSources,layers, params,query, done, result, index) {
    var index = (index) ? index : 0;
    if (dataSources)
        var dataSource = (dataSources[index]) ? dataSources[index] : false;
    var result = (result) ? result : [];
    var thereAreJoins = false;
    
    if (!dataSource || dataSource.datasourceID == undefined) {

        if (query.pivot && global.proPivot && result.data && result.data.length > 0)
        {
            global.proPivot.generatePivot(query.pivot,result,function(pivotedResults){
                if (query.analytics && global.proAnalytics)
                {
                    global.proAnalytics.applyRowAnalytics(query.analytics,pivotedResults,function(newResults){
                        done(pivotedResults);
                    });
                } else 
                    done(pivotedResults);

                return;
            });
        } else {
        done(result);
        return;
        }
    } else {

    if (query.version == 2) //Ver March 2020
    {
        var DataSources = connection.model('Connections');
        //TODO: if datasource is stopped
        DataSources.findOne({ _id: dataSource.datasourceID}, {}, function (err, dts) {
            if (dts) {
                
                var DBLquotes = '';
                if (dts.params && dts.params.quotedElementNames)
                    DBLquotes = '"';
                    
            
    
                    sqlNamingConvention(dataSource,query,DBLquotes);

                    for (var n in query.joins)
                    {

                        if (query.joins[n])
                        {
                        for (var j in dataSource.collections) {

                            

                            if (query.joins[n].sourceParentID == dataSource.collections[j].collectionID || query.joins[n].targetParentID == dataSource.collections[j].collectionID) {
                                {

                                    

                                    if (query.joins[n].sourceParentID == dataSource.collections[j].collectionID)
                                        var theOther = query.joins[n].targetParentID;
                                    if (query.joins[n].targetParentID == dataSource.collections[j].collectionID)
                                        var theOther = query.joins[n].sourceParentID;

                                    if (isTargetInvolved(dataSource.collections,theOther))
                                    {
                                        
                                        if (!dataSource.collections[j]['joins'])
                                            dataSource.collections[j]['joins'] = [];

                                        dataSource.collections[j]['joins'].push(query.joins[n]);

                                        thereAreJoins = true;
                                    }
                                }
                            }
                        }
                    }
                    }



                processCollections(req,query,dataSource.collections, dts, params,thereAreJoins, function(data) {
                    result = data;
                    processDataSources(req,dataSources,layers, params, query, done, result, index+1);
                });

            } else {
                result = {result: 0, msg: 'This Datasource does not exists anymore! '+dataSource.datasourceID};
                processDataSources(req,dataSources,layers, params, query, done, result, index+1);
            }
        });

    } else {

    //for compatibility purposes
    var Layers = connection.model('Layers');
    Layers.find({ _id: {$in:layers}},{}, function (err, theLayers) {
        //TODO: if layer is stopped
        if (theLayers)
        {

            var DataSources = connection.model('Connections');
            //TODO: if datasource is stopped
            DataSources.findOne({ _id: dataSource.datasourceID}, {}, function (err, dts) {
                if (dts) {

                    var DBLquotes = '';
                    if (dts.params && dts.params.quotedElementNames)
                        DBLquotes = '"';
                        
                
                    for (var l in theLayers)
                    {


                        for (var j in dataSource.collections) {

                                if (dataSource.collections[j]['collectionSchema']) {
                                    dataSource.collections[j]['sqlEntityName'] = DBLquotes+dataSource.collections[j]['collectionSchema']+DBLquotes+'.'+DBLquotes+dataSource.collections[j]['collectionName']+DBLquotes;
                                    dataSource.collections[j]['sqlEntityAlias'] = dataSource.collections[j]['collectionSchema']+'_'+dataSource.collections[j]['collectionName'];
                                } else {
                                    dataSource.collections[j]['sqlEntityName'] = DBLquotes+dataSource.collections[j]['collectionName']+DBLquotes;
                                    dataSource.collections[j]['sqlEntityAlias'] = '';
                                }

                                if (dataSource.collections[j].collectionType === 'SQL')
                                {
                                    dataSource.collections[j]['sqlEntityName'] = '('+ dataSource.collections[j]['collectionSQL']+') ';
                                    //dataSource.collections[j]['sqlEntityAlias'] = 'wst'+ dataSource.collections[j]['collectionID'];
                                    dataSource.collections[j]['sqlEntityAlias'] = dataSource.collections[j]['collectionName']
                                }

                                
                                for (var c in query.columns)
                                {
                                    if (query.columns[c].collectionID == dataSource.collections[j].collectionID)
                                    {
                                        query.columns[c]['sqlEntityAlias'] = dataSource.collections[j]['sqlEntityAlias'];
                                        query.columns[c]['sqlEntityName'] = dataSource.collections[j]['sqlEntityName'];
                                    }
                                }

                                for (var o in query.order)
                                {
                                    if (query.order[o].collectionID == dataSource.collections[j].collectionID)
                                    {
                                        query.order[o]['sqlEntityAlias'] = dataSource.collections[j]['sqlEntityAlias'];
                                        query.order[o]['sqlEntityName'] = dataSource.collections[j]['sqlEntityName'];
                                    }
                                }

                                for (var cc in dataSource.collections[j].columns)
                                {
                                  dataSource.collections[j].columns[cc]['sqlEntityAlias'] = dataSource.collections[j]['sqlEntityAlias'];
                                  dataSource.collections[j].columns[cc]['sqlEntityName'] = dataSource.collections[j]['sqlEntityName'];
                                }

                        }

                        for (var n in theLayers[l].model.joins)
                        {

                            for (var j in dataSource.collections) {

                                

                                if (theLayers[l].model.joins[n].sourceParentID == dataSource.collections[j].collectionID || theLayers[l].model.joins[n].targetParentID == dataSource.collections[j].collectionID) {
                                    {

                                        

                                        if (theLayers[l].model.joins[n].sourceParentID == dataSource.collections[j].collectionID)
                                            var theOther = theLayers[l].model.joins[n].targetParentID;
                                        if (theLayers[l].model.joins[n].targetParentID == dataSource.collections[j].collectionID)
                                            var theOther = theLayers[l].model.joins[n].sourceParentID;

                                        if (isTargetInvolved(dataSource.collections,theOther))
                                        {
                                            
                                            if (!dataSource.collections[j]['joins'])
                                                dataSource.collections[j]['joins'] = [];

                                            dataSource.collections[j]['joins'].push(theLayers[l].model.joins[n]);

                                            thereAreJoins = true;
                                        }
                                    }
                                }
                            }
                        }

                    }

                    processCollections(req,query,dataSource.collections, dts, params,thereAreJoins, function(data) {
                        result = data;
                        processDataSources(req,dataSources,layers, params, query, done, result, index+1);
                    });

                } else {
                    result = {result: 0, msg: 'This Datasource does not exists anymore! '+dataSource.datasourceID};
                    processDataSources(req,dataSources,layers, params, query, done, result, index+1);
                }
            });
        }
    });
    } //end of not query version 2
}
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function sqlNamingConvention(dataSource,query,DBLquotes)
{
    for (var j in dataSource.collections) {

        var schemaAlias = '';
        if (dataSource.collections[j]['collectionSchema'])
            schemaAlias = dataSource.collections[j]['collectionSchema'].split('-').join('_')+'_';

        var schemaName = DBLquotes+dataSource.collections[j]['collectionSchema']+DBLquotes+'.';
        if (schemaName.includes("-", 0))
            schemaName = "";

        if (dataSource.collections[j]['collectionSchema']) {
            dataSource.collections[j]['sqlEntityName'] = schemaName+DBLquotes+dataSource.collections[j]['collectionName']+DBLquotes;
            dataSource.collections[j]['sqlEntityAlias'] = schemaAlias+dataSource.collections[j]['collectionName'];
        } else {
            dataSource.collections[j]['sqlEntityName'] = DBLquotes+dataSource.collections[j]['collectionName']+DBLquotes;
            dataSource.collections[j]['sqlEntityAlias'] = '';
        }

        if (dataSource.collections[j].collectionType === 'SQL')
        {
            dataSource.collections[j]['sqlEntityName'] = '('+ dataSource.collections[j]['collectionSQL']+') ';
            //dataSource.collections[j]['sqlEntityAlias'] = 'wst'+ dataSource.collections[j]['collectionID'];
            dataSource.collections[j]['sqlEntityAlias'] = dataSource.collections[j]['collectionName']
        }

        
        for (var c in query.columns)
        {
            if (query.columns[c].collectionID == dataSource.collections[j].collectionID)
            {
                query.columns[c]['sqlEntityAlias'] = dataSource.collections[j]['sqlEntityAlias'];
                query.columns[c]['sqlEntityName'] = dataSource.collections[j]['sqlEntityName'];
            }
        }

        for (var o in query.order)
        {
            if (query.order[o].collectionID == dataSource.collections[j].collectionID)
            {
                query.order[o]['sqlEntityAlias'] = dataSource.collections[j]['sqlEntityAlias'];
                query.order[o]['sqlEntityName'] = dataSource.collections[j]['sqlEntityName'];
            }
        }

        for (var cc in dataSource.collections[j].columns)
        {
          dataSource.collections[j].columns[cc]['sqlEntityAlias'] = dataSource.collections[j]['sqlEntityAlias'];
          dataSource.collections[j].columns[cc]['sqlEntityName'] = dataSource.collections[j]['sqlEntityName'];
        }

    }
}

function processCollections(req,query,collections, dataSource, params,thereAreJoins, done)
{
    var dbms = require('../db/connect/'+dataSource.type+'/'+dataSource.type+'.js');

        var sql = require('../db/sqlv2.js');

        var querySTR = JSON.stringify(query)+JSON.stringify(params);
        var qhash = querySTR.hashCode();

    sql.generateSQL(req, dbms, query, collections, dataSource, params, thereAreJoins, true, function (cleanSQLstring, elements) {

        sql.generateSQL(req, dbms, query, collections, dataSource, params, thereAreJoins, false, function (SQLstring, elements) {

            if (dataSource.params.packetSize && params.page > 0) {
                if (dataSource.params.packetSize != -1)
                    SQLstring = dbms.setLimitToSQL(SQLstring, dataSource.params.packetSize, ((params.page - 1 ) * dataSource.params.packetSize));
            } else {

                if (config.query.defaultRecordsPerPage > 1 && params.page > 0) {
                    SQLstring = dbms.setLimitToSQL(SQLstring, config.query.defaultRecordsPerPage, ((params.page - 1 ) * config.query.defaultRecordsPerPage));
                }

            }
            
            if (global.PROcache && !req.query.forceRefresh)
               {
                   global.PROcache.checkForCache(req, qhash, SQLstring, query, dataSource, function (cacheResults, cacheTimeInSecs, cacheSQL) {
                      if (!cacheResults) {
                        executeQuery(req, dbms, dataSource, collections, thereAreJoins, params, query, SQLstring, elements, function(results)
                            {
                                results.cleanSQL = cleanSQLstring;


                              if (results.result == 1 && cacheTimeInSecs > 1)
                                  {
                                    global.PROcache.saveToCache(req, qhash, results.sql, datasourceID, results.data, cacheTimeInSecs);
                                    if (global.PROquotas)
                                        global.PROquotas.saveQueryQuota(req, results.data);
                                    done(results);
                                  } else {
                                    //there is an error, we don´t save this in cache
                                    done(results);
                                  }
                            });

                      } else {
                        if (global.PROquotas)
                            global.PROquotas.saveQueryQuota(req, cacheResults);
                        done({result: 1, data: cacheResults, sql: cacheSQL, fromCache: true});
                      }
                    });
               } else {
                 executeQuery(req, dbms, dataSource, collections, thereAreJoins, params, query, SQLstring, elements, function(results)
                     {
                        results.cleanSQL = cleanSQLstring;
                        if (global.PROquotas)
                            global.PROquotas.saveQueryQuota(req, results.data);
                        done(results);

                     });
               }
        });
    });
};

function executeQuery(req, dbms, dataSource, collections, thereAreJoins, params, query, SQLstring, elements, done)
{
  if (dataSource.type === 'MONGODB' || dataSource.type === 'ELASTIC')
  {
    dbms.processJoinedCollections(req,query,collections, dataSource, thereAreJoins, params, SQLstring, function(error,mergedResults,mergedElements,query){
        if (error)
            {
            done(error);
            return;
            }
        
        if (mergedResults)
            getFormatedResult(mergedElements, mergedResults, function (finalResults) {
                done({result: 1, data: finalResults, sql: query});
            });
        else {
            done({result: 1, data: [], sql: query});
        }
    });
  } else {
        dbms.connect(dataSource.params.connection,dataSource._id, function (err, connect) {
            if (err) {
                done({result: 0, msg: 'Connection Error: ' + err, sql: SQLstring});
                return;
            }

            datasourceID = dataSource._id;


            dbms.runQuery(SQLstring, req, query, function (err, result) {

                if (err) {
                    done({result: 0, msg: 'Query Error: ' + err, sql: SQLstring});
                    dbms.end();
                } else {
                    if (result)
                        getFormatedResult(elements, result.rows, function (finalResults) {
                            done({result: 1, data: finalResults, sql: SQLstring});
                        });
                    else {
                        done({result: 1, data: [], sql: SQLstring});
                    }

                    dbms.end();
                }
            });
        });

    }
}


function isTargetInvolved(collections,theOtherID)
{
    var found = false;

    for (var collection in collections)
    {
        if (collections[collection].collectionID == theOtherID)
            found = true;
    }
    return found;
}

function getFormatedResult(elementSchema,results,done)
{
    var finalResults = [];
    var moment = require('moment');


    for (var r in results)
    {
        for (var es in elementSchema)
        {
            var newRecord = {};
            var field = elementSchema[es];

            if (elementSchema[es].elementType == 'DATE' && elementSchema[es].format)
            {
                results[r][elementSchema[es].id+'_original'] = results[r][elementSchema[es].id];
                if (results[r][elementSchema[es].id])
                {
                    var date = new Date(results[r][elementSchema[es].id]);
                    results[r][elementSchema[es].id] = moment(date).format(elementSchema[es].format);
                }
            }

            for (var f in results[r])
            {
                newRecord[f.toLowerCase()] = results[r][f];
            }

        }

        finalResults.push(newRecord);
    }
    done(finalResults);

}


