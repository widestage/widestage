module.exports = function (app) {

var Reports = require('../controllers/reports.js');

app.get('/api/v3/reports', isGranted('Reports','see'), Reports.reportsFindAll);
app.get('/api/v3/reports/:reportID', isGranted('Reports','see'), Reports.reportsFindOne);
app.post('/api/v3/reports/:reportID', isGranted('Reports','update'), Reports.reportsUpdate);
app.post('/api/v3/reports', isGranted('Reports','create'), Reports.reportsCreate);
app.post('/api/v3/reports/:reportID/delete', isGranted('Reports','delete'), Reports.reportsDelete);
app.get('/api/v3/reports/view/:reportID', isGranted('Reports','see'), Reports.GetReport4View);
app.post('/api/v3/reports/publish/:reportID/:parentFolder', restrict, Reports.PublishReport);
app.post('/api/v3/reports/unpublish/:reportID', restrict, Reports.UnpublishReport);
app.post('/api/v3/reports/:reportID/status', isGranted('Layers','update'), Reports.changeReportStatus);
}
