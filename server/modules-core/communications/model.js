var mongoose = require('mongoose');

var communicationsSchema = new mongoose.Schema({
    companyID: {type: String},
    type: {type: Number}, //1-NodeDream, 2-Custom
    language: {type: String},
    code: {type: String},
    name: {type: String},
    description: {type: String},
    subject: {type: String},
    body: {type: String},
    modules: {type: Array},
    translations: {type: Array},
    tags: {type: Array},
    created: {type: Date, default: Date.now},
    modified: {type: Date}
}, { collection: config.app.collectionsPrefix+'communications' });

// other virtual / static methods added to schema

communicationsSchema.statics.sendEmail = function(data,done) {
    var Communications = this, nodemailer = require("nodemailer");

    if (!data.email) {
        done({result: 0, msg: "'email' is required."});
        return;
    }

    var Configurations = connection.model('Configurations');

    Configurations.getConfiguration(['smtp-host', 'smtp-port', 'smtp-user', 'smtp-password', 'communications-from-name', 'communications-from-email'], function(configurations){
        var transportSMTP = nodemailer.createTransport("SMTP", {
            host: configurations['smtp-host'], // hostname
            secureConnection: false, // use SSL
            port: configurations['smtp-port'], // port for secure SMTP
            auth: {
                user: configurations['smtp-user'],
                pass: configurations['smtp-password']
            }
        });

        var find = (data.id) ? {_id: data.id} : {code: data.code};

        Communications.findOne(find,{},function(err, communication){
            if (!communication) {
                done({result: 0, msg: "Communication not found."});
            }
            else {
                var body = communication.body, subject = communication.subject;

                if (data.hasOwnProperty('language') && communication.translations) {
                    for (var i in communication.translations) {
                        if (data.language == communication.translations[i].language && communication.translations[i].translations.body && communication.translations[i].translations.subject) {
                            body = communication.translations[i].translations.body;
                            subject = communication.translations[i].translations.subject;
                            break;
                        }
                    }
                }

                //Replace tags
                if (data.hasOwnProperty('tags')) {
                    var tags = JSON.parse(data.tags);

                    for(var tag in tags){
                        body = body.replace('*|TAG:'+tag+'|*', tags[tag]);
                    }
                }

                var mailOptions = {
                    from: configurations['communications-from-name']+" <"+configurations['communications-from-email']+">", // sender address
                    to: data.email, // list of receivers
                    subject: subject, // Subject line
                    html: body // html body
                };

                transportSMTP.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);

                        done({result: 0, msg: error.data});
                    }else{

                        done({result: 1, msg: "Message sent"});
                    }

                    transportSMTP.close(); // shut down the connection pool, no more messages
                });
            }
        });
    });
};

communicationsSchema.statics.sendSMS = function(data,done) {
    var request = require('request');

    if (!data.id || !data.phone) {
        done({result: 0, msg: "'id' and 'phone' is required."});
        return;
    }

    this.findOne({"_id" : data.id},{},function(err, communication){
        if (!communication) {
            done({result: 0, msg: "Communication not found."});
        }
        else {
            var postData = {
                api_key: "9de3be6e",
                api_secret: "18666dbc",
                from: "Communications",
                to: data.phone,
                text: communication.subject
            };

            request.post('http://rest.nexmo.com/sms/json', {form: postData},
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {

                        done({result: 1, msg: body});
                    }
                    else {
                        console.log(error);

                        done({result: 0, msg: error});
                    }
                });
        }
    });
};

global.registerDBModel('Communications');
var Communications = connection.model('Communications', communicationsSchema);
module.exports = Communications;
