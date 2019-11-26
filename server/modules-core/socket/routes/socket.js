module.exports = function (app) {
    var socket = require('../controllers/socket.js')(app);

    /* SOCKET.IO */
    // app.get('/api/notifications/get-dropdown', restrict, notifications.notificationsGetDropdown);
};