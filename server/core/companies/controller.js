var Companies = connection.model('Companies');

require('../../core/controller.js');

function CompaniesController(model) {
    this.model = model;
    this.searchFields = [];
}


exports.getCompanyData = function(req,res){
    var Companies = connection.model('Companies');
    Companies.findOne({_id:req.user.companyID,nd_trash_deleted: false},{},function(err, company){
        serverResponse(req, res, 200, {result: 1, page: 1, pages: 1, items: company});

    });
};

exports.savePublicSpace = function(req,res){
    var data = req.body;

    var Companies = connection.model('Companies');

    Companies.update({_id:req.user.companyID}, {$set: {publicSpace: data} }, function (err, result) {
        if(err) throw err;

        var numAffected = (typeof result.n == 'undefined') ? result.nModified : result.n;

        if (numAffected>0)
        {
            var result = {result: 1, msg: numAffected+" record updated."};
        } else {
            var result = {result: 0, msg: "Error updating record, no record have been updated"};
        }

        serverResponse(req, res, 200, result);
    });
}


exports.saveCustomCSS = function(req,res){
    var data = req.body.customCSS;

    var Companies = connection.model('Companies');
    Companies.update({_id:req.user.companyID}, {$set: {customCSS: data} }, function (err, result) {
        if(err) throw err;

        var numAffected = (typeof result.n == 'undefined') ? result.nModified : result.n;

        if (numAffected>0)
        {
            var result = {result: 1, msg: numAffected+" record updated."};
        } else {
            var result = {result: 0, msg: "Error updating record, no record have been updated"};
        }

        serverResponse(req, res, 200, result);
    });
}


exports.saveCustomLogo = function(req,res){
    var data = req.body;

    var Companies = connection.model('Companies');
    Companies.update({_id:req.user.companyID}, {$set: {customLogo: data} }, function (err, result) {
        if(err) throw err;

        var numAffected = (typeof result.n == 'undefined') ? result.nModified : result.n;

        if (numAffected>0)
        {
            var result = {result: 1, msg: numAffected+" record updated."};
        } else {
            var result = {result: 0, msg: "Error updating record, no record have been updated"};
        }

        serverResponse(req, res, 200, result);
    });
}

exports.saveSetup = function(req,res){
    var data = req.body;

    if (!data.name || !data.language || !data.subdomain) {
        return serverResponse(req, res, 200, {result: 0, msg: "'name', 'language' and 'subdomain' is required."});
    }

    Companies.update({_id:req.user.companyID}, {$set: {
        name: data.name,
        subdomain: data.subdomain,
        language: data.language,
        customLogo: data.customLogo,
        customBackground: data.customBackground
    }}, function (err, result) {
        if(err) throw err;

        serverResponse(req, res, 200, {result: 1, msg: "Company updated."});
    });
}

CompaniesController.inherits(Controller);

var controller = new CompaniesController(Companies);

exports.getSpace = function(req, res) {
    var data = req.query;

    Companies.findOne({"publicSpace.id": data.spaceID}, {"publicSpace.$": 1}, function(err, company) {
        if (err) throw err;

        var space = (company && company.publicSpace && company.publicSpace[0]) ? company.publicSpace[0] : null;

        var Reports = connection.model('Reportsv2');

        Reports.find({
            nd_trash_deleted:false, 
            companyID: company._id, 
            parentFolder: data.spaceID, 
            isPublic:true
        }, {reportName:1,reportType:1,reportDescription:1},{},function(err, reports){
            if (err) throw err;

            var nodes = [];

            for (var r in reports) {
                nodes.push({id:reports[r]._id,title:reports[r].reportName,nodeType:'report',description:reports[r].reportDescription,nodeSubtype:reports[r].reportType,nodes:[]});
            }

            serverResponse(req, res, 200, {result: 1, space: space, nodes: nodes});
        });

    });
};

exports.AdminFindAll = function(req,res){  
    controller.findAll(req, function(result){ 
        serverResponse(req, res, 200, result);
    }); 
}; 
exports.AdminFindOne = function(req,res) {
    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
}; 
exports.AdminCreate = function(req,res) {
    var data = req.body;

    if (typeof data.name == 'undefined' ) {
        serverResponse(req, res, 200, {result: 0, msg: "Missing required fields."});
        return;
    }

    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};   
exports.AdminUpdate = function(req,res) {
    var data = req.body;

    if (typeof data.name == 'undefined' ) {
        serverResponse(req, res, 200, {result: 0, msg: "Missing required fields."});
        return;
    }

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
}; 


exports.AdminDelete = function(req,res) {  
    var data = req.body;  

    controller.remove(req, function(result) {  
        serverResponse(req, res, 200, result);
    });  
};  

exports.getCustomLogo = function(req, res)
{
    Companies.findOne({subdomain: req.query.host}, {customLogo: 1}, function(err, company) {
        if (company.customLogo)
            serverResponse(req, res, 200, company.customLogo);
        else
            serverResponse(req, res, 200, 'images/logocustom.png');
    });
}

