var mssql = require('mssql');

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
    connect(data,datasourceID, done);
};

exports.connect = function(data,datasourceID, done) {
    connect(data,datasourceID,done);
};

function connect(data,datasourceID, done)
{
    var DB = this;

    //if (this.conn)
    //    this.conn.close();
        mssql.close();
    var conn = mssql.connect({
        user: data.userName,
        password: data.password,
        server: data.host,
        database: data.database,
        options: {
            encrypt: false //Use true only for Windows Azure
        }
    }, function(err) {
        if (err) {
            saveToLog(undefined, 'MSSQL connection error  '+ err.message,'','ERROR','MSSQL', 102);
            done(err.stack);
            return;
        }

        DB.conn = conn;
        DB.datasourceID = datasourceID;
        DB.datasourceName = data.name;

        done(false, DB.conn);
    });
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
    this.conn.close();
}

db.prototype.internalQuery = function(query, done) {
    runInternalQuery(query, done);
};



function runInternalQuery(query, done)
{
    var request = new mssql.Request(this.conn);

    request.query(query, function(err, result) {

        if (err) {
            saveToLog(undefined, 'error running MSSQL query '+query +' '+ err.message,'','ERROR','MSSQL', 102);
            done(err);
            return;
        }
        var records = [];
        if (result.recordset)
          records = result.recordset;

        done(false, {rows: records});
    });
}

db.prototype.query = function(query, req, queryMetaData, done) {
    runQuery(query,req, queryMetaData, done);
};

exports.runQuery = function(query, req, queryMetaData, done) {
    runQuery(query,req, queryMetaData, done);
};

db.prototype.getTop100 = function(table_name, req, done) {
    var theTop100Query = 'SELECT * FROM '+table_name+ ' order by 1 OFFSET 0 ROWS FETCH NEXT 100 ROWS ONLY';
    runQuery(theTop100Query,req, undefined, done);
};

function runQuery(query,req, queryMetaData,done)
{
    var startTime = new Date();

    var request = new mssql.Request(this.conn);
    request.query(query, function(err, result) {
      var records = [];
        if (result.recordset)
          records = result.recordset;

        var endTime = new Date();
        var executionTime = Math.abs(endTime - startTime)
        var status = 'success';
        var errorMessage = undefined;
        if (err) {
            errorMessage = err;
            status = 'error';
            if (req && global.PROqueries) {
                global.PROqueries.saveQuery(req,query, records, status, errorMessage, queryMetaData,executionTime,'MSSQL');

            }
            done('Query Error: '+err);
            return

        } else {
            if (req && global.PROqueries) {
                global.PROqueries.saveQuery(req,query, records, status, errorMessage, queryMetaData,executionTime,'MSSQL');

            }
            done(false, {rows: records});
        }
    });
}




db.prototype.getDatabaseSchemas = function() {
    return "SELECT distinct table_schema FROM information_schema.tables";
};

db.prototype.getSchemaQuery = function(newSchemas, newTables) {
    return "SELECT table_schema, table_name, column_name, data_type FROM information_schema.columns WHERE table_schema in ("+newSchemas+") AND table_name in ("+newTables+")";
};

db.prototype.getTables = function() {
    return "SELECT table_schema, table_name FROM information_schema.tables";
}

db.prototype.getViews = function() {
    return "SELECT table_schema,table_name FROM information_schema.views";
}


db.prototype.getTablesAndViews = function() {
    var sql =
        "SELECT CONCAT(CONCAT(table_schema,'.'),table_name) as name ,table_name, table_schema, 'table' as type FROM information_schema.tables where table_type='BASE TABLE'"
        +" union all "
        +"SELECT CONCAT(CONCAT(table_schema,'.'),table_name)  ,table_name, table_schema, 'view' as type FROM information_schema.views";
    return sql;
}

db.prototype.getTablesAndViewsForSchema = function(schemaName) {
    var sql =
        "SELECT CONCAT(CONCAT(table_schema,'.'),table_name) as name ,table_name, table_schema, 'table' as type FROM information_schema.tables where table_type='BASE TABLE' and table_schema = '"+schemaName+"'"
        +" union all "
        +"SELECT CONCAT(CONCAT(table_schema,'.'),table_name)  ,table_name, table_schema, 'view' as type FROM information_schema.views where table_schema = '"+schemaName+"'";
    return sql;
}

db.prototype.getColumns = function ()
{
    return "SELECT table_schema, table_name, column_name, data_type,is_nullable, cols.character_maximum_length as length, cols.numeric_precision as precission, cols.numeric_scale as scale FROM information_schema.columns cols order by table_name, ordinal_position";
}

db.prototype.getTableJoins = function()
{
    //return "SELECT tc.constraint_name, tc.table_schema, tc.table_name, kcu.column_name, ccu.table_schema as foreign_table_schema, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM  information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'FOREIGN KEY'";

    return "SELECT KCU1.CONSTRAINT_NAME AS constraint_name,KCU1.TABLE_SCHEMA AS table_schema,KCU1.TABLE_NAME AS table_name,KCU1.COLUMN_NAME AS column_name, " +
        "KCU2.CONSTRAINT_NAME AS referenced_constraint_name,KCU2.TABLE_SCHEMA AS foreign_table_schema,KCU2.TABLE_NAME AS foreign_table_name,KCU2.COLUMN_NAME AS foreign_column_name " +
        "FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS RC " +
        "INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU1 ON KCU1.CONSTRAINT_CATALOG = RC.CONSTRAINT_CATALOG " +
        "AND KCU1.CONSTRAINT_SCHEMA = RC.CONSTRAINT_SCHEMA " +
        "AND KCU1.CONSTRAINT_NAME = RC.CONSTRAINT_NAME " +
        "INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU2 ON KCU2.CONSTRAINT_CATALOG = RC.UNIQUE_CONSTRAINT_CATALOG " +
        "AND KCU2.CONSTRAINT_SCHEMA = RC.UNIQUE_CONSTRAINT_SCHEMA " +
        "AND KCU2.CONSTRAINT_NAME = RC.UNIQUE_CONSTRAINT_NAME " +
        "AND KCU2.ORDINAL_POSITION = KCU1.ORDINAL_POSITION";


}

db.prototype.getPKs = function()
{
    return "select tc.table_schema, tc.table_name, kc.column_name, 1 as position_in_unique_constraint from   information_schema.table_constraints tc,  information_schema.key_column_usage kc  where  tc.constraint_type = 'PRIMARY KEY'  and kc.table_name = tc.table_name and kc.table_schema = tc.table_schema and kc.constraint_name = tc.constraint_name order by 1, 2";
}

db.prototype.getEntityFieldsSQL = function(tableSchema,tableName)
{
    return getEntityFieldsSQL(tableSchema,tableName);
}

db.prototype.getEntityPKsSQL = function(tableSchema,tableName) {
    return getEntityPKsSQL(tableSchema, tableName);
}


db.prototype.getLimitString = function(limit, offset) {
    return " OFFSET "+offset+" ROWS FETCH NEXT "+limit+" ROWS ONLY";
};

db.prototype.setLimitToSQL = function(sql,limit,offset)
{
    return setLimitToSQL(sql,limit,offset)
}

exports.getDateFormat = function(column,format)
{
  var msSformat = 111;

  if (format == 'YYYY-MM-DD')
      msSformat = 23;
  if (format == 'YYYY/MM/DD')
      msSformat = 111;
  if (format == 'YYYY.MM.DD')
      msSformat = 102;
  if (format == 'DD-MM-YYYY')
      msSformat = 105;
  if (format == 'DD/MM/YYYY')
      msSformat = 103;
  if (format == 'DD.MM.YYYY')
      msSformat = 104;
  if (format == 'dd MON YYYY')
      msSformat = 106;
  if (format == 'MON dd YYYY')
      msSformat = 107;
  if (format == 'MM/DD/YYYY')
      msSformat = 101;
  if (format == 'MM-DD-YYYY')
      msSformat = 110;

  return 'convert(varchar, '+column+ ","+msSformat+")";
}

exports.setLimitToSQL = function(sql,limit,offset)
{
    return setLimitToSQL(sql,limit,offset);
}

function setLimitToSQL(sql,limit,offset) {
    var order_by_position = sql.indexOf(" ORDER BY ");
    var defaultOrderBy = '';

    if (order_by_position == -1)
    {
        //no order by, include the default order by
        defaultOrderBy = ' ORDER BY 1 ';
    }

    if (limit == -1)
        return sql
    else
        return sql +defaultOrderBy+ " OFFSET "+offset+" ROWS FETCH NEXT "+limit+" ROWS ONLY";
}

exports.db = db;

exports.testConnection = function(req,data, setresult) {
    var conn =  mssql.connect({
        user: data.userName,
        password: data.password,
        server: data.host,
        database: data.database,
        options: {
            encrypt: false //Use true only for Windows Azure
        }
    }, function(err) {
        if (err) {
            saveToLog(req, 'error trying to connect to MSSQL data source '+ err.message,'','ERROR','MSSQL', 102);
            setresult({result: 0, msg: 'Connection Error: '+err});
            return;
        }


        var request = new mssql.Request(conn);

        request.query("SELECT table_schema, TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'", function(err, recordset) {
            if (err) {
                saveToLog(req, 'error trying to connect to MSSQL data source '+ err.message,'','ERROR','MSSQL', 102);
                setresult({result: 0, msg: 'Connection Error: '+err});
                return;
                //throw err
            };

            setresult({result: 1, items: recordset});
            conn.close();
        });
    });
};


function getEntityFieldsSQL(tableSchema,tableName)
{
    return "SELECT table_schema, table_name, column_name, data_type,is_nullable, cols.character_maximum_length as length, cols.numeric_precision as precission, cols.numeric_scale as scale FROM information_schema.columns cols where table_schema = '"+tableSchema+"' and table_name = '"+tableName+"' order by table_name, ordinal_position";
}

function getEntityPKsSQL(tableSchema,tableName)
{
    return "select tc.table_schema, tc.table_name, kc.column_name, 1 as position_in_unique_constraint from   information_schema.table_constraints tc,  information_schema.key_column_usage kc  where  tc.constraint_type = 'PRIMARY KEY'  and kc.table_name = tc.table_name and kc.table_schema = tc.table_schema and kc.constraint_name = tc.constraint_name and tc.table_schema = '"+tableSchema+"' and tc.table_name = '"+tableName+"'  order by 1, 2";
}
