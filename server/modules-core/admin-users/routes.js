
module.exports = function (app) {
    var users = require('./controller.js');
    //app.get('/api/admin/users/find-all', restrictRole(['SUPERADMIN']), users.UsersFindAll);

    app.get('/api/v3/admin/users', isGranted('users','see'), users.UsersFindAll);
    app.get('/api/v3/admin/users/:id', isGranted('users','see'), users.UsersFindOne);
    app.post('/api/v3/admin/users', isGranted('users','create'), users.UsersCreate);
    app.post('/api/v3/admin/users/:id', isGranted('users','update'), users.UsersUpdate);
    //app.post('/api/admin/users/delete/:id', restrictRole(['SUPERADMIN']), users.UsersDelete);
    app.post('/api/v3/admin/users/:id/change-user-status', isGranted('users','update'), users.changeUserStatus);

    //app.get('/api/set-viewed-context-help',restrict,users.setViewedContextHelp);

    app.post('/api/users/set-user-settings', users.setUserSettings);
    app.get('/api/v3/users', restrict, users.UsersActive);

}
