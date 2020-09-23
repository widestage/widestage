exports.GetConnectionTypes = function(req, res) {
    var fs = require('fs');
    var types = [];
        //Core modules
        var routes_dir = __dirname + '/db/connect';
        fs.readdirSync(routes_dir).forEach(function (file) {
            if(file[0] === '.') return;

            if (fs.existsSync(routes_dir+'/'+ file+'/'+file+'.js')) {
                var newType = {};
                newType.name = file;
                types.push(newType);
            }
        });

        serverResponse(req, res, 200, {result:1,items:types});
}

exports.testConnection = function(req,res) {
    testConnection(req,function(result){
      serverResponse(req, res, 200, result);
    });
};

exports.testConnection4Test = function(req,done) {
  testConnection(req,function(result){
    done(result);
  });
};

function testConnection(req, done)
{
  var dbController = require('./db/connect/'+req.query.type+'/'+req.query.type+'.js');
  dbController.testConnection(req,req.query, function(result) {
      done(result);
  });
}

exports.getData = function(req,res)
{
  //TODO: quotas uses the new method... global.PROquotas...but is not implemented yet... so always is going to say no quotas intalled
        if (global.modules.indexOf('quotas') > -1)
        {
            getDataWithQuotas(req,res);
        } else {
            GetData(req, function(result){
                serverResponse(req, res, 200, result);
            });

        }
}

exports.getDataAsAFile = function(req,res)
{

        //All data no pagination
        req.body.page = -1;
        var data = req.body;
        var query = data.query;
        var reportName = data.reportName;

        if (global.modules.indexOf('quotas') > -1)
        {
            getDataWithQuotas(req,res);
        } else {
            GetData(req, function(result){
                getExcelReportV1(req.user._id,reportName,query,result.data,true,function(filename)
                {
                          var fs = require('fs');
                              fs.readFile(filename, function(err, data) {
                                  if(err) throw err;
                                      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                                      res.setHeader("Content-Disposition", "attachment; filename=" + "report.xlsx");
                                      res.end(data, 'binary');
                              });
                }
              );
            });

        }
}

exports.getDataTypes = function(req,res)
{
  var dbController = require('./db/connect/'+req.params.driver+'/'+req.params.driver+'.js');
  dbController.getDataTypes(function(dataTypes) {
      serverResponse(req, res, 200, {result:1,items:dataTypes});
  });
}

exports.getData4Test = function(req,done)
{
  GetData(req, done);
}

function GetData(req, done) {
    var time1 = new Date().getTime();
    var queryProcessor = require('./query/queryProcessor.js');

    var data = req.body;
    var query = data.query;


    queryProcessor.processQuery(req,query,{page: (data.page) ? data.page : 1},function(result) {
        var time2 = new Date().getTime();
        result.time = time2-time1;
        done(result);
    });



}

exports.executeQuery = function(req,res)
{
    var theDatasourceID = req.params.connectionID;
    var theSqlQuery = req.body.sqlQuery;
    var source = req.body.source;
    var thePage = (req.body.page) ? req.body.page : 1;
    var layerID = req.body.layerID;

    executeQuery(req,theDatasourceID,theSqlQuery,source,layerID,thePage,function(result)
    {
        serverResponse(req, res, 200, result);
    });
}

function executeQuery(req,connectionID,sqlQuery,source,layerID,page,done)
{

  var theSqlQuery = sqlQuery;
  var thePage = page;



  var Connections = connection.model('Connections');
  Connections.findOne({ _id: connectionID,companyID:req.user.companyID,status:'Active'}, {}, function (err, dts) {
      if (dts) {
              var dbms = require('./db/connect/'+dts.type+'/'+dts.type+'.js');

              var newQuery = theSqlQuery;

              if (thePage > 0)
              {
                    if (dts.params.packetSize) {
                        if (dts.params.packetSize != -1)
                            newQuery = dbms.setLimitToSQL(theSqlQuery, dts.params.packetSize, ((thePage - 1 ) * dts.params.packetSize));
                    } else {
                        if (config.query.defaultRecordsPerPage > 1) {
                            newQuery = dbms.setLimitToSQL(theSqlQuery, config.query.defaultRecordsPerPage, ((thePage - 1 ) * config.query.defaultRecordsPerPage));
                        }
                    }
              }

              dbms.connect(dts.params.connection,connectionID, function(err, connection) {

                  if(err) {
                      done({result:0,msg:'Connection Error: '+ err});
                      return console.error('Connection Error: ', err);
                  }

                  var queryMetaData = {datasourceID: connectionID,source:source,selectedLayerID:layerID};

                          dbms.runQuery(newQuery, req, queryMetaData, function(err, rows) {
                              if (err)
                                  done({result:0,msg:err});
                                  else
                                  done({result:1,items:rows.rows});
                            dbms.end();
                          });

                });


      } else {
          done({result:0,msg:'Connection not found'});
      }
  });
}

function getExcelReportV1(userID,reportName,query,data,live,done)
{
            var fs = require('fs');

            if (!fs.existsSync(__dirname+'/../../../../public/downloads'))
              {
                fs.mkdirSync(__dirname+'/../../../../public/downloads');
              }
            if (!fs.existsSync(__dirname+'/../../../../public/downloads/user_'+userID))
              {
                fs.mkdirSync(__dirname+'/../../../../public/downloads/user_'+userID);
              }

            var reportURL = __dirname+'/../../../../public/downloads/user_'+userID+'/'+reportName+'.xlsx';

            var options = {
                filename: __dirname+'/../../../../public/downloads/user_'+userID+'/'+reportName+'.xlsx',
                useStyles: true,
                useSharedStrings: true
            };
            var Excel = require('exceljs');
            var workbook = new Excel.stream.xlsx.WorkbookWriter(options);
            var sheet = workbook.addWorksheet('Data export');

            var sheetColumns = [];
            var columns = [];

            for (var c in query.columns)
            {
                        var elementName = 'wst'+query.columns[c].elementID.toLowerCase().replace(/[^a-zA-Z ]/g,'');

                        if (query.columns[c].key)
                            elementName = query.columns[c].key.toLowerCase();

                        if (query.columns[c].aggregation)
                            elementName = elementName+query.columns[c].aggregation;

                        var elementLabel = query.columns[c].objectLabel;
                        sheetColumns.push({header:elementLabel,key:elementName});
                        columns.push({elementName:elementName});
            }

            sheet.columns = sheetColumns; //don´t try to push directly into sheet.columns, doesn´t work that way

            var rows = [];


            rows.push.apply(rows, data);

            streamThoseRows(columns,rows,sheet,function(){

                    workbook.commit()
                          .then(function() {
                              if (live)
                                {
                                    //deliver the file in real time to the client
                                    done(options.filename);
                                } else {
                                    sendNotification(userID, {text: 'Your '+reportName +' report is ready to download', url: reportURL}, function(result) {
                                            done(options.filename);
                                    });
                                }
                          });

          });

}

function streamThoseRows(columns,rows,sheet,done)
{
    for (var r in rows)
    {
        sheet.addRow(rows[r]).commit();
    }

    done();
}
