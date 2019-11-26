var Communications = connection.model('Communications');

require(appRoot+'/server/modules/core/controller.js');

function CommunicationsController(model) {
    this.model = model;
    this.searchFields = ['name'];
}

CommunicationsController.inherits(Controller);

var controller = new CommunicationsController(Communications);

exports.CommunicationsFindAll = function(req,res){
    req.query.companyid = true;

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
};
exports.getCommunications = function(req,res) {
    req.query.fields = ['code', 'name', 'description', 'translations'];
    req.query.find = [
        {type: 2},
        {companyID: null},
        {modules: {$in: (req.user.company.modules) ? req.user.company.modules : []}}
    ];

    controller.findAll(req, function(result){
        if (result.result == 1) {
            var userLanguage = req.user.language;

            for (var i in result.items) {
                result.items[i] = result.items[i].toObject();

                if (result.items[i].translations) {
                    for (var t in result.items[i].translations) {
                        if (result.items[i].translations[t].language == userLanguage) {
                            if (result.items[i].translations[t].translations.name) result.items[i].name = result.items[i].translations[t].translations.name;
                            if (result.items[i].translations[t].translations.description) result.items[i].description = result.items[i].translations[t].translations.description;
                            if (result.items[i].translations[t].translations.subject) result.items[i].subject = result.items[i].translations[t].translations.subject;
                            if (result.items[i].translations[t].translations.body) result.items[i].body = result.items[i].translations[t].translations.body;
                            break;
                        }
                    }
                }
            }
        }

        serverResponse(req, res, 200, result);
    });
};
exports.CommunicationsFindOne = function(req,res){
    req.query.companyid = true;

    var Languages = connection.model('Languages');

    controller.findOne(req, function(result){
        var communicationTranslations = [], communication = result.item;

        Languages.find({language: {$ne: 'base'}},{language:1, description:1},{}, function(err, languages) {
            if (err) throw err;

            for (var l in languages) {
                var translations = {name: '', description: '', subject: '', body: ''};

                if (communication.translations) {
                    for (var t in communication.translations) {
                        if (communication.translations[t].language == languages[l].language) {
                            translations = communication.translations[t].translations;
                            break;
                        }
                    }
                }

                communicationTranslations.push({language: languages[l].language, description: languages[l].description, translations: translations});
            }

            communication['translations'] = communicationTranslations;

            serverResponse(req, res, 200, {result: 1, item: communication});
        });
    });
};
exports.getCommunication = function(req,res) {
    var data = req.query;

    Communications.findOne({companyID: req.user.companyID, code: data.code}, {}, function(err, communication) {
        if (err) throw err;

        if (communication) {
            serverResponse(req, res, 200, {result: 1, item: communication});
        }
        else {
            Communications.findOne({companyID: null, code: data.code}, {}, function(err, communication) {
                if (err) throw err;

                if (communication) {
                    communication = communication.toObject();

                    var userLanguage = req.user.language;

                    if (communication.translations) {
                        for (var t in communication.translations) {
                            if (communication.translations[t].language == userLanguage) {
                                if (communication.translations[t].translations.name) communication.name = communication.translations[t].translations.name;
                                if (communication.translations[t].translations.description) communication.description = communication.translations[t].translations.description;
                                if (communication.translations[t].translations.subject) communication.subject = communication.translations[t].translations.subject;
                                if (communication.translations[t].translations.body) communication.body = communication.translations[t].translations.body;
                                break;
                            }
                        }
                    }

                    serverResponse(req, res, 200, {result: 1, item: communication});
                }
                else {
                    serverResponse(req, res, 200, {result: 0, msg: "Communication not found"});
                }
            });
        }
    });
};
exports.CommunicationsUpdate = function(req,res){
    var data = req.body;

    if (typeof data.name == 'undefined' ) {
        serverResponse(req, res, 200, {result: 0, msg: "'name' is required"});
        return;
    }
    req.query.companyid = true;

    controller.update(req, function(result){
        serverResponse(req, res, 200, result);
    });
};
exports.updateCommunication = function(req,res){
    var data = req.body;

    req.query.companyid = true;

    Communications.findOne({companyID: req.user.companyID, code: data.code}, {}, function(err, communication) {
        if (err) throw err;

        if (communication) {
            req.body._id = communication._id;

            controller.update(req, function(result){
                serverResponse(req, res, 200, result);
            });
        }
        else {
            delete(req.body._id);

            req.body.companyID = req.user.companyID;

            controller.create(req, function(result){
                serverResponse(req, res, 200, result);
            });
        }
    });
};

exports.adminCommunicationsFindAll = function(req,res){
    req.query.find = [{companyID: null}];

    controller.findAll(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminCommunicationsFindOne = function(req,res){
    var Languages = connection.model('Languages');

    controller.findOne(req, function(result){
        var communicationTranslations = [], communication = result.item;

        if (!communication['tags']) communication['tags'] = [];

        Languages.find({language: {$ne: 'base'}},{language:1, description:1},{}, function(err, languages) {
            if (err) throw err;

            for (var l in languages) {
                var translations = {subject: '', body: ''};

                if (communication.translations) {
                    for (var t in communication.translations) {
                        if (communication.translations[t].language == languages[l].language) {
                            translations = communication.translations[t].translations;
                            break;
                        }
                    }
                }

                communicationTranslations.push({language: languages[l].language, description: languages[l].description, translations: translations});
            }

            communication['translations'] = communicationTranslations;

            serverResponse(req, res, 200, {result: 1, item: communication});
        });
    });
};

exports.adminCommunicationsCreate = function(req,res){
    var data = req.body;

    if (!data.code || !data.name || !data.subject || !data.body) {
        serverResponse(req, res, 200, {result: 0, msg: "'code', 'name', 'subject' and 'body' is required."});
        return;
    }

    controller.create(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminCommunicationsUpdate = function(req,res){
    var data = req.body;

    if (!data.id || !data.code || !data.name || !data.subject || !data.body) {
        serverResponse(req, res, 200, {result: 0, msg: "'id', 'code', 'name', 'subject' and 'body' is required."});
        return;
    }

    controller.update(req, function(result){
        Communications.update({
            "code" : data.code
        }, {
            $set: {
                "tags" : data.tags
            }
        }, function (err) {
            if(err) throw err;

            serverResponse(req, res, 200, result);
        });
    });
};

exports.adminCommunicationsDelete = function(req,res){
    controller.remove(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.adminCommunicationsGenerateForCompanies = function(req, res) {
    var communicationsToCreate = [], Companies = connection.model('Companies');

    Communications.find({companyID: null, type: 2},{},{}, function(err, communications) {
        if (err) throw err;

        Communications.find({companyID: {$ne: null}, type: 2},{companyID: 1, code: 1},{}, function(err, companiesCommunications) {
            if (err) throw err;

            Companies.find({companyCode: {$ne: null}},{companyCode: 1},{}, function(err, companies) {
                if (err) throw err;

                for (var i in companies) {
                    for (var c in communications) {
                        var found = false;

                        for (var cc in companiesCommunications) {
                            if (companiesCommunications[cc].code == communications[c].code && companiesCommunications[cc].companyID == companies[i].companyCode) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            communicationsToCreate.push({communication: communications[c], companyID: companies[i].companyCode});
                        }
                    }
                }

                for (var i in communicationsToCreate) {
                    var thisCommunication = communicationsToCreate[i].communication.toObject();

                    delete(thisCommunication._id);

                    thisCommunication['companyID'] = communicationsToCreate[i].companyID;

                    Communications.create(thisCommunication, function(err){
                        if(err) throw err;
                    });
                }

                serverResponse(req, res, 200, {result: 1, msg: 'Generation Completed'});
            });
        });
    });
};

exports.sendCommunication = function(emailsTo, params, done){
    sendCommunication(emailsTo, params, done);
};

function sendCommunication(emailsTo, params, done) {
    var find = (params.id) ? {_id: params.id} : {code: params.code};

    if (params.companyID) find['companyID'] = params.companyID;

    Communications.findOne(find, {}, function(err, communication){
        if (err) throw err;

        if (!communication) {
            find['companyID'] = null;

            Communications.findOne(find, {}, function(err, communication){
                if (!communication) {
                    if (done) done({result: 0, msg: "Communication not found."});
                }
                else {
                    var body = communication.body, subject = communication.subject;

                    if (params.language && communication.translations) {
                        for (var i in communication.translations) {
                            if (params.language == communication.translations[i].language && communication.translations[i].translations.body && communication.translations[i].translations.subject) {
                                body = communication.translations[i].translations.body;
                                subject = communication.translations[i].translations.subject;
                                break;
                            }
                        }
                    }

                    //Replace tags
                    if (params.hasOwnProperty('tags')) {
                        for(var tag in params.tags){
                            body = body.replace('*|TAG:'+tag+'|*', params.tags[tag]);
                        }
                    }

                    sendEmail(emailsTo, subject, body, done);
                }
            });
        } else {
            var body = communication.body, subject = communication.subject;

            if (params.language && communication.translations) {
                for (var i in communication.translations) {
                    if (params.language == communication.translations[i].language && communication.translations[i].translations.body && communication.translations[i].translations.subject) {
                        body = communication.translations[i].translations.body;
                        subject = communication.translations[i].translations.subject;
                        break;
                    }
                }
            }

            //Replace tags
            if (params.hasOwnProperty('tags')) {
                for(var tag in params.tags){
                    body = body.replace('*|TAG:'+tag+'|*', params.tags[tag]);
                }
            }

            sendEmail(emailsTo, subject, body, done);
        }
    });
}

exports.sendEmail = function(emailsTo, subject, body, done){
    sendEmail(emailsTo, subject, body, done);
};

function sendEmail(emailsTo, subject, body, done) {
    var fs = require('fs');

    if (!emailsTo) {
        if (done) done({result: 0, msg: 'emailsTo is required'});
        return;
    }

    if (typeof emailsTo == 'string') emailsTo = [emailsTo];

    var recipients = [];

    for (var i in emailsTo) {
        recipients.push({address: emailsTo[i]});
    }

    var SparkPost = require('sparkpost');
    var sp = new SparkPost(config.communications.apiKey);

    fs.readFile(appRoot+'server/templates/email/basic.html', 'utf8', function(err, html) {
        if(err) throw err;

        html = String(html).replace('*|HEADER|*', config.communications.fromName);
        html = String(html).replace('*|CONTENT|*', body);
        html = String(html).replace('*|COMPANY|*', config.communications.fromName);
        html = String(html).replace('*|CURRENT_YEAR|*', new Date().getFullYear());

        sp.transmissions.send({
            transmissionBody: {
                content: {
                    from: {name: config.communications.fromName, email: config.communications.fromEmail},
                    subject: subject,
                    html: html
                },
                recipients: recipients
            }
        }, function(err, res) {
            if (err) {
                console.log(err);
                if (done) done({result: 0, msg: err});
            } else {
                if (done) done({result: 1, msg: "Message sent"});
            }
        });
    });

}

function getEmailsConfiguration(done) {
    var Configurations = connection.model('Configurations');

    var configurations = [
        'smtp-host',
        'smtp-port',
        'smtp-user',
        'smtp-password',
        'communications-from-name',
        'communications-from-email'
    ];

    Configurations.getConfiguration(configurations, function(configurations){
        done(configurations);
    });
}
