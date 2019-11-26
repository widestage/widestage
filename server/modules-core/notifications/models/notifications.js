var mongoose = require('mongoose');

var notificationsSchema = new mongoose.Schema({
    user_id: {type: String, required: true},
    sender_id: {type: String},
    type: {type: Number}, // 1 - Text, 2 - Accept/Reject
    text: {type: String},
    url: {type: String},
    viewed: {type: Boolean, required: true, default: false},
    accepted: {type: Boolean},
    accept_url: {type: String},
    rejected: {type: Boolean},
    reject_url: {type: String},
    created: { type: Date, default: Date.now }
}, { collection: 'wice_Notifications' });


notificationsSchema.statics.sendNotification = function(userID, data, done) {
    sendNotification(userID, data, done);
}

global.registerDBModel('Notifications');
var Notifications = connection.model('Notifications', notificationsSchema);
module.exports = Notifications;


function sendNotification(userID, data, done){
    if (!data.text) {
        done({result: 0, msg: "'text' is required."});
        return;
    }

    var type = (data.type) ? data.type : 1;

    var notification = {
        user_id : userID,
        type : type,
        text : data.text,
        viewed : false
    };

    if (data.url) {
        notification.url = data.url;
    }

    if (data.accept_url)
    {
        notification.accepted = false;
        notification.accept_url = data.accept_url;
    }

    if (data.user) {
        var Users = connection.model(config.usersSchemaName), details = [];

        Users.findOne({_id: userID}, {name: 1,code: 1,email: 1, notifications: 1, devices: 1}, function(err, user) {
            if (err) throw err;

            if (user) {
                user = user.toObject();

                if (user.notifications && user.notifications.web) {
                    details.push({sentTo: userID, sentToName: user.name, by: 'web'});

                    Notifications.create(notification, function(err, notification){
                        if(err) throw err;
                    });
                }
                if (user.notifications && user.notifications.email && user.email) {
                    sendEmail(user.email, data.text, '<h2>'+data.text+'</h2>');

                    details.push({sentTo: userID, sentToName: user.name, by: 'email', email: user.email});
                }
                if (user.notifications && user.notifications.push && user.devices && user.devices.length > 0 && config.googleCloudMessagingKey) {
                    var gcm = require('node-gcm');

                    var message = new gcm.Message({
                        "notification" : {
                            "body" : data.text,
                            "title" : config.appName,
                            "icon" : "icon"
                        }
                    });

                    var sender = new gcm.Sender(config.googleCloudMessagingKey);

                    var registrationTokens = [];

                    for (var i in user.devices) {
                        registrationTokens.push(user.devices[i].pushID);
                    }

                    sender.send(message, { registrationIds: registrationTokens }, function (err, result) {
                        if(err) console.error(err);
                    });

                    details.push({sentTo: userID, sentToName: user.name, by: 'devices', deviceID: registrationTokens});
                }

                if (done) done({result: 1, msg: "Notification created", notification: notification, details: details});
            }
            else {
                if (done) done({result: 0, msg: "User not found"});
            }
        });
    } else {
        Notifications.create(notification, function(err, notification){
            if(err) throw err;

            if (done) done({result: 1, msg: "Notification created", notification: notification});
        });
    }
};

global.sendNotification = sendNotification;
