var Reports = connection.model('Reports');

require('../../../core/controller.js');

function ReportsController(model) {
    this.model = model;
    this.searchFields = ['reportName','description'];
}

ReportsController.inherits(Controller);

var controller = new ReportsController(Reports);

exports.reportsFindAll = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    req.query.find = [{owner: req.user._id}];

    controller.findAll(req, function(result) {
      //TODO: Favourites
        /*
        var Users = connection.model('Users');

        Users.findOne({_id: req.user._id}, {favourites: 1}, function(err, user) {
            if (err) throw err;

            if (user.favourites.reports && user.favourites.reports) {
                for (var i in result.items) {
                    result.items[i] = result.items[i].toObject();

                    for (var f in user.favourites.reports) {
                        if (String(result.items[i]._id) == String(user.favourites.reports[f])) {
                            result.items[i].favourite = true;
                            break;
                        }
                    }
                }
            }
*/
            serverResponse(req, res, 200, result);
        //});
    });
};

exports.reportsFindOne = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.reportsCreate = function(req,res){

        req.query.trash = true;
        req.query.companyid = true;
        req.query.userid = true;

        req.body._id = undefined;
        req.body.owner = req.user._id;
        req.body.isPublic = false;

        controller.create(req, function(result){
            serverResponse(req, res, 200, result);
        });

};

exports.reportsUpdate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;
    var data = req.body;

    if (!req.session.isWSTADMIN)
    {
        var Reports = connection.model('Reports');
        Reports.findOne({_id:data._id,owner:req.user._id,companyID:req.user.companyID}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                })
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to update this report, or this report do not exists"});
            }
        });
    } else {
        controller.update(req, function(result){
            serverResponse(req, res, 200, result);
        })
    }

};

exports.reportsDelete = function(req,res){
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = req.params.reportID;
    req.params.id = req.params.reportID;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;
    if (!req.session.isSUPERADMIN)
    {
        var Reports = connection.model('Reports');
        Reports.findOne({_id:data._id,owner:req.user._id}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.remove(req, function(result){
                    serverResponse(req, res, 200, result);
                });
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to delete this report"});
            }
        });

    } else {
        controller.remove(req, function(result){
            serverResponse(req, res, 200, result);
        });
    }
};

exports.PublishReport = function(req,res)
{
    var reportID = req.params.reportID;
    var parentFolder = req.params.parentFolder;

    //have the connected user permissions to publish?
    var Reports = connection.model('Reports');
    var find = {_id:reportID,owner:req.user._id,companyID:req.user.companyID};

    if (req.session.isSUPERADMIN)
        find = {_id:reportID,companyID:req.user.companyID};

    Reports.findOne(find, {reportName:1}, {}, function(err, report){
        if(err) throw err;
        if (report) {
            Reports.update({_id:reportID}, {$set: {parentFolder:parentFolder,isPublic:true} }, function (err, numAffected) {
                if(err) throw err;

                if (numAffected.ok == 1)
                {
                    serverResponse(req, res, 200, {result: 1, msg: "Report has been published."});
                } else {
                    serverResponse(req, res, 200, {result: 0, msg: "Error publishing report, no report have been published"});
                }
            });
        } else {

            serverResponse(req, res, 401, {result: 0, msg: "Not valid report ID or you don´t have permissions to publish this report"});
        }

    });

}


exports.UnpublishReport = function(req,res)
{
  var reportID = req.params.reportID;


  //have the connected user permissions to publish / unpublish?
  var Reports = connection.model('Reports');
  var find = {_id:reportID,owner:req.user._id,companyID:req.user.companyID};

  if (req.session.isSUPERADMIN)
      find = {_id:reportID,companyID:req.user.companyID};

  Reports.findOne(find, {reportName:1}, {}, function(err, report){
      if(err) throw err;
      if (report) {
          Reports.update({_id:reportID}, {$set: {parentFolder:undefined,isPublic:false} }, function (err, numAffected) {
              if(err) throw err;

              if (numAffected.ok == 1)
              {
                  serverResponse(req, res, 200, {result: 1, msg: "Report has been unpublished."});
              } else {
                  serverResponse(req, res, 200, {result: 0, msg: "Error unpublishing report, no report have been unpublished"});
              }
          });
      } else {

          serverResponse(req, res, 401, {result: 0, msg: "Not valid report ID or you don´t have permissions to unpublish this report"});
      }

  });

}


exports.GetReport4View = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    req.query.find = (req.query.find) ? req.query.find : [];

    req.query.find.push({status: 'Active'});

    if (req.user) {
        controller.findOne(req, function(result){
            //TODO: favourites
            /*var Users = connection.model('Users');

            Users.findOne({_id: req.user._id}, {favourites: 1}, function(err, user) {
                if (err) throw err;

                if (user.favourites.reports && user.favourites.reports) {
                    for (var f in user.favourites.reports) {
                        if (String(result.item._id) == String(user.favourites.reports)) {
                            result.item.favourite = true;
                            break;
                        }
                    }
                }

                serverResponse(req, res, 200, result);
            });
            */
            //TODO: stats

            if (req.query.mode  && result.item)
            {
                //Note the execution in statistics
                var statistics = connection.model('statistics');
                var stat = {};
                stat.type = 'report';
                stat.relationedID = result.item._id;
                stat.relationedName = result.item.reportName;

                if (req.query.linked == true)
                    stat.action = 'execute link';
                else
                    stat.action = req.query.mode;
                statistics.save(req, stat, function() {

                });
            }
            serverResponse(req, res, 200, result);
        });
    }
    else {
        execute4AnonimousUser(req,res);
    }
};

function execute4AnonimousUser(req,res)
{
  //TODO: Review , what happens if is not an multicompany install
  var host = String(req.headers.host).split('.')[0];

  var Companies = connection.model('Companies');

  Companies.findOne({subdomain: host}, {_id: 1}, function(err, company) {
      if (err) throw err;

      if (company) {
          req.user = {
              companyID: company._id
          };
          req.query.find.push({shared: {$ne: 0}});
          controller.findOne(req, function(result){
              serverResponse(req, res, 200, result);
              if ((req.query.mode == 'execute' || req.query.mode == 'preview')  && result.item)
              {
                  //Note the execution in statistics
                  var statistics = connection.model('statistics');
                  var stat = {};
                  stat.type = 'report';
                  stat.relationedID = result.item._id;
                  stat.relationedName = result.item.reportName;

                  if (req.query.linked == true)
                      stat.action = 'execute link';
                  else
                      stat.action = 'execute';
                  statistics.save(req, stat, function() {

                  });
              }
          });
      }
      else {
          serverResponse(req, res, 200, {result: 0, msg: "Company not found."});
      }
  });
}

exports.changeReportStatus = function(req,res){

    Reports.setStatus(req,req.params.reportID,req.body.status,function(result){
        serverResponse(req, res, 200, result);
    });

}
