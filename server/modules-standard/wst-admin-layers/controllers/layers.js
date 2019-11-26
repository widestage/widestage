var layers = connection.model('Layers');
require('../../../core/controller.js');
function LayersController(model) {
    this.model = model;
    this.searchFields = ['name','status'];
}
LayersController.inherits(Controller);
var controller = new LayersController(layers);



exports.LayersCreate = function(req,res){
    req.query.trash = true;
    req.query.companyid = true;
    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.LayersFindAll4Users = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    req.query.fields = ['name','status'];
    req.query.find = [{status:'Active'}];
//filter by status...

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });

}

exports.LayersFindAll = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    req.query.fields = ['name','status'];

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });

}

exports.LayersFindOne = function(req,res){

    req.query.companyid = true;
    req.query.id = req.params.layerID;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.LayersUpdate = function(req,res){

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.changeLayerStatus = function(req,res){

    layers.setStatus(req,req.params.layerID,req.body.status,function(result){
        serverResponse(req, res, 200, result);
    });

}

exports.checkforDelete = function(req, res)
{
      layers.checkDelete(req,req.params.layerID, function(result){
          serverResponse(req, res, 200, result);
      });
}

exports.deleteLayer = function(req, res)
{
      layers.deleteLayer(req,req.params.layerID, function(result){
          serverResponse(req, res, 200, result);
      });
}
