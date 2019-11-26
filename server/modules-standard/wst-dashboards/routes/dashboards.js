module.exports = function (app) {

var Dashboards = require('../controllers/dashboards.js');

app.get('/api/v3/dashboards', isGranted('Dashboards','see'), Dashboards.dashboardsFindAll);
app.get('/api/v3/dashboards/:dashboardID', isGranted('Dashboards','see'), Dashboards.dashboardsFindOne);
app.post('/api/v3/dashboards/:dashboardID', isGranted('Dashboards','update'), Dashboards.dashboardsUpdate);
app.post('/api/v3/dashboards', isGranted('Dashboards','create'), Dashboards.dashboardsCreate);
app.post('/api/v3/dashboards/:dashboardID/delete', isGranted('Dashboards','delete'), Dashboards.dashboardsDelete);
app.post('/api/v3/dashboards/publish/:dashboardID/:parentFolder', restrict, Dashboards.PublishDashboard);
app.post('/api/v3/dashboards/unpublish/:dashboardID', restrict, Dashboards.UnpublishDashboard);
//app.get('/api/v3/dashboards/view/:dashboardID', isGranted('Dashboards','see'), Dashboards.GetDashboard4View);

}
