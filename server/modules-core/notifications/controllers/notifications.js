var Notifications = connection.model('Notifications');

exports.notificationsGetDropdown = function(req,res){
    Notifications.find({"user_id": req.user._id},{}, {limit: 5, sort: {created: -1}}, function(err, notifications){
        if(err) throw err;

        Notifications.count({"user_id": req.user._id, "viewed": false}, function (err, unviewed) {
            serverResponse(req, res, 200, {result: 1, notifications: notifications, unviewed: unviewed});
        });
    });
};

exports.notificationsGetNotifications = function(req,res){
    req.query.user_id = req.user._id;

    var data = req.query;

    var perPage = 20, page = (data.page) ? page : 1;

    Notifications.find({"user_id": data.user_id},{}, {skip: (page-1)*perPage, limit: perPage, sort: {created: -1}}, function(err, notifications){
        if(err) throw err;

        Notifications.count({"user_id": data.user_id, "viewed": false}, function (err, unviewed) {
            serverResponse(req, res, 200, {result: 1, notifications: notifications, unviewed: unviewed});
        });
    });
};

exports.notificationsMarkAsViewed = function(req,res){
    Notifications.update({
        "user_id": req.user._id
    }, {
        $set: {
            "viewed" : true
        }
    }, {
        multi: true
    }, function (err) {
        if(err) throw err;

        serverResponse(req, res, 200, {result: 1});
    });
};

exports.notificationsSendNotification = function(req,res){
    req.body.sender_id = req.user._id;

    var data = req.body;

    if (!data.user_id || !data.type || !data.text) {
        serverResponse(req, res, 200, {result: 0, msg: "'user_id', 'type' and 'text' is required."});
        return;
    }
    var notification = {
        user_id : data.user_id,
        sender_id : data.sender_id,
        type : data.type,
        text : data.text,
        viewed : false
    };
    if (data.accept_url) {
        notification.accepted = false;
        notification.accept_url = data.accept_url;
    }

    Notifications.create(notification, function(err, notification){
        if(err) throw err;

        if (data.communication_id) {
            var Users = require('../models/users');

            Users.getUserEmail(data.user_id, function(result){
                var postData = {
                    id: data.communication_id,
                    companyID: req.user.companyID,
                };
                NodeDream.sendCommunication(result, postData);
            });
        }

        serverResponse(req, res, 200, {result: 1, msg: "Notification created", notification: notification.toObject()});
    });
};

exports.notificationsAcceptNotification = function(req,res){
    var data = req.body;

    if (!data._id) {
        serverResponse(req, res, 200, {result: 0, msg: "'_id' is required."});
        return;
    }

    Notifications.findOne({"_id" : data._id}, {}, function(err, notification) {
        if (err) throw err;

        if (!notification.accept_url || notification.accepted || notification.user_id != req.user._id) {
            serverResponse(req, res, 200, {result: 0, msg: "This notification can not be accepted."});
        }
        else {
            Notifications.update({
                "_id" : data.id
            }, {
                $set: {
                    "accepted" : true
                }
            }, function (err) {
                if(err) throw err;

                serverResponse(req, res, 200, {result: 1, msg: "Notification accepted."});
            });
        }
    });
};

