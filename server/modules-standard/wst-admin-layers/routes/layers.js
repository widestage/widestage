module.exports = function (app) {
/*
    var Connections = require('../controllers/connections.js');
    app.get('/api/v3/admin/connections', isGranted('Connections','see'), Connections.ConnectionsFindAll);
    app.post('/api/v3/admin/connections', isGranted('Connections','see'), Connections.ConnectionsCreate);
    app.get('/api/v3/admin/connections/:connectionID', isGranted('Connections','see'), Connections.ConnectionsFindOne);
    app.post('/api/v3/admin/connections/:connectionID', isGranted('Connections','see'), Connections.ConnectionsUpdate);
    app.post('/api/v3/admin/connections/:connectionID/delete', isGranted('Connections','see'), Connections.ConnectionsDelete);
*/

var Layers = require('../controllers/layers.js');

app.get('/api/v3/layers',restrict, Layers.LayersFindAll4Users);
app.get('/api/v3/layers/:layerID', restrict, Layers.LayersFindOne);
app.get('/api/v3/admin/layers', isGranted('Layers','see'), Layers.LayersFindAll);
app.get('/api/v3/admin/layers/:layerID', isGranted('Layers','see'), Layers.LayersFindOne);
app.post('/api/v3/admin/layers/:layerID', isGranted('Layers','update'), Layers.LayersUpdate);
app.post('/api/v3/admin/layers', isGranted('Layers','create'), Layers.LayersCreate);
app.post('/api/v3/admin/layers/:layerID/status', isGranted('Layers','update'), Layers.changeLayerStatus);
app.get('/api/v3/admin/layers/:layerID/check', isGranted('Layers','see'), Layers.checkforDelete);
app.post('/api/v3/admin/layers/:layerID/delete', isGranted('Layers','delete'), Layers.deleteLayer);

}
