var Logs = connection.model('Logs');
require('../../core/controller.js');
function LogsController(model) {
    this.model = model;
    this.searchFields = ['text','userName','logType','logFamily','ip'];
}
LogsController.inherits(Controller);
var controller = new LogsController(Logs);

exports.logsFindAll = function(req,res) {
    req.query.companyid = true;

    req.body.companyID = req.user.companyID;

    req.query.fields = ['text', 'type','code', 'createdOn', 'logType', 'logFamily', 'userName', 'ip'];

    req.query.sort = 'createdOn';
    req.query.sortType = -1;

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
}
