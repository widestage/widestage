var mongoose = require('mongoose');


var LayersSchema = new mongoose.Schema({
    companyID: {type: String, required: false},
    name: {type: String, required: true},
    description: {type: String},
    status: {type: String, required: true},
    params:  {type: Object},
    model:  {type: Object},
    dataSourceID: {type: String},
    objects: [],
    roles: [],
    groupFilters: [],
    shared: {type: Number, required: true, default: 0},
    sharedWith: {type: Array},
    limitUsage: {type: Boolean, required: true, default: false},
    usageLimit: {type: Number}, //bytes
    totalUsage: {type: Number}, //bytes
    limitExecutions: {type: Boolean, required: true, default: false},
    limitOfExecutions: {type: Number},
    numberOfExecutions: {type: Number},
    usageStatistics: {type: Object},
    cacheTime: {type: Number, required: true, default: 60},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    version: {type: Number, required: true, default: 1},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wst_Layers' });

LayersSchema.statics.setStatus = function(req,layerID,layerStatus, done){


        if (!layerID || typeof layerID == 'undefined') {
            done({result: 0, msg: "'id' and 'status' are required."});
            return;
        }
        this.findOne({"_id" : layerID,"companyID": req.user.companyID}, function (err, findLayer) {

                if (findLayer)
                {
                    Layers.update({
                        "_id" : layerID
                    }, {
                        $set: {
                            "status" : layerStatus
                        }
                    }, function (err, numAffected) {
                        if(err) throw err;

                        //Update reports status using this layer
                        if (layerStatus == 'Not active')
                            {
                            var actualReportStatus = 'Active';
                            var cascadeStatus = 'Layer not active';
                            }
                        if (layerStatus == 'Active')
                            {
                            var actualReportStatus = 'Layer not active';
                            var cascadeStatus = 'Active';
                            }
                        var Reports = connection.model('Reports');
                        var find = {'$and':[ { 'query.layers': [ layerID ] },{ status: actualReportStatus } ]}
                        Reports.setStatusCascade(req,find,cascadeStatus, function(){
                              done({result: 1, msg: "Status updated."});
                        });
                    });
                } else {
                    done({result: 0, msg: "No layer found for this company, can´t update the layer status"});
                }


        });


}


LayersSchema.statics.checkDelete = function(req,layerID,done){
    var data = req.query;

    if (!layerID) {
        done({result: 0, msg: "LayerID is required"});
        return;
    }

    Layers.findOne({companyID: req.user.companyID, _id: layerID, nd_trash_deleted: false}, {shared: 1, sharedWith: 1}, function(err, layer) {
        if (err) throw err;

        if (layer) {
            var Reports = connection.model('Reports');

            Reports.find({companyID: req.user.companyID, "query.layers": layerID, nd_trash_deleted: false}, {reportName: 1}, {}, function(err, reports) {
                if (err) throw err;

                var Dashboards = connection.model('Dashboards'), reportIDs = [];

                for (var i in reports) {
                    reportIDs.push(String(reports[i]._id));
                }

                Dashboards.find({companyID: req.user.companyID,"bands.blocks.id": {$in: reportIDs},"bands.blocks.type":'report', nd_trash_deleted: false}, {dashboardName: 1}, {}, function(err, dashboards) {
                    if (err) throw err;

                    done({result: 1, layer: layer, reports: reports, dashboards: dashboards});
                });
            });
        }
        else {
            done({result: 0, msg: "Layer not found"});
        }
    });
};


LayersSchema.statics.deleteLayer = function(req,layerID,done){
    var data = req.body;


    if (!layerID || !data.reports || !data.dashboards) {
        done({result: 0, msg: "layer, reports and dashboards is required"});
        return;
    }

    Layers.update({companyID: req.user.companyID, _id: layerID, nd_trash_deleted: false}, {$set: {
        nd_trash_deleted: true,
        nd_trash_deleted_date: new Date(),
        status: 'Deleted'
    }}, function(err) {
        if (err) throw err;

        var Reports = connection.model('Reports'), reportUpdate;

        for (var r in data.reports) {
            if (Number(data.reports[r].deleteAction) == 0) {
                reportUpdate = {status: 'Layer deleted'}
            }
            if (Number(data.reports[r].deleteAction) == 1) {
                reportUpdate = {
                    nd_trash_deleted: true,
                    nd_trash_deleted_date: new Date(),
                    status: 'Deleted'
                }
            }

            if (Number(data.reports[r].deleteAction) == 1 || Number(data.reports[r].deleteAction) == 0)
            {
                Reports.update({companyID: req.user.companyID, _id: data.reports[r]._id, nd_trash_deleted: false}, {$set: reportUpdate}, function(err) {
                    if (err) throw err;
                });
            }
        }

        var Dashboards = connection.model('Dashboards'), dashboardUpdate;

        for (var d in data.dashboards) {
            if (Number(data.dashboards[d].deleteAction) == 0) {
                dashboardUpdate = {status: 'Layer deleted'}
            }
            if (Number(data.dashboards[d].deleteAction) == 1) {
                dashboardUpdate = {
                    nd_trash_deleted: true,
                    nd_trash_deleted_date: new Date(),
                    status: 'Deleted'
                }
            }
            if (Number(data.dashboards[d].deleteAction) == 0 || Number(data.dashboards[d].deleteAction))
            {
                Dashboards.update({companyID: req.user.companyID, _id: data.dashboards[d]._id, nd_trash_deleted: false}, {$set: dashboardUpdate}, function(err) {
                    if (err) throw err;
                });
            }
          }


        done({result: 1, msg: "Layer deleted"});
    });
};



var Layers = connection.model('Layers', LayersSchema);
module.exports = Layers;
