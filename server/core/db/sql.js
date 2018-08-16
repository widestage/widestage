exports.processCollections = function(req,query,collections, dataSource, params,thereAreJoins, done) {
    processCollections(req,query,collections, dataSource, params,thereAreJoins, done);
};

function generateShortUID() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
}

exports.getSchemas = function(data, setresult) {
    switch (data.type) {
        case 'MySQL': var db = 'mysql';
            break;
        case 'POSTGRE': var db = 'postgresql';
            break;
        case 'ORACLE': var db = 'oracle';
            break;
        case 'MSSQL': var db = 'mssql';
            break;
        case 'JDBC-ORACLE': var db = 'jdbc-oracle';
            break;
        case 'BIGQUERY': var db = 'bigQuery';
    }

    var dbController = require('./'+db+'.js');

//    if (data.type == 'MySQL' || data.type == 'POSTGRE' || data.type == 'ORACLE' || data.type == 'MSSQL')
  //      {}

    var db = new dbController.db();

    db.connect(data, function(err, connection) {
        if(err) {
            console.log(data.type+' default connection error: ', err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
        }

        var collections = data.entities;

        //get schemas
        var schemas = [];
        var tables = [];
        var schemasTables = [];


        for (var i in collections) {
            if (String(collections[i].name).indexOf(".") > -1) {
                var res = String(collections[i].name).split('.');
                var schema = res[0];
                var table = res[1];
            }
            else {
                var schema = collections[i].table_schema;
                var table = collections[i].name;
            }

            if (schemas.indexOf(schema) == -1)
                schemas.push(schema);
            if (tables.indexOf(table) == -1)
                tables.push(table);

            if (schema != undefined)
                {
                    if (schemasTables.indexOf(schema+'.'+table) == -1)
                        {
                            var stable = {name: schema+'.'+table, schema:schema, table:table};
                            schemasTables.push(stable);
                        }
                } else {
                    if (schemasTables.indexOf(table) == -1)
                        {
                            var stable = {name: table, schema:schema, table:table};
                            schemasTables.push(stable);
                        }
                }
        }

        var newSchemas = schemas.length === 0 ? "" : "'" + schemas.join("','") + "'";
        var newTables = tables.length === 0 ? "" : "'" + tables.join("','") + "'";

        var query = db.getSchemaQuery(newSchemas, newTables);

        db.query(query, function(err, result) {
            if (err)
                {
                  setresult({result: 0, msg: 'Error getting the element schemas : '+ err});
                    console.log('Error getting the element schemas : ',err);
                } else {
                    var schemas = [];

                    if (result.rows)
                        {
                            for (var s in schemasTables) {
                                getCollectionSchema(schemasTables[s], result.rows, function (resultCollection) {
                                   schemas.push(resultCollection);
                                });
                            }
                        }
                    debug({result: 1, items: schemas});
                    setresult({result: 1, items: schemas});
                }
            db.end();


        });

    });
};


exports.getSqlQuerySchema = function(data, setresult) {
    switch (data.type) {
        case 'MySQL': var db = 'mysql';
            break;
        case 'POSTGRE': var db = 'postgresql';
            break;
        case 'ORACLE': var db = 'oracle';
            break;
        case 'MSSQL': var db = 'mssql';
             break;
        case 'JDBC-ORACLE': var db = 'jdbc-oracle';
            break;
        case 'BIGQUERY': var db = 'bigQuery';
    }

    var dbController = require('./'+db+'.js');

    var db = new dbController.db();
    db.connect(data, function(err, connection) {
        if(err) {
            console.log(data.type+' default connection error: ', err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
        }

        var query = db.setLimitToSQL('SELECT * FROM ('+data.sqlQuery.sql+') wst_q1 ',1,0);


            db.query(query, function(err, finalresult) {
                if (finalresult)
                    {
                        getSQLResultsSchema(data.sqlQuery.name,finalresult.rows,data.sqlQuery.sql, function(collection){
                            var schemas = [];
                            schemas.push(collection);
                            debug({result: 1, items: schemas});
                            setresult({result: 1, items: schemas});
                        });
                    } else {
                        setresult({result: 0, msg: err});
                    }
                db.end();

            });
    });
};

function getSQLResultsSchema(collectionName,queryResults,sqlQuery, done) {

    var collectionID = 'WST'+generateShortUID();

    collectionID =  collectionID.replace(new RegExp('-', 'g'), '');
    var theCollection = {collectionID: collectionID ,collectionName: collectionName,visible:true,collectionLabel:collectionName,isSQL:true,sqlQuery:sqlQuery};
    theCollection.elements = [];

    for (var key in queryResults[0])
        {
        var dbstruc = {};
        var elements = [];

         var name = key;
         var type = 'string';

         if (typeof(queryResults[0][key]) == 'number')
             if(isNaN(queryResults[0][key]) == false)
                 type = 'number';


        //TODO: type = 'date'; json type = object , NaN = false

        if (typeof(queryResults[0][key]) == 'boolean')
                type = 'boolean';




        var elementID = 'wst'+generateShortUID();
        var isVisible = true;

            if (name != 'wst_rnum') //not for the row num for Oracle limit
                theCollection.elements.push({elementID:elementID,elementName:name,elementType:type,visible:isVisible,elementLabel:name})


        }



    done(theCollection);
}

exports.getReverseEngineering = function(datasourceID, data, setresult) {
    //var uuid = require('node-uuid');

    switch (data.type) {
        case 'MySQL': var db = 'mysql';
            break;
        case 'POSTGRE': var db = 'postgresql';
            break;
        case 'ORACLE': var db = 'oracle';
            break;
        case 'MSSQL': var db = 'mssql';
            break;
        case 'BIGQUERY': var db = 'bigQuery';
            break;
        case 'JDBC-ORACLE': var db = 'jdbc-oracle';
    }

    var dbController = require('./'+db+'.js');

    var db = new dbController.db();

    db.connect(data, function(err, connection) {
        if(err) {
            console.log(data.type+' default connection error: ', err);
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: ', err);
        }

        var schemas = [];
        var tables = [];
        var processedSchemas = [];

        var query = db.getTables();
            //get tables
            db.query(query, function(err, result) {

                //get all schemas
                for (var d = 0; d < result.rows.length; d++) {
                    if (processedSchemas.indexOf(result.rows[d].table_schema) == -1)
                        {
                            schemas.push({schema_name:result.rows[d].table_schema,datasourceID:datasourceID});
                            processedSchemas.push(result.rows[d].table_schema);

                        }

                };

                //tables
                for (var d = 0; d < result.rows.length; d++) {

                    for (var s = 0; s < schemas.length; s++)
                        {
                            if (schemas[s].schema_name == result.rows[d].table_schema)
                                {
                                    var table = {};
                                    table.table_name = result.rows[d].table_name;
                                    if (result.rows[d].table_schema)
                                        table.element_name = result.rows[d].table_schema+'.'+result.rows[d].table_name;
                                    else
                                        table.element_name = result.rows[d].table_name;

                                    table.schema_name = result.rows[d].table_schema;
                                    table.table_columns = [];
                                    table.datasourceID = datasourceID;
                                    //table.collectionID = uuid.v4();
                                    table.collectionID = generateShortUID();
                                    //schemas[s].schema_tables.push(table);
                                    tables.push(table);
                                }
                        }
                };

                //columns
                var queryColumns = db.getColumns();
                db.query(queryColumns, function(err, result2) {

                    for (var d = 0; d < result2.rows.length; d++) {

                                    for (var t = 0; t < tables.length; t++)
                                    {
                                        if (tables[t].table_name == result2.rows[d].table_name)
                                            {
                                                var column = {};
                                                column.column_name = result2.rows[d].column_name;
                                                if (result2.rows[d].table_schema)
                                                    column.element_name = result2.rows[d].table_schema+'.'+result2.rows[d].column_name;
                                                    else
                                                    column.element_name = result2.rows[d].column_name;

                                                column.data_type = result2.rows[d].data_type;
                                                column.is_nullable = result2.rows[d].is_nullable;
                                                column.length = result2.rows[d].length;
                                                column.precission = result2.rows[d].precission;
                                                column.scale = result2.rows[d].scale;
                                                column.table_schema = result2.rows[d].table_schema;
                                                column.table_name = result2.rows[d].table_name;
                                                column.collectionID = tables[t].collectionID;
                                                column.isPK = false;
                                                //column.elementID = uuid.v4();
                                                column.elementID = generateShortUID();
                                                column.datasourceID = datasourceID;
                                                tables[t].table_columns.push(column);
                                            }
                                    }

                    }




                        var queryJoins = db.getTableJoins();
                        db.query(queryJoins, function(err, result3) {

                            var tempJoins = [];

                            for (var d = 0; d < result3.rows.length; d++) {

                                            for (var t = 0; t < tables.length; t++)
                                            {
                                                    if (tables[t].table_name == result3.rows[d].table_name
                                                        &&
                                                        tables[t].schema_name == result3.rows[d].table_schema)
                                                        {
                                                            for (var c = 0; c < tables[t].table_columns.length; c++)
                                                            {
                                                                      if (tables[t].table_columns[c].column_name == result3.rows[d].column_name)
                                                                          {
                                                                                var join = {};
                                                                                join.schema_name = tables[t].schema_name;
                                                                                join.table_name = tables[t].table_name;
                                                                                join.collectionID = tables[t].collectionID;
                                                                                join.column_name = tables[t].table_columns[c].column_name;
                                                                                join.elementID = tables[t].table_columns[c].elementID;
                                                                                join.datasourceID = datasourceID;
                                                                                join.isNative = true;
                                                                                join.joinID = generateShortUID();
                                                                                tempJoins.push(join);

                                                                          }
                                                            }
                                                        }
                                            }
                            }

                            //referenced column

                            for (var d = 0; d < result3.rows.length; d++) {

                                            for (var t = 0; t < tables.length; t++)
                                            {
                                                    if (tables[t].table_name == result3.rows[d].foreign_table_name
                                                        &&
                                                        tables[t].schema_name == result3.rows[d].foreign_table_schema)
                                                        {
                                                            for (var c = 0; c < tables[t].table_columns.length; c++)
                                                            {
                                                                      if (tables[t].table_columns[c].column_name == result3.rows[d].foreign_column_name)
                                                                          {

                                                                               for (var j in tempJoins)
                                                                                   {
                                                                                       if (tempJoins[j].schema_name == result3.rows[d].table_schema &&  tempJoins[j].table_name == result3.rows[d].table_name && tempJoins[j].column_name == result3.rows[d].column_name)
                                                                                           {
                                                                                               tempJoins[j].foreign_table_schema = result3.rows[d].foreign_table_schema;
                                                                                               tempJoins[j].foreign_table_name = result3.rows[d].foreign_table_name;
                                                                                               tempJoins[j].foreign_column_name = result3.rows[d].foreign_column_name;
                                                                                               tempJoins[j].foreign_elementID = tables[t].table_columns[c].elementID;
                                                                                               tempJoins[j].foreign_collectionID = tables[t].table_columns[c].collectionID;
                                                                                           }
                                                                                   }
                                                                          }
                                                            }
                                                        }
                                            }
                            }

                            //Primary keys
                            var querypks = db.getPKs();
                            db.query(querypks, function(err, result4) {

                                for (var d = 0; d < result4.rows.length; d++) {

                                    for (var t = 0; t < tables.length; t++)
                                            {
                                                    if (tables[t].table_name == result4.rows[d].table_name
                                                        &&
                                                        tables[t].schema_name == result4.rows[d].table_schema)
                                                        {
                                                            for (var c = 0; c < tables[t].table_columns.length; c++)
                                                            {
                                                                      if (tables[t].table_columns[c].column_name == result4.rows[d].column_name)
                                                                          {
                                                                              tables[t].table_columns[c].isPK = true;
                                                                              tables[t].table_columns[c].pkPosition = result4.rows[d].position_in_unique_constraint;
                                                                          }
                                                            }
                                                        }
                                            }

                                }



                                var model = {schemas: schemas,tables:tables,joins:tempJoins};
                                debug({result: 1, items: model});
                                setresult({result: 1, items: model});
                                db.end();
                            });

                        });



                });


            });

    });
};

function getCollectionSchema(collection,queryResults, done) {

    var collectionName = collection.name;
    var collectionID = 'WST'+generateShortUID();

    collectionID =  collectionID.replace(new RegExp('-', 'g'), '');
    var theCollection = {collectionID: collectionID ,collectionName: collectionName,visible:true,collectionLabel:collectionName};
    theCollection.elements = [];

    for (var d = 0; d < queryResults.length; d++) {
        var dbstruc = {};
        var elements = [];

        if (queryResults[d].table_schema == collection.schema && queryResults[d].table_name == collection.table)
        {
            var name = queryResults[d].column_name;
            var type = 'string';
            /*string, number, boolean, date,
             {name:"string",value:"string"},
             {name:"number",value:"number"},
             {name:"boolean",value:"boolean"},
             {name:"date",value:"date"},*/

            if (queryResults[d].data_type == 'smallint' ||
                queryResults[d].data_type == 'integer' ||
                queryResults[d].data_type == 'bigint' ||
                queryResults[d].data_type == 'number' ||
                queryResults[d].data_type == 'decimal' ||
                queryResults[d].data_type == 'numeric' ||
                queryResults[d].data_type == 'real' ||
                queryResults[d].data_type == 'double precision' ||
                queryResults[d].data_type == 'serial' ||
                queryResults[d].data_type == 'bigserial' ||
                queryResults[d].data_type == 'money')
                type = 'number';

            if (queryResults[d].data_type == 'timestamp without time zone' ||
                queryResults[d].data_type == 'timestamp with time zone' ||
                queryResults[d].data_type == 'date' ||
                queryResults[d].data_type == 'time without time zone' ||
                queryResults[d].data_type == 'time with time zone' ||
                queryResults[d].data_type == 'abstime' ||
                queryResults[d].data_type == 'interval' )
                type = 'date';

            var dataType = queryResults[d].data_type;
            if (dataType)
                if (dataType.indexOf("timestamp") > -1)
                    type = 'date';

            if (queryResults[d].data_type == 'boolean')
                type = 'boolean';


            var elementID = generateShortUID();
            var isVisible = true;
            theCollection.elements.push({elementID:elementID,elementName:name,elementType:type,visible:isVisible,elementLabel:name,data_type:queryResults[d].data_type})


        }

    }

    done(theCollection);


    /*
     var collection = db.collection(collectionName);
     collection.find().limit(100).toArray(function(err, results) {


     for (var i = 0; i < results.length; i++) {
     //getKP(results[i],dbstruc);
     getElementList(results[i],elements,'');
     }

     var names = [];

     schemas.push(theCollection);
     getCollectionSchema(db,collections,index+1,schemas, done);
     }); */
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
                //is an array

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

function processCollections(req,query,collections, dataSource, params, thereAreJoins, setresult,  index) {
    var from = [];
    var fields = [];
    var groupBy = [];
    var joins = [];
    var processedCollections = [];
    var elements = [];
    var leadTable = {};
    var leadTableJoinsCount = 0;
    if (collections.length == 1)
    {
        leadTable = collections[0];
    }

    for (var c in collections) {
        var table = collections[c];
        table.joinsCount = 0;

        for (var j in table.joins) {
            var join = table.joins[j];
            if (join.sourceCollectionID == table.collectionID)
            {
                table.joinsCount = table.joinsCount + 1;
            }

            if (join.targetCollectionID == table.collectionID)
            {
                table.joinsCount = table.joinsCount + 1;
            }
        }

        if (table.joinsCount > leadTableJoinsCount)
        {
            leadTable = table;
            leadTableJoinsCount = table.joinsCount;
        }

    }


    for (var c in collections) {
        var table = collections[c];
        var strJoin = '';



        for (var j in table.joins) {

            var join = table.joins[j];

            if (join.sourceCollectionID == table.collectionID)
            {

                if (join.joinType == 'default')
                    strJoin = ' INNER JOIN ';

                processedCollections.push(join.targetCollectionID);

                strJoin = strJoin + join.targetCollectionName +' '+ join.targetCollectionID + ' ON (';

                strJoin = strJoin + join.sourceCollectionID + '.' + join.sourceElementName + ' = ' + join.targetCollectionID + '.' + join.targetElementName;
                strJoin = strJoin + ')';
            }

        }

        if (processedCollections.indexOf(table.collectionID) == -1)
            //from.push(table.schema.collectionName +' '+table.collectionID + strJoin);
            from.push(table.collectionName +' '+table.collectionID + strJoin);

        processedCollections.push(table.collectionID);

        for (var e in table.columns)
        {
            var field = table.columns[e];
            elements.push(field);


                if (field.hidden != true)
                    {
                        var elementID = 'wst'+field.elementID.toLowerCase();
                        var theElementID = elementID.replace(/[^a-zA-Z ]/g,'');


                        if (field.aggregation) {
                            found = true;
                            switch (field.aggregation) {
                                case 'sum': fields.push('SUM('+table.collectionID+'.'+field.elementName+')'+ ' as '+theElementID+'sum');
                                    break;
                                case 'avg': fields.push('AVG('+table.collectionID+'.'+field.elementName+')'+ ' as '+theElementID+'avg');
                                    break;
                                case 'min': fields.push('MIN('+table.collectionID+'.'+field.elementName+')'+ ' as '+theElementID+'min');
                                    break;
                                case 'max': fields.push('MAX('+table.collectionID+'.'+field.elementName+')'+ ' as '+theElementID+'max');
                                    break;
                                case 'count': fields.push('COUNT('+table.collectionID+'.'+field.elementName+')'+ ' as '+theElementID+'count');
                            }
                        } else {
                            fields.push(table.collectionID+'.'+field.elementName + ' as '+theElementID);
                            if (dataSource.type != 'BIGQUERY')
                                groupBy.push(table.collectionID+'.'+field.elementName);
                                else
                                groupBy.push(theElementID);
                        }
                    }
        }

    }

    var SQLstring = 'SELECT ';

    for (var f in fields)
    {
        if (f == fields.length -1)
            SQLstring = SQLstring + fields[f];
        else
            SQLstring = SQLstring + fields[f]+', ';
    }


    if (leadTable.schema)
        {
        if (leadTable.schema.isSQL == true)
            {
                SQLstring = SQLstring + ' FROM ('+ leadTable.schema.sqlQuery + ') '+ leadTable.collectionID + getJoins(leadTable.collectionID,collections,[]);
            } else {
                SQLstring = SQLstring + ' FROM '+ leadTable.schema.collectionName + ' '+ leadTable.collectionID + getJoins(leadTable.collectionID,collections,[]);
            }
        } else {
           if (leadTable.isSQL == true)
            {
                SQLstring = SQLstring + ' FROM ('+ leadTable.sqlQuery + ') '+ leadTable.collectionID + getJoins(leadTable.collectionID,collections,[]);
            } else {
                SQLstring = SQLstring + ' FROM '+ leadTable.collectionName + ' '+ leadTable.collectionID + getJoins(leadTable.collectionID,collections,[]);
            }
        }


    var havings = [];
    getFilters(query, function(filtersResult,havingsResult){

        if (filtersResult.length > 0)
            SQLstring += ' WHERE ';

        for (var fr in filtersResult)
            SQLstring += filtersResult[fr];
        havings = havingsResult;



        if (groupBy.length > 0)
            SQLstring = SQLstring + ' GROUP BY ';


        for (var f in groupBy)
        {
                if (f == groupBy.length -1)
                    SQLstring = SQLstring + groupBy[f];
                else
                    SQLstring = SQLstring + groupBy[f]+', ';
        }

        if (havings.length > 0)
            SQLstring += ' HAVING ';

        for (var h in havings)
            SQLstring += havings[h];

        if (query.order)
            if (query.order.length > 0)
            {
                var theOrderByString = '';

                for (var f in query.order)
                {
                    var theOrderField = query.order[f];
                    var theOrderFieldName = '';
                    var theShortOrderFieldName = '';
                    var elementID = 'wst'+theOrderField.elementID.toLowerCase();
                    var theElementID = elementID.replace(/[^a-zA-Z ]/g,'');

                    if (theOrderField.aggregation) {
                        found = true;
                        var AGG = theOrderField.aggregation.toUpperCase();

                        theSortOrderFieldName =     AGG+'('+theOrderField.collectionID+'.'+theOrderField.elementName+')';
                        theOrderFieldName = theSortOrderFieldName+ ' as '+theElementID+theOrderField.aggregation;

                        /*
                        switch (theOrderField.aggregation) {
                            case 'sum': {
                                theSortOrderFieldName = 'SUM('+theOrderField.collectionID+'.'+theOrderField.elementName+')';
                                theOrderFieldName = theSortOrderFieldName+ ' as '+theElementID+'sum';
                                }
                                break;
                            case 'avg': {
                                theShortOrderFieldName =
                                theOrderFieldName = ('AVG('+theOrderField.collectionID+'.'+theOrderField.elementName+')'+ ' as '+theElementID+'avg');
                                } break;
                            case 'min': theOrderFieldName = ('MIN('+theOrderField.collectionID+'.'+theOrderField.elementName+')'+ ' as '+theElementID+'min');
                                break;
                            case 'max': theOrderFieldName = ('MAX('+theOrderField.collectionID+'.'+theOrderField.elementName+')'+ ' as '+theElementID+'max');
                                break;
                            case 'count': theOrderFieldName = ('COUNT('+theOrderField.collectionID+'.'+theOrderField.elementName+')'+ ' as '+theElementID+'count');
                        }*/
                    } else {
                        theSortOrderFieldName = theOrderField.collectionID+'.'+theOrderField.elementName;
                        theOrderFieldName = theSortOrderFieldName + ' as '+theElementID;

                    }


                    var sortType = '';
                    if (query.order[f].sortType == 1)
                            sortType = ' DESC';

                    var theIndex = fields.indexOf(theOrderFieldName);

                    if (theIndex >= 0)
                    {
                        //The order by field is in the result set
                        if (theOrderByString == '')
                            theOrderByString += (theIndex +1)+ sortType;
                        else
                            theOrderByString += ', '+(theIndex +1) + sortType;
                    } else {
                        //No index, the field is not in the result set
                        if (theOrderByString == '')
                            theOrderByString += theSortOrderFieldName+ sortType;
                        else
                            theOrderByString += ', '+theSortOrderFieldName + sortType;

                    }
                }

                console.log('order by string', theOrderByString);


                if (theOrderByString != '')
                    SQLstring += ' ORDER BY ' + theOrderByString;

            }

        switch (dataSource.type) {
            case 'MySQL': var dbController = require('./mysql.js');
                break;
            case 'POSTGRE': var dbController = require('./postgresql.js');
                break;
            case 'ORACLE': var dbController = require('./oracle.js');
                break;
            case 'MSSQL': var dbController = require('./mssql.js');
                break;
            case 'BIGQUERY': var dbController = require('./bigQuery.js');
                break;
            case 'JDBC-ORACLE': var dbController = require('./jdbc-oracle.js');
        }

        var db = new dbController.db();

        if (dataSource.params[0].packetSize)
            {
                if (dataSource.params[0].packetSize != -1)
                    SQLstring = db.setLimitToSQL(SQLstring,dataSource.params[0].packetSize, ((params.page -1 )*dataSource.params[0].packetSize));
            } else {

            if (config.query.defaultRecordsPerPage > 1)
                {
                SQLstring = db.setLimitToSQL(SQLstring,config.query.defaultRecordsPerPage, ((params.page -1 )*config.query.defaultRecordsPerPage));
                }
            }


        //Fix for filters with having and normal filters
        SQLstring = SQLstring.replace("WHERE  AND", "WHERE");

        //console.log(SQLstring);

        if (dataSource.type != 'BIGQUERY')
        {
        db.connect(dataSource.params[0].connection, function(err, connection) {
            if(err) {
                setresult({result: 0, msg: 'Connection Error: '+ err});
                return console.error('Connection Error: ', err);
            }

            db.query(SQLstring, function(err, result) {
                if (err) {
                    setresult({result: 0, msg: 'Generated SQL Error: '+SQLstring,sql:SQLstring});
                    saveToLog(req,'SQL Error: '+err+' ('+SQLstring+')', 300,'SQL-002','QUERY: ('+JSON.stringify(query)+')',undefined);
                    db.end();
                } else {
                    if (result)
                        getFormatedResult(elements,result.rows,function(finalResults){
                            setresult({result: 1, data:finalResults,sql:SQLstring});
                            saveToLog(req,SQLstring, 400,'SQL-001','QUERY: ('+JSON.stringify(query)+')',undefined);
                        });
                    else {
                        setresult({result: 1, data:[],sql:SQLstring});
                    }

                    db.end();
                }
            });
        });

        }  else {
            dataSource.params[0].connection.companyID = req.user.companyID;

            db.executeSQLQuery(dataSource.params[0].connection,SQLstring,function (result) {
                if (result)
                    {
                        getFormatedResult(elements,result,function(finalResults){
                            setresult({result: 1, data:finalResults,sql:SQLstring});
                        });
                    } else {
                        setresult({result: 1, data:[],sql:SQLstring});
                    }
            });
        }
    });
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

                    if (elementSchema[es].elementType == 'date' && elementSchema[es].format)
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


function columnNamesToLowerCase(rows) {
    for (var i in rows) {
        for (var key in rows[i]) {
            rows[i][String(key).toLowerCase()] = rows[i][key];
            delete(rows[i][key]);
        }
    }
    return rows;
}



function getFilters(query,done)
{
    var filters = [];
    var havings = [];

    for (var f in query.groupFilters) {

        var previousRelational = '';

        if (query.groupFilters[f].conditionLabel)
        {
            previousRelational = ' '+query.groupFilters[f].conditionLabel+' ';
        }

        var filterSQL = getFilterSQL(query.groupFilters[f]);

            if (filterSQL != '')
                {
                    if (!query.groupFilters[f].aggregation)
                    {
                        if (f > 0)
                            filterSQL = previousRelational + filterSQL;

                        filters.push(filterSQL);
                    } else {
                        if (havings.length > 0)
                            filterSQL = previousRelational + filterSQL;

                        havings.push(filterSQL);
                    }
                }
    }

    done(filters,havings);

    /*

    for (var g in query.groupFilters) {

        processFilterGroup(query.groupFilters[g],filters,havings,true,function(finalFilters,finalHavings){

            done(finalFilters,finalHavings);

        });


    }

    */

}



function processFilterGroup(group,filters,havings,isRoot,done)
{
   var previousRelational = '';

    if (isRoot == false)
        filters.push("(");
    for (var f in group.filters)
    {

        if (group.filters[f].conditionLabel)
        {
            previousRelational = ' '+group.filters[f].conditionLabel+' ';
        }

        if (!group.filters[f].conditionLabel)
        {
            var filterSQL = getFilterSQL(group.filters[f]);

            if (filterSQL != '')
                {
                    if (!group.filters[f].aggregation)
                    {
                        if (f > 0)
                            filterSQL = previousRelational + filterSQL;

                        filters.push(filterSQL);
                    } else {
                        if (havings.length > 0)
                            filterSQL = previousRelational + filterSQL;

                        havings.push(filterSQL);
                    }

                    if (group.filters[f].group == true)
                    {
                        processFilterGroup(group.filters[f],filters,havings,false,done);
                    }

                }

        }


    }


    if (isRoot == true)
    {
        done(filters,havings);
    } else {
        filters.push(")");
    }
}


function getFilterSQL(filter,isHaving)
{
    var result = '';


    if (((filter.filterText1 && filter.filterText1 != '') || filter.filterType == 'notNull' || filter.filterType == 'null') ) {
        var filterValue = filter.filterText1;
        var filterElementName = filter.collectionID+'.'+filter.elementName;

        if (filter.aggregation)
            filterElementName = filter.aggregation + '(' + filterElementName + ')';

        if (filter.elementType == 'number') {
            if (filter.filterType != "in" && filter.filterType != "notIn")
                {
                    filterValue = Number(filterValue);
                }
        }

        if (filter.elementType == 'date') {
            result = dateFilter(filterElementName,filterValue,filter);
        }

        if (filter.filterType == "equal" && filter.elementType != 'date') {
            result = filterElementName + ' = ' + escapeFilterValue(filterValue);
        }
        if (filter.filterType == "diferentThan" && filter.elementType != 'date') {
            result = filterElementName + ' <> ' + escapeFilterValue(filterValue);
        }
        if (filter.filterType == "biggerThan" && filter.elementType != 'date' ) {
            result = filterElementName + ' > ' + escapeFilterValue(filterValue);
        }
        if (filter.filterType == "notGreaterThan" && filter.elementType != 'date') {
            result = filterElementName + ' <= ' + escapeFilterValue(filterValue);
        }
        if (filter.filterType == "biggerOrEqualThan" && filter.elementType != 'date') {
            result = filterElementName + ' >= ' + escapeFilterValue(filterValue);
        }
        if (filter.filterType == "lessThan" && filter.elementType != 'date') {
            result = filterElementName + ' < ' + escapeFilterValue(filterValue);
        }
        if (filter.filterType == "lessOrEqualThan" && filter.elementType != 'date') {
            result = filterElementName + ' <= ' + escapeFilterValue(filterValue);
        }
        if (filter.filterType == "between" && filter.elementType != 'date') {
            result = filterElementName + ' BETWEEN ' + escapeFilterValue(filterValue) + ' AND ' + escapeFilterValue(filter.filterText2);
        }
        if (filter.filterType == "notBetween" && filter.elementType != 'date') {
            result = filterElementName + ' NOT BETWEEN ' + escapeFilterValue(filterValue) + ' AND ' + escapeFilterValue(filter.filterText2);
        }
        if (filter.filterType == "contains") {
            result = (filterElementName +' LIKE '+'\'%'+filterValue+'%\'');
        }
        if (filter.filterType == "notContains") {
            result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'%\'');
        }
        if (filter.filterType == "startWith") {
            result = (filterElementName +' LIKE '+'\''+filterValue+'%\'');
        }
        if (filter.filterType == "notStartWith") {
            result = (filterElementName +' NOT LIKE '+'\''+filterValue+'%\'');
        }
        if (filter.filterType == "endsWith") {
            result = (filterElementName +' LIKE '+'\'%'+filterValue+'\'');
        }
        if (filter.filterType == "notEndsWith") {
            result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'\'');
        }
        if (filter.filterType == "like") {
            result = (filterElementName +' LIKE '+'\'%'+filterValue+'%\'');
        }
        if (filter.filterType == "notLike") {
            result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'%\'');
        }
        if (filter.filterType == "null") {
            result = (filterElementName +' IS NULL ');
        }
        if (filter.filterType == "notNull") {
            result = (filterElementName +' IS NOT NULL ');
        }
        if (filter.filterType == "in"  && filter.elementType != 'date') {
            if (filter.elementType == 'number')
            {
                result = (filterElementName +' IN '+'('+filterValue.split(';')+')');
            } else {
                var theSplit = filterValue.split(';');
                var filterSTR = '';
                for (var s in theSplit)
                {
                    if (s == 0)
                        filterSTR += "'"+theSplit[s]+"'";
                    else
                        filterSTR += ",'"+theSplit[s]+"'";
                }
                result = (filterElementName +' IN '+'('+filterSTR+')');
            }

        }
        if (filter.filterType == "notIn" && filter.elementType != 'date') {
            if (filter.elementType == 'number')
            {
                result = (filterElementName +' NOT IN '+'('+String(filterValue).split(';')+')');
            } else {
                var theSplit = filterValue.split(';');
                var filterSTR = '';
                for (var s in theSplit)
                {
                    if (s == 0)
                        filterSTR += "'"+theSplit[s]+"'";
                    else
                        filterSTR += ",'"+theSplit[s]+"'";
                }
                result = (filterElementName +' NOT IN '+'('+filterSTR+')');
            }
        }
    }

    return result;
}

function escapeFilterValue(filter) {
    return filter.elementType == 'number' ? filterValue : '\''+filterValue+'\'';
}



function getJoins(collectionID,collections,processedCollections)
{
    var fromSQL = '';
    for (var c in collections) {
        if (collections[c].collectionID == collectionID && (processedCollections.indexOf(collectionID) == -1))
        {
            var table = collections[c];
            processedCollections.push(collectionID);




            for (var j in table.joins) {
                var join = table.joins[j];

                if (join.sourceCollectionID == table.collectionID && (processedCollections.indexOf(join.targetCollectionID) == -1))
                {
                    if (join.joinType == 'default')
                        fromSQL = fromSQL + ' INNER JOIN ';
                    if (join.joinType == 'left')
                        fromSQL = fromSQL + ' LEFT JOIN ';
                    if (join.joinType == 'right')
                        fromSQL = fromSQL + ' RIGHT JOIN ';



                    fromSQL = fromSQL + join.targetCollectionName + ' '+ join.targetCollectionID;

                    fromSQL = fromSQL + ' ON ('+join.sourceCollectionID+'.'+join.sourceElementName+' = '+join.targetCollectionID+'.'+join.targetElementName+')';
                    fromSQL = fromSQL + getJoins(join.targetCollectionID,collections,processedCollections);

                }

                if (join.targetCollectionID == table.collectionID && (processedCollections.indexOf(join.sourceCollectionID) == -1))
                {
                    if (join.joinType == 'default')
                        fromSQL = fromSQL + ' INNER JOIN ';
                    if (join.joinType == 'left')
                        fromSQL = fromSQL + ' LEFT JOIN ';
                    if (join.joinType == 'right')
                        fromSQL = fromSQL + ' RIGHT JOIN ';


                    fromSQL = fromSQL + join.sourceCollectionName + ' '+ join.sourceCollectionID;

                    fromSQL = fromSQL + ' ON ('+join.targetCollectionID+'.'+join.targetElementName+' = '+join.sourceCollectionID+'.'+join.sourceElementName+')';

                    fromSQL = fromSQL + getJoins(join.sourceCollectionID,collections,processedCollections);
                }

            }




        }

    }

    return fromSQL;

}

function getOrderBys(collection)
{
    var sort = {};

    if (collection.order) {
        for (var i in collection.order) {
            for (var e in collection.schema.elements) {
                if (collection.order[i] != undefined)
                {
                    if (collection.order[i].elementID == collection.schema.elements[e].elementID) {
                        var found = false;

                        for (var c in collection.columns) {
                            if (collection.columns[c].elementID == collection.schema.elements[e].elementID) {

                                if (collection.columns[c].aggregation) {
                                    found = true;
                                    switch (collection.columns[c].aggregation) {
                                        case 'sum': sort[collection.schema.elements[e].elementName+'sum'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'avg': sort[collection.schema.elements[e].elementName+'avg'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'min': sort[collection.schema.elements[e].elementName+'min'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'max': sort[collection.schema.elements[e].elementName+'max'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'year': sort['_id.'+collection.schema.elements[e].elementName+'year'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'month': sort['_id.'+collection.schema.elements[e].elementName+'month'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'day': sort['_id.'+collection.schema.elements[e].elementName+'day'] = collection.order[i].sortType*-1;
                                    }
                                }

                                break;
                            }
                        }
                        if (!found) {
                            if (collection.order[i].sortType)
                                sort['_id.'+collection.schema.elements[e].elementName] = collection.order[i].sortType*-1;
                            else
                                sort['_id.'+collection.schema.elements[e].elementName] = 1;
                        }
                    }
                }
            }
        }
    }
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    while (s.length < size) s = "0" + s;
    return s;
}

function dateFilter(filterElementName,filterValue, filter)
{
    //NOTE:This is not valid for date-time values... the equal always take the whole day without taking care about the time


    var today = new Date();
    var year = today.getFullYear();
    var month = pad(today.getMonth()+1,2);
    var day = pad(today.getDate(),2);


    var found = false;


    if (filterValue == '#WST-TODAY#')
    {
        var firstDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate()+1);
        var year1 = tomorrow.getFullYear();
        var month1 = pad(tomorrow.getMonth()+1,2);
        var day1 = pad(tomorrow.getDate(),2);

        var lastDate = new Date(year1+'-'+month1+'-'+day1+'T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-YESTERDAY#')
    {
        var lastDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        var yesterday = new Date(today);
        yesterday.setDate(today.getDate()-1);
        var year1 = yesterday.getFullYear();
        var month1 = pad(yesterday.getMonth()+1,2);
        var day1 = pad(yesterday.getDate(),2);

        var firstDate = new Date(year1+'-'+month1+'-'+day1+'T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-THISWEEK#')
    {   //TODO: first day monday instead sunday
        var curr = new Date; // get current date
        curr.setHours(0, 0, 0, 0);
        var first = curr.getDate() - (curr.getDay()-1); // First day is the day of the month - the day of the week
        var last = first + 7; // last day is the first day + 6 one more day 7 because is a less than

        var firstDate = new Date(curr.setDate(first));
        var lastDate = new Date(curr.setDate(last));
        found = true;

    }

    if (filterValue == '#WST-LASTWEEK#')
    {   //TODO: first day monday instead sunday
        var curr = new Date; // get current date
        curr.setHours(0, 0, 0, 0);
        var lwday = new Date(curr);
        lwday.setDate(curr.getDate()-7);

        var first = lwday.getDate() - (lwday.getDay()-1); // First day is the day of the month - the day of the week
        var last = first + 7; // last day is the first day + 6 one more day 7 because is a less than

        var firstDate = new Date(curr.setDate(first));
        var lastDate = new Date(curr.setDate(last));
        found = true;

    }

    if (filterValue == '#WST-THISMONTH#')
    {

        var firstDate = new Date(year+'-'+month+'-01T00:00:00.000Z');

        if (month == 12)
            var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        else
        {
            var month1 = pad(today.getMonth()+2,2);
            var lastDate = new Date(year+'-'+month1+'-01T00:00:00.000Z');
        }
        found = true;

    }

    if (filterValue == '#WST-LASTMONTH#')
    {

        if (month == 1)
            var firstDate = new Date((year-1)+'-12-01T00:00:00.000Z');
        else {
            var month1 = pad(today.getMonth(),2);
            var firstDate = new Date(year+'-'+month1+'-01T00:00:00.000Z');
        }

        var lastDate = new Date(year+'-'+month+'-01T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-THISYEAR#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-LASTYEAR#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year)+'-01-01T00:00:00.000Z');
        found = true;

    }
    if (filterValue == '#WST-FIRSTQUARTER#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date(year+'-04-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-SECONDQUARTER#')
    {
        var firstDate = new Date(year+'-04-01T00:00:00.000Z');
        var lastDate = new Date(year+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-THIRDQUARTER#')
    {
        var firstDate = new Date(year+'-07-01T00:00:00.000Z');
        var lastDate = new Date(year+'-10-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-FOURTHQUARTER#')
    {
        var firstDate = new Date(year+'-10-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-FIRSTSEMESTER#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date(year+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-SECONDSEMESTER#')
    {
        var firstDate = new Date(year+'-07-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFIRSTQUARTER#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-04-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYSECONDQUARTER#')
    {
        var firstDate = new Date((year-1)+'-04-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYTHIRDQUARTER#')
    {
        var firstDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-10-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFOURTHQUARTER#')
    {
        var firstDate = new Date((year-1)+'-10-01T00:00:00.000Z');
        var lastDate = new Date(year+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFIRSTSEMESTER#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }

    if (filterValue == '#WST-LYSECONDSEMESTER#')
    {
        var firstDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        var lastDate = new Date(year+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }

    if (found == true)
    {

        var fyear = firstDate.getFullYear();
        var fmonth = pad(firstDate.getMonth()+1,2);
        var fday = pad(firstDate.getDate(),2);
        var lyear = lastDate.getFullYear();
        var lmonth = pad(lastDate.getMonth()+1,2);
        var lday = pad(lastDate.getDate(),2);

        var queryFirstDate =  fyear+'/'+fmonth+'/'+fday;
        var queryLastDate =  lyear+'/'+lmonth+'/'+lday;

        if (filter.filterType == "equal-pattern")
            return "("+ filterElementName + " >= '"+ queryFirstDate+"' AND "+filterElementName + " < '"+ queryLastDate+"')";

        if (filter.filterType == "diferentThan-pattern")
            return "("+ filterElementName + " < '"+ queryFirstDate+"' OR "+filterElementName + " >= '"+ queryLastDate+"')";

        if (filter.filterType == "biggerThan-pattern")
            return "("+ filterElementName + " > '"+ queryLastDate+"')";

        if (filter.filterType == "biggerOrEqualThan-pattern" )
            return "("+ filterElementName + " >= '"+ queryFirstDate+"')";

        if (filter.filterType == "lessThan-pattern" )
            return "("+ filterElementName + " < '"+ queryFirstDate+"')";

        if (filter.filterType == "lessOrEqualThan-pattern" )
            return "("+ filterElementName + " <= '"+ queryLastDate+"')";

    } else {

        var searchDate = new Date(filterValue);
        var theNextDay = new Date(searchDate);
        theNextDay.setDate(searchDate.getDate()+1);
        var qyear = searchDate.getFullYear();
        var qmonth = pad(searchDate.getMonth()+1,2);
        var qday = pad(searchDate.getDate(),2);

        var qyear2 = theNextDay.getFullYear();
        var qmonth2 = pad(theNextDay.getMonth()+1,2);
        var qday2 = pad(theNextDay.getDate(),2);

        if (filter.filterText2)
        {
            var lastDate = new Date(filter.filterText2);
            var qlyear = lastDate.getFullYear();
            var qlmonth = pad(lastDate.getMonth()+1,2);
            var qlday = pad(lastDate.getDate(),2);
            var queryLastDate = qlyear+'/'+qlmonth+'/'+qlday;
        }

        var querySearchDate = qyear+'/'+qmonth+'/'+qday;

        var querySearchDate2 = qyear2+'/'+qmonth2+'/'+qday2;


        if (filter.filterType == "equal" )
        {
            //return filterElementName + " = '"+ querySearchDate+"'";
            return "("+ filterElementName + " >= '"+ querySearchDate+"' AND "+filterElementName + " < '"+ querySearchDate2+"')";
        }

        if (filter.filterType == "diferentThan" && found == false)
        {
            //return filterElementName + " <> '"+ querySearchDate+"'";
            return "("+ filterElementName + " < '"+ querySearchDate+"' OR "+filterElementName + " >= '"+ querySearchDate2+"')";
        }

        if (filter.filterType == "biggerThan" )
        {
            return filterElementName + " > '"+ querySearchDate+"'";

        }

        if (filter.filterType == "notGreaterThan" )
        {
            return filterElementName + " <= '"+ querySearchDate+"'";

        }

        if (filter.filterType == "biggerOrEqualThan" )
        {
            return filterElementName + " >= '"+ querySearchDate+"'";

        }

        if (filter.filterType == "lessThan" )
        {
            return filterElementName + " < '"+ querySearchDate+"'";

        }

        if (filter.filterType == "lessOrEqualThan" )
        {
            return filterElementName + " <= '"+ querySearchDate+"'";

        }

        if (filter.filterType == "between" )
        {
            return filterElementName + " > '"+ querySearchDate+"' AND "+filterElementName + " <= '"+queryLastDate+"'";
        }

        if (filter.filterType == "notBetween" )
        {
            return filterElementName + " < '"+ querySearchDate+"' OR "+filterElementName + " > '"+queryLastDate+"'";

        }

        if (filter.filterType == "in" || filter.filterType == "notIn")
        {
            var theFilter = filterElementName ;
            if (filter.filterType == "in")
                theFilter = theFilter +  ' IN (';
            if (filter.filterType == "notIn")
                theFilter = theFilter +  ' NOT IN (';


            var dates = String(filterValue).split(',');
            for (var d in dates)
            {
                var theDate = new Date(dates[d]);
                var Inyear = theDate.getFullYear();
                var Inmonth = pad(theDate.getMonth()+1,2);
                var Inday = pad(theDate.getDate(),2);
                var InquerySearchDate = Inyear+'/'+Inmonth+'/'+Inday;

                theFilter = theFilter + "'" + InquerySearchDate  + "'";
                if (d < dates.length -1 )
                    theFilter = theFilter + ', ';
            }

            return theFilter + ")";

        }

    }



}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}


