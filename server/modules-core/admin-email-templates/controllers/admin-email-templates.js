var AdminEmailTemplates = connection.model('AdminEmailTemplates');
require('../../../core/controller.js');
function AdminEmailTemplatesController(model) {
    this.model = model;
    this.searchFields = ['name','code'];
}
AdminEmailTemplatesController.inherits(Controller);
var controller = new AdminEmailTemplatesController(AdminEmailTemplates);


exports.createEmailTemplate = function(req,res)
{
  req.query.trash = false;
  req.query.companyid = true;

  req.body.companyID = req.user.companyID;

  controller.create(req, function(result){
      serverResponse(req, res, 200, result);
  });
}
exports.getEmailTemplates = function(req,res)
{
  req.query.trash = false;
  req.query.companyid = true;
  req.query.fields = ['name','code'];

  /*
      Multicompany If the company does not have the required email templates, then copy from the base company and then serve
  */

  controller.findAll(req, function(result){

          serverResponse(req, res, 200, result);

  });
}

exports.getEmailTemplate = function(req,res)
{
  req.query.trash = false;
  req.query.companyid = true;
  req.query.id = req.params.templateID;

  controller.findOne(req, function(result){
      serverResponse(req, res, 200, result);
  });
}

exports.updateEmailTemplate = function(req,res)
{
  req.query.trash = false;
  req.query.companyid = true;

          controller.update(req, function(result){
              serverResponse(req, res, 200, result);
          });
}
