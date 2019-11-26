var Roles = connection.model('Roles');
require('../../core/controller.js');
function RolesController(model) {
    this.model = model;
    this.searchFields = ['actionCategory'];
}
RolesController.inherits(Controller);
var controller = new RolesController(Roles);



exports.RolesCreate = function(req,res){
    req.query.trash = true;
    //req.user = {};
    //req.user.companyID = 'COMPID';
    req.query.companyid = true;

    req.body.companyID = req.user.companyID;

    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


exports.RolesUpdate = function(req,res){
    //req.query.trash = true;
    //req.query.companyid = true;

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


exports.RolesFindAll = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    //req.user = {};
    //req.user.companyID = 'COMPID';

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
}

exports.GetRoles = function(req,res)
{

    req.query.trash = true;
    req.query.companyid = true;
    //req.user = {};
    //req.user.companyID = 'COMPID';

    req.query.fields = ['name','description', 'permissions'];

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
}

exports.RolesFindOne = function(req,res){

    req.query.companyid = true;
    //req.user = {};
    //req.user.companyID = 'COMPID';

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};


exports.RolesDelete = function(req,res){
    var data = req.body;

    req.query.trash = true;
    req.query.companyid = true;

    data._id = data.id;
    data.nd_trash_deleted = true;
    data.nd_trash_deleted_date = new Date();

    req.body = data;

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.RolesActive = function(req, res)
{
      req.query.trash = true;
      req.query.companyid = true;
      req.query.fields = ['name','description'];

      controller.findAll(req, function(result){
              serverResponse(req, res, 200, result);
      });
}
