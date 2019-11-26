module.exports = function (app) {
    var wstAdminUsers = require('./controller.js');


    app.get('/api/admin/v3/users/get-user-counts/:id',restrictRole(['WSTADMIN']), wstAdminUsers.getUserCounts);
    app.get('/api/admin/v3/users/get-user-reports/:id',restrictRole(['WSTADMIN']), wstAdminUsers.getUserReports);
    app.get('/api/admin/v3/users/get-user-dashboards/:id',restrictRole(['WSTADMIN']), wstAdminUsers.getUserDashboards);

};
