
exports.getMyObjects = function(req, res){
    getObjects(req,function(result){
      serverResponse(req, res, 200, result);
    });
}

exports.getObjects = function(req,done)
{
    getObjects(req,done);
}

function getObjects(req,done)
{
  var Spaces = connection.model('Spaces');
  Spaces.getCompanySpace(req, function(result){
    var folders = undefined;
    if (result.item)
      if (result.item.spaceDefinition)
           if (result.item.spaceDefinition.folders)
                folders = result.item.spaceDefinition.folders;
      if (folders && folders.length > 0)
      {
          if (req.session.isSUPERADMIN)
          {

              getFolderStructureForSUPERADMIN(req, folders,0,true,function(){

                  getNoFolderReports(req, function(reports){

                      getNoFolderDashboards(req, function(dashboards){



                              for (var d in dashboards)
                                  folders.push(dashboards[d]);
                              for (var r in reports)
                                  folders.push(reports[r]);
                              done({result: 1, page: 1, pages: 1, items: folders});



                      });
                  });



              });

          } else {
            processForUserV4(req,folders,done);
          }

      }

  });
}

function processForUserV4(req,folders,done)
{
  if (req.user.roles && req.user.roles.length > 0)
      {
          var Permissions = connection.model('Permissions');
          var find = { roleID : { $in : req.user.roles},module:'public-space-folders',granted:true,companyID:req.user.companyID };
          //if (req.session.isSUPERADMIN)
            //  find = {companyID:req.user.companyID };
          Permissions.find(find,{},function(err, permissions){

              navigatePermissionsV4(req,folders,0,true,permissions,function(newFolders){  //navigateRoles

                  getNoFolderReports(req, function(reports){

                     getNoFolderDashboards(req, function(dashboards){


                             for (var d in dashboards)
                                 newFolders.push(dashboards[d]);
                             for (var r in reports)
                                 newFolders.push(reports[r]);
                             done({result: 1, page: 1, pages: 1, items: newFolders});


                     });
                  });
              });
          }).lean();

      } else {
          //Has no access to any folder
          folders = [];
          getNoFolderReports(req, function(reports){

              getNoFolderDashboards(req, function(dashboards){


                      for (var d in dashboards)
                          folders.push(dashboards[d]);
                      for (var r in reports)
                          folders.push(reports[r]);


                      done({result: 1, page: 1, pages: 1, items: folders, userCanPublish: false});

              });
          });

      }
}

function navigatePermissionsV4(req,folders,folderIndex,rootLevel,permissions,done)
{

  if (folders[folderIndex] == undefined)
  {
     if (rootLevel)
     {
          done(folders);
     }
    return;

  } else {

          for (var p in permissions)
              {
                 if (permissions[p].objectID == folders[folderIndex].id)
                    {
                      if (!folders[folderIndex].permissions)
                          folders[folderIndex].permissions = {};
                      folders[folderIndex].permissions[permissions[p].permission] = true;

                    }
              }

              if (folders[folderIndex].permissions && folders[folderIndex].permissions['see'] == true)
              {
                      getReportsForFolder(req, folders[folderIndex].id,folders[folderIndex],function(reports,folder){
                              for (var n in reports)
                                      folder.nodes.push(reports[n]);

                              getDashboardsForFolder(req, folders[folderIndex].id,folders[folderIndex],function(dashboards,folder){
                                      for (var n in dashboards)
                                          folder.nodes.push(dashboards[n]);

                              });

                      });
              }


              if (folders[folderIndex].nodes)
                  if (folders[folderIndex].nodes.length > 0)
                  {
                      navigatePermissionsV4(req,folders[folderIndex].nodes,0,false,permissions,done);
                  }





          /* This has to be done in other way otherwise is not working cause the scanned folders number is not the same
           if (!folders[folderIndex].permissions || folders[folderIndex].permissions.length == 0)
              {

                 folders.splice(folderIndex,1);
              }
          */
          navigatePermissionsV4(req,folders,folderIndex+1,rootLevel,permissions,done);

        }
}


function getFolderStructureForSUPERADMIN(req, folders,index,firstRound, done) {

    var sec = 0;
    var i = index;

    if (folders[i] == undefined)
    {
       if (firstRound)
       {
            done();
       }
      return;

    } else {

            if (folders[i].nodes)
                if (folders[i].nodes.length > 0)
                    getFolderStructureForSUPERADMIN(req, folders[i].nodes,0,false,done);


            var theFolder = folders[i];
            theFolder.permissions = {};
            theFolder.permissions.see = true;
            theFolder.permissions.publish = true;
            theFolder.permissions.unpublish = true;
            theFolder.permissions.createSubFolder = true;

            getReportsForFolder(req,theFolder.id,theFolder,function(reports,folder){

                    folder = Object(folder);

                    for (var n in reports)
                    {
                        if (folder.nodes)
                            folder.nodes.push(reports[n]);
                    }

                    getDashboardsForFolder(req,folder.id,folder,function(dashboards,folder){
                            for (var n in dashboards)
                            {
                                if (folder.nodes)
                                folder.nodes.push(dashboards[n]);
                            }


                            getFolderStructureForSUPERADMIN(req, folders,i+1,firstRound,done);


                    });
                });
    }
}

function getReportsForFolder(req,idfolder,folder,done)
{
    if (folder.permissions && folder.permissions.see)
    {
        var Reports = connection.model('Reports');

        var find = {"$and":[{"nd_trash_deleted":false},{"companyID": req.user.companyID},{status:'Active'},{parentFolder:idfolder},{isPublic:true}]}
        var fields = {reportName:1,reportType:1,reportDescription:1};

        Reports.find(find,fields,{},function(err, reports){

            var nodes = [];
             for (var r in reports)
             {
                nodes.push({id:reports[r]._id,title:reports[r].reportName,nodeType:'report',description:reports[r].reportDescription,nodeSubtype:reports[r].reportType,nodes:[]});
             }
            done(nodes,folder);
        });
    } else {
        done([],folder);
    }
}

function getDashboardsForFolder(req,idfolder,folder,done)
{
    if (folder.permissions && folder.permissions.see)
    {
        var Dashboards = connection.model('Dashboards');

            var find = {"$and":[{"nd_trash_deleted":false},{"companyID": req.user.companyID},{status:'Active'},{parentFolder:idfolder},{isPublic:true}]}
            var fields = {dashboardName:1,dashboardDescription:1};

        Dashboards.find(find,fields,{},function(err, dashboards){

                var nodes = [];
                for (var r in dashboards)
                {
                    nodes.push({id:dashboards[r]._id,title:dashboards[r].dashboardName,nodeType:'dashboard',description:dashboards[r].dashboardDescription,nodes:[]});
                }

                done(nodes,folder)
            });

    } else {
        done([],folder);
    }
}




function getNoFolderReports(req, done)
{

    var Reports = connection.model('Reports');

    var find = {"$and":[{"nd_trash_deleted":false},{"companyID": req.user.companyID},{status:'Active'},{isPublic:true},{parentFolder: 'root'}]}
    var fields = {reportName:1,reportType:1,reportDescription:1};

    Reports.find(find,fields,{},function(err, reports){

        var nodes = [];
        for (var r in reports)
        {
            nodes.push({id:reports[r]._id,title:reports[r].reportName,nodeType:'report',description:reports[r].reportDescription,nodeSubtype:reports[r].reportType,nodes:[]});
        }
        done(nodes);
    });

}

function getNoFolderDashboards(req, done)
{
    var Dashboards = connection.model('Dashboards');

    var find = {"$and":[{"nd_trash_deleted":false},{"companyID": req.user.companyID},{status:'Active'},{isPublic:true},{parentFolder: 'root'}]}
    var fields = {dashboardName:1,dashboardDescription:1};

    Dashboards.find(find,fields,{},function(err, dashboards){

        var nodes = [];
        for (var r in dashboards)
        {
            nodes.push({id:dashboards[r]._id,title:dashboards[r].dashboardName,nodeType:'dashboard',description:dashboards[r].dashboardDescription,nodes:[]});
        }

        done(nodes)
    });
}


exports.getMyLastExecutions = function(req, res){
    var statistics = connection.model('statistics');

    //TODO: Doesn´t work with NEDB

    if (req.session.isSUPERADMIN)
    {
        var find = {"$and":[{companyID:''+req.user.companyID+''},{action:"execute"}]};
    } else {
        var find = {"$and":[{companyID:''+req.user.companyID+''},{userID:''+req.user._id+''},{action:"execute"}]}
    }

    //Last executions
    if (global.config.db_type === 'mongoDB')
    {
            statistics.aggregate([
                { $match: find},
                { $group: {
                    _id: {relationedID:"$relationedID",
                        type: "$type",
                        relationedName: "$relationedName",
                        action: "$action"},
                    lastDate: { $max: "$createdOn"}
                }},
                { $sort : { lastDate : -1 } },
                { $limit : 10 }
            ], function (err, lastExecutions) {
                if (err) {
                    console.log(err);
                    return;
                }


                statistics.aggregate([
                    { $match: find},
                    { $group: {
                        _id: {relationedID:"$relationedID",
                            type: "$type",
                            relationedName: "$relationedName",
                            action: "$action"},
                        count: { $sum: 1 }
                    }},
                    { $sort : { count : -1 } },
                    { $limit : 10 }
                ], function (err, mostExecuted) {
                    if (err) {
                        console.log(err);
                        return;
                    }


                    var allExecutedReports = [];

                    var allExecutedDashs = [];

                    for (var le in lastExecutions)
                      {
                        if (lastExecutions[le]._id.type == 'report')
                            allExecutedReports.push(lastExecutions[le]._id.relationedID)
                        if (lastExecutions[le]._id.type == 'dash')
                            allExecutedDashs.push(lastExecutions[le]._id.relationedID)
                      }

                      var allMostReports = [];

                      var allMostDashs = [];

                      for (var le in mostExecuted)
                        {
                          if (mostExecuted[le]._id.type == 'report')
                              allMostReports.push(mostExecuted[le]._id.relationedID)
                          if (mostExecuted[le]._id.type == 'dash')
                              allMostDashs.push(mostExecuted[le]._id.relationedID)
                        }



                    var Reports = connection.model('Reports');
                    Reports.find({status:'Active',_id:{$in:allExecutedReports}},{reportName:1},{},function(err, latestReports){


                      var Dashboards = connection.model('Dashboards');
                      Dashboards.find({status:'Active',_id:{$in:allExecutedDashs}},{dashboardName:1},{},function(err, latestDashs){

                        //Most executed
                        var Reports = connection.model('Reports');
                        Reports.find({status:'Active',_id:{$in:allMostReports}},{reportName:1},{},function(err, mostReports){


                          var Dashboards = connection.model('Dashboards');
                          Dashboards.find({status:'Active',_id:{$in:allMostDashs}},{dashboardName:1},{},function(err, mostDashs){

                              var finalLastExecutions = [];
                              var finalMostExecutions = [];

                              for (var lr in latestReports)
                                {
                                  var report = {};
                                  report._id = latestReports[lr]._id;
                                  report.name = latestReports[lr].reportName;

                                  for (var le in lastExecutions)
                                      {
                                        if (lastExecutions[le]._id.relationedID == report._id)
                                            {
                                              report.type = lastExecutions[le]._id.type;
                                              report.lastDate = lastExecutions[le].lastDate;
                                            }
                                      }
                                  finalLastExecutions.push(report);
                                }
                                for (var ld in latestDashs)
                                  {
                                    var dh = {};
                                    dh._id = latestDashs[ld]._id;
                                    dh.name = latestDashs[ld].dashboardName;

                                    for (var le in lastExecutions)
                                        {
                                          if (lastExecutions[le]._id.relationedID == dh._id)
                                              {
                                                dh.type = lastExecutions[le]._id.type;
                                                dh.lastDate = lastExecutions[le].lastDate;
                                              }
                                        }
                                    finalLastExecutions.push(dh);
                                  }
                                  for (var mr in mostReports)
                                    {
                                      var report = {};
                                      report._id = mostReports[mr]._id;
                                      report.name = mostReports[mr].reportName;

                                      for (var me in mostExecuted)
                                          {
                                            if (mostExecuted[me]._id.relationedID == report._id)
                                                {
                                                  report.type = mostExecuted[me]._id.type;
                                                  report.count = mostExecuted[me].count;
                                                }
                                          }
                                      finalMostExecutions.push(report);
                                    }
                                    for (var md in mostDashs)
                                      {
                                        var dh = {};
                                        dh._id = mostDashs[md]._id;
                                        dh.name = mostDashs[md].dashboardName;

                                        for (var me in mostExecuted)
                                            {
                                              if (mostExecuted[me]._id.relationedID == dh._id)
                                                  {
                                                    dh.type = mostExecuted[me]._id.type;
                                                    dh.count = mostExecuted[me].count;
                                                  }
                                            }
                                        finalMostExecutions.push(dh);
                                      }

                                      finalLastExecutions.sort(function(a,b){
                                        return new Date(b.lastDate) - new Date(a.lastDate);
                                      });

                                      finalMostExecutions.sort(function(a,b){
                                        return b.count - a.count;
                                      });



                                      var mergeResults = {theLastExecutions : finalLastExecutions, theMostExecuted: finalMostExecutions };

                                      serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: mergeResults});



                          });



                        });


                      });



                    });



                });


            });

    } else {
        serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: {theLastExecutions : [], theMostExecuted: []}});
    }

}

exports.getMyOtherData = function(req, res)
{

    //TODO: This is backing all info including the password, etc...
    //Disabled for now for security reasons
    /*
    var Users = connection.model('Users');
    Users.findOne({_id:req.user._id},{},function(err, user){
            serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: user});
    });
    */
    serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: []});
}



exports.getMyCounts = function(req,res){
    var body = req.body;
    var userID = req.user.id;
    var companyID = req.user.companyID;
    var theCounts = {};

    //Only for SUPERADMIN - these counts are only for the SUPERADMIN role
    var isSUPERADMIN = false;

    if(req.isAuthenticated()){
        for (var i in req.user.roles) {
            if (req.user.roles[i] == 'SUPERADMIN'){
                isSUPERADMIN = true;
            }
        }
    }

    if (isSUPERADMIN)
    {
        //get all reports
        var Reports = connection.model('Reports');
        Reports.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, reportCount) {
            theCounts.reports = reportCount;
            //get all dashboards
            var Dashboardsv2 = connection.model('Dashboards');
            Dashboardsv2.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, dashCount) {
                theCounts.dashBoards = dashCount;
                //get all datasources
                    var Connections = connection.model('Connections');
                    Connections.count({companyID: companyID,nd_trash_deleted:false}, function (err, dtsCount) {
                        theCounts.dataSources = dtsCount;
                        //get all layers
                        var Layers = connection.model('Layers');
                        Layers.count({companyID: companyID,nd_trash_deleted:false}, function (err, layersCount) {
                            theCounts.layers = layersCount;
                            //get all users
                            var AdminUsers = connection.model('AdminUsers');
                            AdminUsers.count({companyID: companyID,nd_trash_deleted:false}, function (err, usersCount) {
                                theCounts.users = usersCount;
                                //get all roles
                                var Roles = connection.model('Roles');
                                Roles.count({companyID: companyID,nd_trash_deleted:false}, function (err, rolesCount) {
                                    theCounts.roles = rolesCount;
                                    //send the response
                                    serverResponse(req, res, 200, theCounts);
                                });

                            });
                        });
                    });



            });
        });

    } else {
        //get all reports
        var Reports = connection.model('Reports');
        Reports.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, reportCount) {
            theCounts.reports = reportCount;
            //get all dashboards
            var Dashboards = connection.model('Dashboards');
            Dashboards.count({companyID: companyID,owner:req.user._id,nd_trash_deleted:false}, function (err, dashCount) {
                theCounts.dashBoards = dashCount;
                    serverResponse(req, res, 200, theCounts);
            });
        });
    }

};

exports.getUserCounts = function(req,res){
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var theCounts = {};

        //get all reports
        var Reports = connection.model('Reports');
        Reports.count({companyID: companyID,owner:userID,isPublic:true,nd_trash_deleted:false}, function (err, reportCount) {
            theCounts.publishedReports = reportCount;
            //get all dashboards
            var Dashboards = connection.model('Dashboards');
            Dashboards.count({companyID: companyID,owner:userID,isPublic:true,nd_trash_deleted:false}, function (err, dashCount) {
                theCounts.publishedDashBoards = dashCount;

                Reports.count({companyID: companyID,owner:userID,isPublic:false,nd_trash_deleted:false}, function (err, privateReportCount) {
                    theCounts.privateReports = privateReportCount;

                    var Dashboards = connection.model('Dashboards');
                    Dashboards.count({companyID: companyID,owner:userID,isPublic:false,nd_trash_deleted:false}, function (err, privateDashCount) {
                        theCounts.privateDashBoards = privateDashCount;
                        serverResponse(req, res, 200, theCounts);
                    });
                });
            });
        });
};

exports.getUserReports = function(req,res){
    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var Reports = connection.model('Reports');
    Reports.find({companyID: companyID,owner:userID,nd_trash_deleted:false},{reportName:1,parentFolder:1,isPublic:1,reportType:1,reportDescription:1,status:1}, function (err, reports) {
        serverResponse(req, res, 200, {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: reports});
    });
}

exports.getUserDashboards = function(req,res){
    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var Dashboards = connection.model('Dashboards');
    Dashboards.find({companyID: companyID,owner:userID,nd_trash_deleted:false},{dashboardName:1,parentFolder:1,isPublic:1,dashboardDescription:1,status:1}, function (err, privateDashCount) {
        serverResponse(req, res, 200, {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: privateDashCount});
    });
}
