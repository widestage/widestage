module.exports = function (app) {
    var Drivers = require('../controllers/connection-drivers.js');

    /* Drivers */
    app.get('/api/v3/admin/connections-drivers', isGranted('Connections','see'), Drivers.GetConnectionTypes);
    app.get('/api/v3/admin/connection/test', isGranted('Connections','see'), Drivers.testConnection);
    app.get('/api/v3/admin/connection/get-data-types/:driver', restrict, Drivers.getDataTypes);
    //app.post('/api/v3/connection/get-data',restrict, Drivers.getData); 
    app.post('/api/v3/connection/get-data-as-file', restrict, Drivers.getDataAsAFile);
    app.post('/api/v3/connection/:connectionID/query', restrict, Drivers.executeQuery);
    app.post('/api/v3/connection/get-data', Drivers.getData);


}
