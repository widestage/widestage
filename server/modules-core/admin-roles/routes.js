module.exports = function (app) {
    var Roles = require('./controller.js');

    /* roles */
    app.get('/api/v3/admin/roles', isGranted('roles','see'), Roles.RolesFindAll);
    app.get('/api/v3/admin/roles/:id', isGranted('roles','see'), Roles.RolesFindOne);
    app.post('/api/v3/admin/roles', isGranted('roles','create'), Roles.RolesCreate);
    app.post('/api/v3/admin/roles/:id', isGranted('roles','update'), Roles.RolesUpdate);
    app.delete('/api/v3/admin/roles/:id', isGranted('roles','delete'), Roles.RolesDelete);
    app.get('/api/v3/roles/get-roles', restrict, Roles.GetRoles);
    app.get('/api/v3/roles', restrict, Roles.RolesActive);
};
