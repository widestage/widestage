var mongoose = require('mongoose');

var DashboardsSchema = new mongoose.Schema({
    companyID: {type: String , required: true},
    dashboardName: {type: String, required: true},
    dashboardDescription: {type: String},
    dashboardType: {type: String},
    html: {type: String},
    reports: [],
    bands: [],
    items: [],
    backgroundColor: {type: String},
    backgroundImage: {type: String},
    properties: {type: Object},
    history: [],
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    owner: {type: String},
    parentFolder: {type: String},
    isPublic:{type: Boolean},
    sharedLink: {type: Boolean, required: true, default: false},
    sharedLinkOption: {type: String},
    sharedWithUsers: {type: Array},
    sharedWithRoles: {type: Array},
    status: {type: String, required: true, default: 'active'}, //1-Active, 0-Disabled
    limitUsage: {type: Boolean, required: true, default: false},
    usageLimit: {type: Number}, //bytes
    totalUsage: {type: Number}, //bytes
    limitExecutions: {type: Boolean, required: true, default: false},
    limitOfExecutions: {type: Number},
    numberOfExecutions: {type: Number},
    usageStatistics: {type: Object},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wst_Dashboards' });

DashboardsSchema.statics.checkQuotas = function(dashboardID, done) {
    var Dashboards = this;

    Dashboards.findOne({_id: dashboardID}, {limitUsage: 1, usageLimit: 1, totalUsage: 1, limitExecutions: 1, limitOfExecutions: 1, numberOfExecutions: 1}, function(err, dashboard) {
        if (err) throw err;

        if (dashboard) {
            if (dashboard.limitUsage && (dashboard.totalUsage >= dashboard.usageLimit)) {
                done({result: 0, msg: "Dashboard usage limit reached."});
                return;
            }

            if (dashboard.limitExecutions && (dashboard.numberOfExecutions >= dashboard.limitOfExecutions)) {
                done({result: 0, msg: "Dashboard executions limit reached."});
                return;
            }

            done({result: 1});
        }
        else {
            done({result: 0, msg: "Dashboard not found."});
        }
    });
};

DashboardsSchema.statics.saveQuotas = function(dashboardID, size, done) {
    var Dashboards = this;
    var d = new Date(), month = d.getMonth()+1, year = d.getFullYear();

    Dashboards.findOne({_id: dashboardID}, {totalUsage: 1, numberOfExecutions: 1, usageStatistics: 1}, function(err, dashboard) {
        if (err) throw err;

        if (dashboard) {
            dashboard = dashboard.toObject();

            dashboard.totalUsage = (dashboard.totalUsage) ? dashboard.totalUsage+size : size;
            dashboard.numberOfExecutions = (dashboard.numberOfExecutions) ? dashboard.numberOfExecutions+1 : 1;

            if (!dashboard.usageStatistics) dashboard.usageStatistics = {};
            if (!dashboard.usageStatistics[year]) dashboard.usageStatistics[year] = {};
            if (!dashboard.usageStatistics[year][month]) dashboard.usageStatistics[year][month] = {};

            dashboard.usageStatistics[year][month].totalUsage = (dashboard.usageStatistics[year][month].totalUsage) ? dashboard.usageStatistics[year][month].totalUsage+size : size;
            dashboard.usageStatistics[year][month].numberOfExecutions = (dashboard.usageStatistics[year][month].numberOfExecutions) ? dashboard.usageStatistics[year][month].numberOfExecutions+1 : 1;

            delete(dashboard._id);

            Dashboards.update({_id: dashboardID}, {$set: dashboard}, function(err) {
                if (err) throw err;

                if (done) done(true);
            });
        }
        else {
            if (done) done(false);
        }
    });
};

var Dashboards = connection.model('Dashboards', DashboardsSchema);
module.exports = Dashboards;
