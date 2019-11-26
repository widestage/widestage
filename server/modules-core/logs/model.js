var mongoose = require('mongoose');

var logsSchema = new mongoose.Schema({
    text: String,
    type: String,
    logType: String,
    logFamily: String,
    module: String,
    recipient: String,
    userID: String,
    transactionID: String,
    user: {},
    userName: String,
    otherInfo: {},
    ip: String,
    companyID: {type: String},
    companyName: String,
    companyLicenseCode: String,
    relationID: {type: String},
    relationCollection: {type: String},
    action: {type: String}, //'create', 'update', 'delete'
    code: {type: String},
    associatedID: String,
    hostDetails: {},
    createdOn: { type: Date, default: Date.now },
    createdBy: {type: String}
}, { collection: 'wice_Logs' });



//Log Types
//100 info
//200 warnings
//300 error
//400 SQL


logsSchema.statics.saveToLog = function(req, data, otherInfo, done){

    if(req)
        if (req.user) {
            var companyID = req.user.companyID;
            var companyName = req.session.company.companyName;
            var companyLicenseCode = req.session.company.licenseCode;
        }

    var os = require("os");
    var hostDetails = {};
        hostDetails.hostName = os.hostname();
        hostDetails.hostType = os.type();
        hostDetails.hostPlatform = os.platform();
        hostDetails.hostArch = os.arch();
        hostDetails.hostRelease = os.release();
        hostDetails.hostUptime = os.uptime();
        hostDetails.hostLoadavg = os.loadavg();
        hostDetails.hostTotalmem = os.totalmem();
        hostDetails.hostFreemem = os.freemem();
        hostDetails.hostCpus = os.cpus();



    if (req) {
        var log = {
            text: data.text,
            logType: data.logType,
            logFamily: data.logFamily,
            otherInfo: otherInfo,
            type: data.type,
            module: data.module,
            recipient: data.recipient,
            transactionID: data.transactionID,
            companyID: companyID,
            companyName: companyName,
            companyLicenseCode: companyLicenseCode,
            associatedID: data.associatedID,
            userID : (req.isAuthenticated()) ? req.user.id : null,
            user : (req.isAuthenticated()) ? req.user : null,
            userName :  (req.isAuthenticated()) ? req.user.userName : null,
            ip : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            code: data.code,
            hostDetails: hostDetails
        };
    }
    else {
        var log = {
            text: data.text,
            logType: data.logType,
            logFamily: data.logFamily,
            otherInfo: otherInfo,
            type: data.type,
            associatedID: data.associatedID,
            code: data.code,
            hostDetails: hostDetails
        };
    }

    this.create(log, function(err, log){
        if(err) throw err;

        if (typeof done != 'undefined') done({result: 1, msg: "Log created", log: log});
    });
}

// admin methods

logsSchema.statics.adminFindAll = function(req, done){
    var Log = this, perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var find = {}, searchText = (req.query.search) ? req.query.search : false;

    if (searchText)
        find = {$or: [{text: {$regex : searchText}}, {user_id: {$regex : searchText}} ]};

    this.find(find,{}, {skip: (page-1)*perPage, limit: perPage, sort: {created: -1}}, function(err, logs){
        if(err) throw err;

        Log.count(find, function (err, count) {
            done({result: 1, page: page, pages: Math.ceil(count/perPage), logs: logs});
        });
    });
}

//var Log = mongoose.model("Log", logsSchema);
global.registerDBModel('Logs');
var Logs = connection.model('Logs', logsSchema);
module.exports = Logs;
