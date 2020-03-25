var mysql = require('mysql');
var Connections = connection.model('Connections');
var sql = require('../../sqlv2.js');

var db = function () {
    /*this.host = data.host;
    this.user = data.userName;
    this.password = data.password;
    this.database = data.database;*/
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

    var conn = mysql.createConnection({
        host     : data.host,
        port     : data.port,
        user     : data.userName,
        password : data.password,
        database : data.database
    });

    //var connectionString = 'mysql://'+data.userName+':'+data.password+'@'+data.host+':'+data.port+'/'+data.database;
    //var conn = mysql.createConnection(connectionString);

    conn.connect(function(err) {
        if (err) {
            done(err.stack);
            return console.error('Connection Error: '+err.stack);
        }

        DB.conn = conn;
        DB.datasourceID = datasourceID;

        done(false, DB.conn);
    });
};


db.prototype.end = function() {
    end();
};

exports.end = function() {
    end();
};

function end()
{
    this.conn.end();
}

db.prototype.internalQuery = function(query, done) {
    runInternalQuery(query, done);
};

function runInternalQuery(query, done)
{
    this.conn.query(query, function(err, result) {
        if (err) {
            done('Query Error: '+err);
            return console.error('Query Error: '+err);
        }
        done(false, {rows: result});
    });
}

db.prototype.query = function(query, req, queryMetaData, done) {
    runQuery(query,req, queryMetaData, done);
};

exports.runQuery = function(query, req, queryMetaData, done) {
    runQuery(query,req, queryMetaData, done);
};

db.prototype.getTop100 = function(table_name, req, done) {
    var theTop100Query = 'SELECT * FROM '+table_name+  ' LIMIT 0, 100';
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

                global.PROqueries.saveQuery(req,query, result, status, errorMessage, queryMetaData,executionTime,'MySQL');

            }
            done('Query Error: '+err);
            return

        } else {
            if (req && global.PROqueries) {
                global.PROqueries.saveQuery(req,query, result, status, errorMessage, queryMetaData,executionTime,'MySQL');

            }
            done(false, {rows: result});
        }
    });
}

db.prototype.getDatabaseSchemas = function() {
    return "SELECT distinct table_schema FROM information_schema.TABLES where table_schema not in ('information_schema','performance_schema','sys','mysql') order by table_schema";
};

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT table_schema, table_name, column_name, data_type FROM information_schema.columns WHERE table_schema in ("+newSchemas+") AND table_name in ("+newTables+") order by table_name";
};


db.prototype.getTables = function() {
    return "SELECT table_name, table_schema FROM information_schema.tables where table_schema not in ('information_schema','performance_schema','sys','mysql') and table_type='BASE TABLE' order by table_name";
}

db.prototype.getViews = function() {
    return "SELECT table_name, table_schema FROM information_schema.views where table_schema not in ('information_schema','performance_schema','sys','mysql') order by table_name";
}


db.prototype.getTablesAndViews = function() {
    var sql =
        "SELECT table_schema || '.' || table_name as name ,table_name, table_schema, 'table' as type FROM information_schema.tables where table_schema not in ('information_schema','performance_schema','sys','mysql') and table_type='BASE TABLE'"
    +" union all "
    +" SELECT table_schema || '.' || table_name as name ,table_name, table_schema, 'view' as type FROM information_schema.views where table_schema not in ('information_schema','performance_schema','sys','mysql') order by table_name";


    return sql;
}

db.prototype.getTablesAndViewsForSchema = function(schemaName) {
    var sql =
        "SELECT table_schema || '.' || table_name as name ,table_name, table_schema, 'table' as type FROM information_schema.tables where table_schema not in ('information_schema','performance_schema','sys','mysql') and table_type='BASE TABLE' and table_schema ='"+schemaName+"'"
        +" union all "
        +"SELECT table_schema || '.' || table_name as name ,table_name, table_schema, 'view' as type FROM information_schema.views where table_schema not in ('information_schema','performance_schema','sys','mysql') and table_schema ='"+schemaName+"' order by table_name"
    return sql;
}

db.prototype.getColumns = function ()
{
    return "SELECT table_schema, table_name, column_name, data_type,is_nullable, cols.character_maximum_length as length, cols.numeric_precision as precission, cols.numeric_scale as scale FROM information_schema.columns cols where table_schema not in ('information_schema','performance_schema','sys','mysql') order by table_name, ordinal_position";
}

db.prototype.getTableJoins = function()
{
    return "SELECT tc.constraint_name, tc.table_schema, tc.table_name, kcu.column_name, kcu.referenced_table_schema as foreign_table_schema, kcu.referenced_table_name AS foreign_table_name, kcu.referenced_column_name AS foreign_column_name "
    +" FROM  information_schema.table_constraints AS tc"
        +" JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name"
        +" WHERE constraint_type = 'FOREIGN KEY'";
}

db.prototype.getPKs = function()
{
    return "select tc.table_schema, tc.table_name, kc.column_name, kc.position_in_unique_constraint from   information_schema.table_constraints tc,  information_schema.key_column_usage kc  where  tc.constraint_type = 'PRIMARY KEY'  and kc.table_name = tc.table_name and kc.table_schema = tc.table_schema and kc.constraint_name = tc.constraint_name order by 1, 2";
}

db.prototype.getEntityFieldsSQL = function(tableSchema,tableName)
{
    return getEntityFieldsSQL(tableSchema,tableName);
}

function getEntityFieldsSQL(tableSchema,tableName)
{
    return "SELECT table_schema, table_name, column_name, data_type,is_nullable, cols.character_maximum_length as length, cols.numeric_precision as precission, cols.numeric_scale as scale FROM information_schema.columns cols where table_schema = '"+tableSchema+"' and table_name = '"+tableName+"' order by table_name, ordinal_position";
}

db.prototype.getEntityPKsSQL = function(tableSchema,tableName) {
    return getEntityPKsSQL(tableSchema, tableName);
}

function getEntityPKsSQL(tableSchema,tableName)
{
    return "select tc.table_schema, tc.table_name, kc.column_name, kc.position_in_unique_constraint from   information_schema.table_constraints tc,  information_schema.key_column_usage kc  where  tc.constraint_type = 'PRIMARY KEY'  and kc.table_name = tc.table_name and kc.table_schema = tc.table_schema and kc.constraint_name = tc.constraint_name and tc.table_schema = '"+tableSchema+"' and tc.table_name = '"+tableName+"'  order by 1, 2";
}


db.prototype.getLimitString = function(limit, offset) {
    return ' LIMIT '+offset+', '+limit;
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
        return  sql + ' LIMIT '+offset+', '+limit;

}

exports.db = db;

exports.getDateFormat = function(column,format)
{
  var mySformat = '%Y/%m/%d';

  if (format == 'YYYY-MM-DD')
      mySformat = '%Y-%m-%d';
  if (format == 'YYYY/MM/DD')
      mySformat = '%Y/%m/%d';
  if (format == 'YYYY.MM.DD')
      mySformat = '%Y.%m.%d';
  if (format == 'DD-MM-YYYY')
      mySformat = '%d-%m-%Y';
  if (format == 'DD/MM/YYYY')
      mySformat = '%d/%m/%Y';
  if (format == 'DD.MM.YYYY')
      mySformat = '%d.%m.%Y';
  if (format == 'dd MON YYYY')
      mySformat = '%d %b %Y';
  if (format == 'MON dd YYYY')
      mySformat = '%b, %d %Y';
  if (format == 'MM/DD/YYYY')
      mySformat = '%m/%d/%Y';
  if (format == 'MM-DD-YYYY')
      mySformat = '%m-%d-%Y';

  return 'DATE_FORMAT('+column+ ",'"+mySformat+"')";
}

exports.testConnection = function(req,data, setresult) {
    var conn = mysql.createConnection({
        host     : data.host,
        port     : data.port,
        user     : data.userName,
        password : data.password,
        database : data.database
    });

        conn.connect(function(err) {
            if (err) {
                        setresult({result: 0, msg: 'Error testing connection: '+ err,code:'MY-001',actionCode:'INVALIDATEDTS'});
                        saveToLog(req,'Error testing connection: '+err, 200,'MY-001','',data.datasourceID);
                      /*  Connections.invalidateDatasource(req,data.datasourceID,'MY-001','INVALIDATEDTS','Error testing connection: '+ err,function(result){

                      });*/
            } else {

                if (data.database)
                    var tablesSQL = "select table_schema, table_name as name from information_schema.tables where table_schema = '"+data.database+"'";
                else
                    var tablesSQL = "select table_schema, table_name as name from information_schema.tables where table_schema not in ('information_schema','mysql','performance_schema')"

                conn.query(tablesSQL, function(err, rows, fields) {
                    if (err) {
                            setresult({result: 0, msg: 'Error executing test connection SQL : '+ err,code:'MY-002',actionCode:'MESSAGEWST'});
                            saveToLog(req,'Error executing test connection SQL : '+err, 400,'MY-002','',data.datasourceID);
                        } else {
                            setresult({result: 1, items: rows});
                            conn.end();
                        }
                });
            }
    });
};


