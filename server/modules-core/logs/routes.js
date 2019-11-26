module.exports = function (app) {
    var Logs = require('./controller.js');
    app.get('/api/v3/admin/logs', isGranted('logs','see'), Logs.logsFindAll);
};
