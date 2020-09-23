

var pg = require('pg');
var sql = require('../../sqlv2.js');

var db = function () {
    this.conn = null;
    this.datasourceID = undefined;
};



db.prototype.connect = function(data,datasourceID, done) {
    connect(data,datasourceID,done);
};

exports.connect = function(data,datasourceID, done) {
    connect(data,datasourceID,done);
};


function connect(data,datasourceID, done)
{
    var DB = this;
    var maxConnections = 30;
 
    var config = {
        user: data.userName,
        host: data.host,
        database: data.database,
        password: data.password,
        port: data.port,
        max: maxConnections,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    }
    
        
    if (data.enableSSL)
    {
        var fs = require('fs');
        var sslParams = {};
        sslParams.rejectUnauthorized = false;
        
            if (data.sslRootCertificate && fs.existsSync(global.serverDir+'/uploads/'+datasourceID+'/'+data.sslRootCertificate))
                {
                sslParams.ca = fs.readFileSync(global.serverDir+'/uploads/'+datasourceID+'/'+data.sslRootCertificate).toString()
                } else {
                    done({result: 0, msg: 'CA file not found'});
                    return console.error('CA file not found '+global.serverDir+'/uploads/'+datasourceID+'/'+data.sslRootCertificate);
                }

        config = {
            host: data.host,
            database: data.database,
            user: data.userName,
            password: data.password,
            port: data.port,
            ssl: sslParams,
            max: maxConnections,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        }
    }  

 if (!global.pgPool)
 {
     global.pgPool = {};
     
        const { Pool } = require('pg')
        var pool = new Pool(config);

        global.pgPool['WST_'+datasourceID] = pool;
      
 } else {
    if (!global.pgPool['WST_'+datasourceID])
    {
        const { Pool } = require('pg')
        var pool = new Pool(config);

        global.pgPool['WST_'+datasourceID] = pool;
    } else {
        var pool = global.pgPool['WST_'+datasourceID];
    }
 }

 pool.connect((err, client, release) => {
   if (err) {
        done(err);
        saveToLog(undefined, 'POSTGRES connection error '+ err.message,'','ERROR','POSTGRES', 102); 
        return console.error('Connection Error: '+err);
   }
        DB.conn = client;
        DB.datasourceID = datasourceID;
        DB.datasourceName = data.name;
        done(false, DB.conn);
 })
 
}

db.prototype.end = function() {
    end();
};

db.prototype.getDatasourceName = function()
{
    return datasourceName;
}

exports.end = function() {
    end();
};

function end()
{
    try {

       this.conn.release();// generate this error -> Error ending POSTGRES connection Release called on client which has already been released to the pool.
    } catch (e) {
        saveToLog(undefined, 'Error ending POSTGRES connection '+ e.message,'','ERROR','POSTGRES', 102);    
    } finally {

    }
}

db.prototype.internalQuery = function(query, done) {
    runInternalQuery(query, done);
};

function runInternalQuery(query, done)
{
    this.conn.query(query, function(err, result) {
        if (err) {
            done('Query Error: '+err);
            saveToLog(undefined, 'POSTGRES error running internal query '+ err.message,'','ERROR','POSTGRES', 102);
            return console.error('Query Error: '+err);
        }
        end();
        done(false, {rows: result.rows});
    });
}

db.prototype.query = function(query, req, queryMetaData, done) {
    runQuery(query,req, queryMetaData, done);
};

exports.runQuery = function(query, req, queryMetaData, done) {
    runQuery(query,req, queryMetaData, done);
};

db.prototype.getTop100 = function(table_name, req, done) {
    var theTop100Query = 'SELECT * FROM '+table_name+ ' LIMIT 100 OFFSET 0';
    runQuery(theTop100Query,req, undefined, done);
};

function runQuery(query,req, queryMetaData,done)
{
    var startTime = new Date();
    this.conn.query(query, function(err, result) {
        var endTime = new Date();
        var executionTime = Math.abs(endTime - startTime)
        var status = 'success';
        var errorMessage = undefined;
        if (err) {
            errorMessage = err;
            status = 'error';
            if (req && global.PROqueries) {
                global.PROqueries.saveQuery(req,query, result, status, errorMessage, queryMetaData,executionTime,'POSTGRE');
            }
            done('Query Error: '+err);
            end();
            return
            //return console.error('Query Error: '+err);

        } else {
            if (req && global.PROqueries) {
                global.PROqueries.saveQuery(req,query, result, status, errorMessage, queryMetaData,executionTime,'POSTGRE');

            }
           
            done(false, {rows: result.rows});
            end();
            
          
            
        }
        
    });
}


db.prototype.getDatabaseSchemas = function() {
    return "SELECT distinct table_schema FROM information_schema.columns where table_schema not in ('pg_catalog','information_schema') order by table_schema"
};

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT table_schema, table_name, column_name, data_type, is_nullable, cols.character_maximum_length as length, cols.numeric_precision as precission, cols.numeric_scale as scale FROM information_schema.columns cols WHERE table_schema in ("+newSchemas+") AND table_name in ("+newTables+") order by table_name";
};

db.prototype.getTables = function() {
    return "SELECT table_name, table_schema FROM information_schema.tables where table_schema not in ('pg_catalog','information_schema') and table_type='BASE TABLE' order by table_name";
}

db.prototype.getViews = function() {
    return "SELECT table_name, table_schema FROM information_schema.views where table_schema not in ('pg_catalog','information_schema') and table_type='BASE TABLE' order by table_name";
}

db.prototype.getTablesAndViews = function() {
   var sql =
    "SELECT table_schema || '.' || table_name as name ,table_name, table_schema, 'table' as type FROM information_schema.tables where table_schema not in ('pg_catalog','information_schema') and table_type='BASE TABLE'"
    +" union all "
    +"SELECT table_schema || '.' || table_name as name ,table_name, table_schema, 'view' as type FROM information_schema.views where table_schema not in ('pg_catalog','information_schema') order by table_name"
    return sql;
}

db.prototype.getTablesAndViewsForSchema = function(schemaName) {
    var sql =
        "SELECT table_schema || '.' || table_name as name ,table_name, table_schema, 'table' as type FROM information_schema.tables where table_schema not in ('pg_catalog','information_schema') and table_type='BASE TABLE' and table_schema ='"+schemaName+"'"
        +" union all "
        +"SELECT table_schema || '.' || table_name as name ,table_name, table_schema, 'view' as type FROM information_schema.views where table_schema not in ('pg_catalog','information_schema') and table_schema ='"+schemaName+"' order by table_name"
    return sql;
}

db.prototype.getColumns = function ()
{
    return "SELECT table_schema, table_name, column_name, data_type,is_nullable, cols.character_maximum_length as length, cols.numeric_precision as precission, cols.numeric_scale as scale FROM information_schema.columns cols where table_schema not in ('pg_catalog','information_schema') order by table_name, ordinal_position";
}

db.prototype.getTableJoins = function()
{
    return "SELECT tc.constraint_name, tc.table_schema, tc.table_name, kcu.column_name, ccu.table_schema as foreign_table_schema, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM  information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'FOREIGN KEY'";
}

db.prototype.getPKs = function()
{
    return "select tc.table_schema, tc.table_name, kc.column_name, kc.position_in_unique_constraint from   information_schema.table_constraints tc,  information_schema.key_column_usage kc  where  tc.constraint_type = 'PRIMARY KEY'  and kc.table_name = tc.table_name and kc.table_schema = tc.table_schema and kc.constraint_name = tc.constraint_name order by 1, 2";
}

db.prototype.getEntityFieldsSQL = function(tableSchema,tableName)
{
    return getEntityFieldsSQL(tableSchema,tableName);
}

db.prototype.getEntityPKsSQL = function(tableSchema,tableName) {
    return getEntityPKsSQL(tableSchema, tableName);
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
    if (limit == -1)
        return sql
    else
        return sql + ' LIMIT '+limit+' OFFSET '+offset;
}

exports.db = db;

exports.testConnection = function(req,data, setresult) {

    var config = {
        user: data.userName,
        host: data.host,
        database: data.database,
        password: data.password,
        port: data.port
    }
    
       
    if (data.enableSSL)
    {
        var fs = require('fs');
        var sslParams = {};
        sslParams.rejectUnauthorized = false;
        
            if (data.sslRootCertificate && fs.existsSync(global.serverDir+'/uploads/'+data.datasourceID+'/'+data.sslRootCertificate))
                {
                sslParams.ca = fs.readFileSync(global.serverDir+'/uploads/'+data.datasourceID+'/'+data.sslRootCertificate).toString()
                } else {
                    setresult({result: 0, msg: 'CA file not found'});
                    return console.error('CA file not found');
                }

        config = {
            host: data.host,
            database: data.database,
            user: data.userName,
            password: data.password,
            port: data.port,
            ssl: sslParams
        }
    }  

  var client = new pg.Client(config);
    client.connect(function(err) {
        if (err) {
            setresult({result: 0, msg: 'Connection Error: '+ err});
            return console.error('Connection Error: '+err);
        }

        client.query("SELECT table_schema || '.' || table_name as name , table_schema, table_name from information_schema.tables where table_schema not in ('pg_catalog','information_schema')", function(err, result) {
            setresult({result: 1, items: result.rows});
            client.end();
            //client.release();
        });
    });

};

exports.getDateFormat = function(column,format)
{
  return 'to_char('+column+ ",'"+format+"')";
}

function getEntityFieldsSQL(tableSchema,tableName)
{
    return "SELECT table_schema, table_name, column_name, data_type,is_nullable, cols.character_maximum_length as length, cols.numeric_precision as precission, cols.numeric_scale as scale FROM information_schema.columns cols where table_schema = '"+tableSchema+"' and table_name = '"+tableName+"' order by table_name, ordinal_position";
}

function getEntityPKsSQL(tableSchema,tableName)
{
    return "select tc.table_schema, tc.table_name, kc.column_name, kc.position_in_unique_constraint from   information_schema.table_constraints tc,  information_schema.key_column_usage kc  where  tc.constraint_type = 'PRIMARY KEY'  and kc.table_name = tc.table_name and kc.table_schema = tc.table_schema and kc.constraint_name = tc.constraint_name and tc.table_schema = '"+tableSchema+"' and tc.table_name = '"+tableName+"'  order by 1, 2";
}

db.prototype.getDataTypes = function(done)
{
  var dataTypes = [
                    {dataType:'bigint',size:false,precision:false,description:'signed eight-byte integer',type:'NUMBER'},
                    {dataType:'bigserial',size:false,precision:false,description:'autoincrementing eight-byte integer',type:'NUMBER'},
                    {dataType:'bit',size:true,precision:false,description:'fixed-length bit string',type:'STRING'},
                    {dataType:'varbit',size:true,precision:false,description:'variable-length bit string',type:'STRING'},
                    {dataType:'boolean',size:false,precision:false,description:'logical Boolean (true/false)',type:'BOOLEAN'},
                    {dataType:'box',size:false,precision:false,description:'rectangular box on a plane',type:'OBJECT'},
                    {dataType:'bytea',size:false,precision:false,description:'binary data ("byte array")',type:'OBJECT'},
                    {dataType:'char',size:true,precision:false,description:'fixed-length character string',type:'STRING'},
                    {dataType:'varchar',size:true,precision:false,description:'variable-length character string',type:'STRING'},
                    {dataType:'cidr',size:false,precision:false,description:'IPv4 or IPv6 network address',type:'STRING'},
                    {dataType:'circle',size:false,precision:false,description:'circle on a plane',type:'OBJECT'},
                    {dataType:'date',size:false,precision:false,description:'calendar date (year, month, day)',type:'DATE'},
                    {dataType:'float8',size:false,precision:false,description:'double precision floating-point number (8 bytes)',type:'NUMBER'},
                    {dataType:'inet',size:false,precision:false,description:'IPv4 or IPv6 host address',type:'STRING'},
                    {dataType:'integer',size:false,precision:false,description:'int, int4	signed four-byte integer',type:'NUMBER'},
                    {dataType:'json',size:false,precision:false,description:'textual JSON data',type:'STRING'},
                    {dataType:'jsonb',size:false,precision:false,description:'binary JSON data, decomposed',type:'OBJECT'},
                    {dataType:'line',size:false,precision:false,description:'infinite line on a plane',type:'OBJECT'},
                    {dataType:'lseg',size:false,precision:false,description:'line segment on a plane',type:'OBJECT'},
                    {dataType:'macaddr',size:false,precision:false,description:'MAC (Media Access Control) address',type:'STRING'},
                    {dataType:'money',size:false,precision:false,description:'currency amount',type:'STRING'},
                    {dataType:'numeric',size:true,precision:true,description:'exact numeric of selectable precision',type:'NUMBER'},
                    {dataType:'path',size:false,precision:false,description:'geometric path on a plane',type:'OBJECT'},
                    {dataType:'pg_lsn',size:false,precision:false,description:'PostgreSQL Log Sequence Number',type:'NUMBER'},
                    {dataType:'point',size:false,precision:false,description:'geometric point on a plane',type:'OBJECT'},
                    {dataType:'polygon',size:false,precision:false,description:'closed geometric path on a plane',type:'OBJECT'},
                    {dataType:'real',size:false,precision:false,description:'float4	single precision floating-point number (4 bytes)',type:'NUMBER'},
                    {dataType:'smallint',size:false,precision:false,description:'int2	signed two-byte integer',type:'NUMBER'},
                    {dataType:'smallserial',size:false,precision:false,description:'serial2	autoincrementing two-byte integer',type:'NUMBER'},
                    {dataType:'serial',size:false,precision:false,description:'serial4	autoincrementing four-byte integer',type:'NUMBER'},
                    {dataType:'text',size:false,precision:false,description:'variable-length character string',type:'STRING'},
                    {dataType:'time',size:false,precision:false,description:'[ (p) ] [ without time zone ]	 	time of day (no time zone)',type:'DATE'},
                    {dataType:'timetz',size:false,precision:false,description:'[ (p) ] with time zone	timetz	time of day, including time zone',type:'DATE'},
                    {dataType:'timestamp',size:false,precision:false,description:'[ (p) ] [ without time zone ]	 	date and time (no time zone)',type:'DATE'},
                    {dataType:'timestamptz',size:false,precision:false,description:'[ (p) ] with time zone	timestamptz	date and time, including time zone',type:'DATE'},
                    {dataType:'tsquery',size:false,precision:false,description:'text search query',type:'STRING'},
                    {dataType:'tsvector',size:false,precision:false,description:'text search document',type:'STRING'},
                    {dataType:'txid_snapshot',size:false,precision:false,description:'user-level transaction ID snapshot',type:'OBJECT'},
                    {dataType:'uuid',size:false,precision:false,description:'universally unique identifier',type:'STRING'},
                    {dataType:'xml',size:false,precision:false,description:'XML data',type:'STRING'}
                ]

done(dataTypes);

}
