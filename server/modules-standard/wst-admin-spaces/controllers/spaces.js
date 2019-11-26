var Spaces = connection.model('Spaces');

require('../../../core/controller.js');

function SpacesController(model) {
    this.model = model;
    this.searchFields = [];
}

SpacesController.inherits(Controller);

var controller = new SpacesController(Spaces);

exports.getSpaces = function(req, res)
{
  Spaces.getCompanySpace(req, function(result){
        serverResponse(req, res, 200, result);
  });
}


exports.updateSpace = function(req, res)
{
  req.query.companyid = true;

  req.body._id = req.params.ID;

  controller.update(req, function(result){
      serverResponse(req, res, 200, result);
  })


}

exports.createSpace = function(req, res)
{
  req.query.companyid = true;

  controller.create(req, function(result){
      serverResponse(req, res, 200, result);
  });
}
