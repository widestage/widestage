
module.exports = function (app) {
    var permissions = require('./controller.js');
    app.get('/api/v3/objects', restrict, permissions.getObjects);
    app.get('/api/v3/objects/:module', restrict, permissions.getObject);
    app.get('/api/v3/permissions', restrict, permissions.getAppPermissions);
    app.get('/api/v3/permissions/roles/:roleID', restrict, permissions.getPermissionsForRole);
    app.get('/api/v3/permissions/:module/:objectID', restrict, permissions.getPermissionsForModuleObject);
    app.post('/api/v3/permissions/:module', restrict, permissions.savePermissionsForModule);
    app.post('/api/v3/permissions/roles/:module/:permission/:role/:objectID', restrict, permissions.saveObjectPermissionForRole);
    app.post('/api/v3/permissions/users/:module/:permission/:user/:objectID', restrict, permissions.saveObjectPermissionForUser);
    app.post('/api/v3/permissions/roles/:module/:permission/:role', restrict, permissions.savePermissionForRole);
    app.post('/api/v3/permissions/users/:module/:permission/:user', restrict, permissions.savePermissionForUser);
}
