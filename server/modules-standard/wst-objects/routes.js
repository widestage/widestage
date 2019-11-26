module.exports = function (app) {
    var wstObjects = require('./controller.js');
    app.get('/api/get-my-objects',restrict, wstObjects.getMyObjects);
    app.get('/api/get-my-last-executions',restrict, wstObjects.getMyLastExecutions);
    app.get('/api/get-my-other-data',restrict,wstObjects.getMyOtherData);

    app.get('/api/get-my-counts',restrict, wstObjects.getMyCounts);

    /* for admin */

    app.get('/api/admin/users/get-user-counts/:id',restrictRole(['WSTADMIN']), wstObjects.getUserCounts);
    app.get('/api/admin/users/get-user-reports/:id',restrictRole(['WSTADMIN']), wstObjects.getUserReports);
    app.get('/api/admin/users/get-user-dashboards/:id',restrictRole(['WSTADMIN']), wstObjects.getUserDashboards);

};
