var Dashboards = connection.model('Dashboards');

require('../../../core/controller.js');

function DashboardsController(model) {
    this.model = model;
    this.searchFields = [];
}

DashboardsController.inherits(Controller);

var controller = new DashboardsController(Dashboards);

exports.dashboardsFindAll = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    req.query.find = [{owner: req.user._id}];

    controller.findAll(req, function(result) {
            serverResponse(req, res, 200, result);
    });
};

exports.dashboardsFindOne = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    req.query.id = req.params.dashboardID;

    controller.findOne(req, function(result){
        if (req.query.mode  && result.item)
        {
            //Note the execution in statistics
            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'dash';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.dashboardName;
            stat.action = req.query.mode;
            statistics.save(req, stat, function(err, statsResult) {

            }); 
        }
        serverResponse(req, res, 200, result);
    });
};

exports.dashboardsCreate = function(req,res){

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

exports.dashboardsUpdate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;
    var data = req.body;
    var isAdmin = false;

    if (!isAdmin)
    {
        var Dashboards = connection.model('Dashboards');
        Dashboards.findOne({_id:data._id,owner:req.user._id,companyID:req.user.companyID}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.update(req, function(result){
                    serverResponse(req, res, 200, result);
                })
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to update this dashboard, or this report do not exists"});
            }
        });
    } else {
        controller.update(req, function(result){
            serverResponse(req, res, 200, result);
        })
    }

};

exports.dashboardsDelete = function(req,res){
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data._id = req.params.dashboardID;
    req.params.id = req.params.dashboardID;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    var isAdmin = false;

    if (!req.session.isSUPERADMIN)
    {
        var Dashboards = connection.model('Dashboards');
        Dashboards.findOne({_id:data._id,owner:req.user._id}, {_id:1}, {}, function(err, item){
            if(err) throw err;
            if (item) {
                controller.remove(req, function(result){
                    serverResponse(req, res, 200, result);
                });
            } else {
                serverResponse(req, res, 401, {result: 0, msg: "You don´t have permissions to delete this dashboard"});
            }
        });

    } else {
        controller.remove(req, function(result){
            serverResponse(req, res, 200, result);
        });
    }
};

exports.PublishDashboard = function(req,res)
{
    var dashID = req.params.dashboardID;
    var parentFolder = req.params.parentFolder;

    //have the connected user permissions to publish?
    var Dashboards = connection.model('Dashboards');
    var find = {_id:dashID,owner:req.user._id,companyID:req.user.companyID};

    if (req.session.isSUPERADMIN)
        find = {_id:dashID,companyID:req.user.companyID};

    Dashboards.findOne(find, {dashboardName:1}, {}, function(err, dash){
        if(err) throw err;
        if (dash) {
            Dashboards.update({_id:dashID}, {$set: {parentFolder:parentFolder,isPublic:true} }, function (err, numAffected) {
                if(err) throw err;

                if (numAffected.ok == 1)
                {
                    serverResponse(req, res, 200, {result: 1, msg: "Dashboard has been published."});
                } else {
                    serverResponse(req, res, 200, {result: 0, msg: "Error publishing dashboard, no dashboard have been published"});
                }
            });
        } else {

            serverResponse(req, res, 401, {result: 0, msg: "Not valid Dashboard ID or you don´t have permissions to publish this Dashboard"});
        }

    });

}


exports.UnpublishDashboard = function(req,res)
{
  var dashID = req.params.dashboardID;


  //have the connected user permissions to publish / unpublish?
  var Dashboards = connection.model('Dashboards');
  var find = {_id:dashID,owner:req.user._id,companyID:req.user.companyID};

  if (req.session.isSUPERADMIN)
      find = {_id:dashID,companyID:req.user.companyID};

  Dashboards.findOne(find, {dashboardName:1}, {}, function(err, dash){
      if(err) throw err;
      if (dash) {
          Dashboards.update({_id:dashID}, {$set: {parentFolder:undefined,isPublic:false} }, function (err, numAffected) {
              if(err) throw err;

              if (numAffected.ok == 1)
              {
                  serverResponse(req, res, 200, {result: 1, msg: "Dashboard has been unpublished."});
              } else {
                  serverResponse(req, res, 200, {result: 0, msg: "Error unpublishing dashboard, no dashboard have been unpublished"});
              }
          });
      } else {

          serverResponse(req, res, 401, {result: 0, msg: "Not valid dashboard ID or you don´t have permissions to unpublish this dashboard"});
      }

  });

}

exports.GetDashboard4View = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;

    req.query.id = req.params.dashboardID;
    req.query._id = req.params.dashboardID;

    req.query.find = (req.query.find) ? req.query.find : [];

    req.query.find.push({status: 'Active'});



    if (req.user) {
        controller.findOne(req, function(result){
            //TODO: favourites
            
            //TODO: stats

            if (req.query.mode  && result.item)
            {
                //Note the execution in statistics
                var statistics = connection.model('statistics');
                var stat = {};
                stat.type = 'dash';
                stat.relationedID = result.item._id;
                stat.relationedName = result.item.dashboardName;

                if (req.query.linked == true)
                    stat.action = 'execute link';
                else
                    stat.action = req.query.mode;
                statistics.save(req, stat, function(err, statsResult) {

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
    console.log('the dash',req.query)
    req.query.companyid = false;
    controller.findOne(req, function(result){
        console.log('the dash',result)
       serverResponse(req, res, 200, result);
    });
}

