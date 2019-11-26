module.exports = function (app) {
    var notifications = require('../controllers/notifications.js');

    /* NOTIFICATIONS */
    app.get('/api/notifications/get-dropdown', restrict, notifications.notificationsGetDropdown);
    app.get('/api/notifications/get-notifications', restrict, notifications.notificationsGetNotifications);
    app.post('/api/notifications/mark-as-viewed', restrict, notifications.notificationsMarkAsViewed);
    app.post('/api/notifications/send-notification', restrict, notifications.notificationsSendNotification);
    app.post('/api/notifications/accept-notification', restrict, notifications.notificationsAcceptNotification);
};