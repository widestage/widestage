


function processSchema(db,datasourceID,model,schemas,index,done)
{
    if (!schemas[index])
    {
        done();
        return;
    } else {
        var schema = {
            schemaID: generateShortUID(),
            schema_name: schemas[index].table_schema,
            datasourceID: datasourceID,
            entities: [],
            joins: []
        };

        model.schemas.push(schema);



            var query = db.getTablesAndViews();
            db.internalQuery(query,  function (err, tables) {
                processTable(db, datasourceID, schema, tables.rows, 0,0, function () {
                    generateJoins(db,schema, function(){
                        processSchema(db, datasourceID, model, schemas, index + 1, done);
                    });

                })
            });

    }
}


function processTable(db,datasourceID,schema,tables,index,rowIndex,done)
{
    if (!tables[index])
    {
        done();
        return;
    } else {
        if (schema.schema_name == tables[index].table_schema) {
            var entity = {};
            entity.entityType = tables[index].type;
            entity.connectionID = datasourceID;
            entity.entityID = generateShortUID();
            entity.schema_name = tables[index].table_schema;
            entity.table_name = tables[index].table_name;
            var row = Math.floor(index /5);
            if (rowIndex > 5)
                rowIndex = 0;
            entity.left = (250 * rowIndex) + 100;
            entity.top = (row * 500) + 100;

            getEntityFields(db, entity.schema_name, entity.table_name, function(fields){
                if (fields.result == 1)
                    entity.attributes = fields.items;
                schema.entities.push(entity);
                processTable(db,datasourceID,schema,tables,index+1,rowIndex+1,done);
            });

        } else {
            processTable(db,datasourceID,schema,tables,index+1,rowIndex+1,done);
        }
    }
}

function generateJoins(db,schema,done)
{
    var joinsQuery = db.getTableJoins();
    db.internalQuery(joinsQuery,  function (err, joins) {

        var schemaJoins = joins.rows;

        for (var e in schema.entities)
        {
            for (var a in schema.entities[e].attributes)
            {
                for (var j in schemaJoins)
                {
                    if (schemaJoins[j].table_name == schema.entities[e].table_name && schemaJoins[j].table_schema == schema.entities[e].schema_name && (schemaJoins[j].column_name == schema.entities[e].attributes[a].column_name))
                    {
                        schemaJoins[j].targetObjectID = schema.entities[e].attributes[a].attributeID;
                        schemaJoins[j].targetParentID = schema.entities[e].entityID;
                    }
                    if (schemaJoins[j].foreign_table_name == schema.entities[e].table_name && schemaJoins[j].foreign_table_schema == schema.entities[e].schema_name && (schemaJoins[j].foreign_column_name == schema.entities[e].attributes[a].column_name))
                    {
                        schemaJoins[j].sourceObjectID = schema.entities[e].attributes[a].attributeID;
                        schemaJoins[j].sourceParentID = schema.entities[e].entityID;
                    }

                    schemaJoins[j].joinColor = '#ccc';
                    schemaJoins[j].joinHeight = 2;
                    schemaJoins[j].joinType = 'IE';
                    schemaJoins[j].sourceCardinality = 'One';
                    schemaJoins[j].targetCardinality = 'ZeroOrMore';

                }
            }
        }

      schema.joins = schemaJoins;
      done(schemaJoins);

    });
}


exports.getReverseEngineering = function(datasourceID, data, setresult) {

    var dbController = require('./connect/'+data.type+'/'+data.type+'.js');

    var db = new dbController.db();

    db.connect(data,datasourceID, function(err, connection) {
        if (err) {
            setresult({result: 0, msg: 'Connection Error: ' + err});
            return;
        }

        var schemas = [];
        var model = {schemas: schemas};

        var scQuery = db.getDatabaseSchemas();
        db.internalQuery(scQuery,  function (err, result) {
           processSchema(db,datasourceID,model,result.rows,0,function(){
                setresult({result: 1, items: model});
                db.end();
            });

        });

    });

};


exports.getSchemas = function(datasourceID, data, setresult) {
    var dbController = require('./connect/'+data.type+'/'+data.type+'.js');

    var db = new dbController.db();


    db.connect(data,datasourceID, function(err, connection) {
        if(err) {
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return;
        }

        var query = db.getDatabaseSchemas();

        db.internalQuery(query, function(err, result) {
            if (err)
            {
                setresult({result: 0, msg: 'Error getting database schemas : '+err});
            } else {
                setresult({result: 1, items: result.rows});
            }
            db.end();
        });

    });
};


exports.getTablesAndViews = function(datasourceID, data, setresult) {
    var dbController = require('./connect/'+data.type+'/'+data.type+'.js');

    var db = new dbController.db();


    db.connect(data,datasourceID, function(err, connection) {
        if(err) {
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return;
        }

        var query = db.getTablesAndViews();

        db.internalQuery(query, function(err, result) {
            if (err)
            {
                setresult({result: 0, msg: 'Error getting database tables and views : '+err});
            } else {
                setresult({result: 1, items: result.rows});
            }
            db.end();
        });

    });
};

exports.getTablesAndViewsForSchema = function(datasourceID,schemaName, data, setresult) {
    var dbController = require('./connect/'+data.type+'/'+data.type+'.js');

    var db = new dbController.db();


    db.connect(data,datasourceID, function(err, connection) {
        if(err) {
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return;
        }

        var query = db.getTablesAndViewsForSchema(schemaName);

        db.internalQuery(query,  function(err, result) {
            if (err)
            {
                setresult({result: 0, msg: 'Error getting database tables and views : '+err});
            } else {
                setresult({result: 1, items: result.rows});
            }
            db.end();
        });

    });
};



function getEntityFields(db,tableSchema, tableName, done)
{
    var query = db.getEntityFieldsSQL(tableSchema, tableName);

    var fields = [];

    db.internalQuery(query, function(err, result) {
        if (err)
        {
            done( {result: 0, msg: 'Error getting entity fields : '+err});

        } else {

            fields = result.rows;
            //Now we need to identify PKs for this entity

            var queryPks = db.getEntityPKsSQL(tableSchema, tableName);
            db.internalQuery(queryPks,  function(err, result2) {
                if (err) {
                    done( {result: 0, msg: 'Error getting entity primary keys : ' + err});
                } else {
                    for (var f in fields)
                    {
                        fields[f].isPK = false;
                        fields[f].attributeID = generateShortUID();
                        fields[f].name = fields[f].column_name;

                        if (fields[f].is_nullable == 'YES')
                            fields[f].required = false;
                        else
                            fields[f].required = true;

                        fields[f].elementType = getAttributeType(fields[f].data_type);

                        for (var f0 in  result2.rows) {
                            if (result2.rows[f0].column_name == fields[f].column_name)
                            {
                                fields[f].isPK = true;
                            }
                        }
                    }
                    done( {result: 1, items: fields});
                }
            });
        }

    });
}

function getAttributeType(data_type)
{

    var type = 'STRING';

    if (data_type == 'NUMBER' ||
        data_type == 'number' ||
        data_type == 'decimal' ||
        data_type == 'DECIMAL' ||
        data_type == 'numeric' ||
        data_type == 'real' ||
        data_type == 'REAL' ||
        data_type == 'double precision' ||
        data_type == 'serial' ||
        data_type == 'bigserial' ||
        data_type == 'money')
        type = 'DECIMAL';

    if (data_type == 'INTEGER' ||
        data_type == 'smallint' ||
        data_type == 'SMALLINT' ||
        data_type == 'integer' ||
        data_type == 'int' ||
        data_type == 'BIGINT' ||
        data_type == 'bigint')
        type = 'INTEGER';

    if (data_type == 'FLOAT' ||
        data_type == 'float')
        type = 'FLOAT';

    if (data_type == 'DATE' ||
        data_type == 'timestamp without time zone' ||
        data_type == 'timestamp with time zone' ||
        data_type == 'date' ||
        data_type == 'TIME' ||
        data_type == 'time without time zone' ||
        data_type == 'time with time zone' ||
        data_type == 'abstime' ||
        data_type == 'interval' )
        type = 'DATE';


    if (data_type.indexOf("timestamp") > -1 || data_type.indexOf("TIMESTAMP") > -1)
        type = 'DATE';

    if (data_type == 'BOOLEAN' ||
        data_type == 'boolean')
        type = 'BOOLEAN';

    if (data_type == 'BINARY' ||
        data_type == 'bytea')
        type = 'BINARY';

    //TODO: ARRAY  -  OTHER  - OBJECT

    return type;
}

exports.getEntityFields = function(datasourceID,tableSchema, tableName, data, setresult) {
    var dbController = require('./connect/'+data.type+'/'+data.type+'.js');

    var db = new dbController.db();

    db.connect(data,datasourceID, function(err, connection) {
        if(err) {
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return;
        }


        getEntityFields(db,tableSchema, tableName, function(fields)
            {
                setresult(fields);
                db.end();
            });

    });




};



exports.getsqlQuerySchema = function(req,theSqlQuery,data,done)
{
    var dbms = require('./connect/'+data.type+'/'+data.type+'.js');

    //var db = new dbms.db();

    theSqlQuery = JSON.parse(theSqlQuery);

    dbms.connect(data,data.datasourceID, function(err, connection) {
        if(err) {
            done({result: 0, msg: 'Connection Error: '+ err});
            return;
        }

        dbms.runQuery(theSqlQuery.sqlQuery, req, undefined, function (err, result) {
            if (err) {
                done({result: 0, msg: err});
                return;
            }
            getSQLResultsSchema(theSqlQuery.name,result.rows,theSqlQuery.sqlQuery, data.datasourceID, function(newCollection){
                done({result: 1, schema: newCollection});
            })
        });
    });

}

function getSQLResultsSchema(collectionName,queryResults,sqlQuery, datasourceID, done) {

    var collectionID = generateShortUID();

    collectionID =  collectionID.replace(new RegExp('-', 'g'), '');
    var theCollection = {entityID: collectionID ,table_name: collectionName,visible:true,entityLabel:collectionName,isSQL:true};
    theCollection.attributes = [];
    theCollection.entityType = 'SQL';
    theCollection.sqlQuery = sqlQuery;
    theCollection.datasourceID = datasourceID;

    for (var key in queryResults[0])
    {
        var dbstruc = {};
        var elements = [];

        var name = key;
        var type = 'STRING';

        if (typeof(queryResults[0][key]) == 'number')
            if(isNaN(queryResults[0][key]) == false)
                type = 'NUMBER';


        //TODO: type = 'date'; json type = object , NaN = false

        if (typeof(queryResults[0][key]) == 'boolean')
            type = 'BOOLEAN';




        var elementID = generateShortUID();
        var isVisible = true;

        if (name != 'wst_rnum') //not for the row num for Oracle limit
            theCollection.attributes.push(
                {elementID:elementID,
                    elementName:name,
                    elementLabel:name,
                    elementType:type,
                    data_type:type,
                    visible:isVisible,
                    table_name: collectionName,
                    required: false,
                    isPK: false,
                    collectionID: collectionID,
                    collectionName: collectionName,
                    collectionType: 'SQL',
                    datasourceID: datasourceID,
                    elementLabel:name

                });


    }
    done(theCollection);
}








function generateShortUID() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
}
