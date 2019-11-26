var mongoose = require('mongoose');

var ReportsSchema = new mongoose.Schema({
    companyID: {type: String},
    reportName: {type: String, required: true},
    reportType: {type: String},
    description: {type: String},
    reportSubType: {type: String},
    properties: {type: Object},
    query: {type: Object},
    owner: {type: String},
    createdBy: {type: String},
    createdOn: {type: Date},
    history: [],
    parentFolder: {type: String},
    isPublic:{type: Boolean},
    sharedLink: {type: Boolean, required: true, default: false},
    sharedLinkOption: {type: String},
    sharedWithUsers: {type: Array},
    sharedWithRoles: {type: Array},
    status: {type: String, required: true, default: 'Active'}, //1-Active, 0-Disabled
    limitUsage: {type: Boolean, required: true, default: false},
    usageLimit: {type: Number}, //bytes
    totalUsage: {type: Number}, //bytes
    limitExecutions: {type: Boolean, required: true, default: false},
    limitOfExecutions: {type: Number},
    numberOfExecutions: {type: Number},
    usageStatistics: {type: Object},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    selectedLayerID: {type: String}
}, { collection: 'wst_Reports' });


ReportsSchema.statics.setStatusCascade = function(req,find,status, done){
    Reports.update(find, {$set: {status:status} }, {multi: true}, function (err, result) {
      done(result);
    });
};

ReportsSchema.statics.setStatus = function(req,reportID,reportStatus, done){


        if (!reportID || typeof reportID == 'undefined') {
            done({result: 0, msg: "'id' and 'status' are required."});
            return;
        }
        this.findOne({"_id" : reportID,"companyID": req.user.companyID}, function (err, findReport) {

                if (findReport)
                {
                    Reports.update({
                        "_id" : reportID
                    }, {
                        $set: {
                            "status" : reportStatus
                        }
                    }, function (err, numAffected) {
                        if(err) throw err;
                        done({result: 1, msg: "Status updated"});
                    });
                } else {
                    done({result: 0, msg: "No report found for this company, can´t update the report´s status"});
                }


        });


}

function checkDataSources(dataSources, done, index) {
    var index = (index) ? index : 0;
    var dataSource = (dataSources[index]) ? dataSources[index] : false;

    if (!dataSource) {
        done({result: 1});
        return;
    }

    var DataSources = connection.model('DataSources');

    DataSources.checkQuotas(dataSource.datasourceID, function(data) {
        if (data.result === 0) {
            done(data);
            return;
        }
        checkDataSources(dataSources, done, index+1);
    });
}

function checkLayers(layers, done, index) {
    var index = (index) ? index : 0;
    var layer = (layers[index]) ? layers[index] : false;

    if (!layer) {
        done({result: 1});
        return;
    }

    var Layers = connection.model('Layers');

    Layers.checkQuotas(layer, function(data) {
        if (data.result === 0) {
            done(data);
            return;
        }
        checkLayers(layers, done, index+1);
    });
}

var Reports = connection.model('Reports', ReportsSchema);
module.exports = Reports;
