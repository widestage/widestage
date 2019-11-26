module.exports = function (app) {
    var Connections = require('../controllers/connections.js');

    /* connections */
    app.get('/api/v3/admin/connections', isGranted('Connections','see'), Connections.ConnectionsFindAll);
    app.post('/api/v3/admin/connections', isGranted('Connections','see'), Connections.ConnectionsCreate);
    app.get('/api/v3/admin/connections/:connectionID', isGranted('Connections','see'), Connections.ConnectionsFindOne);
    app.post('/api/v3/admin/connections/:connectionID', isGranted('Connections','see'), Connections.ConnectionsUpdate);
    app.post('/api/v3/admin/connections/:connectionID/delete', isGranted('Connections','see'), Connections.ConnectionsDelete);
    app.get('/api/v3/admin/connections/:connectionID/schema', isGranted('Connections','see'), Connections.getSchemas);
    app.get('/api/v3/admin/connections/:connectionID/schema/:schemaID/entities', isGranted('Connections','see'), Connections.getEntitiesForSchema);
    app.get('/api/v3/admin/connections/:connectionID/schema/:schemaID/entities/:entityID/attributes', isGranted('Connections','see'), Connections.getEntityFields);
    app.get('/api/v3/admin/connections/:connectionID/query/schema', isGranted('Connections','see'), Connections.getsqlQuerySchema);

}
