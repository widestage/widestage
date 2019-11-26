var mongoose = require('mongoose');

var emailTemplatesSchema = new mongoose.Schema({
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
}, { collection: 'wice_Email_Templates' });


emailTemplatesSchema.statics.buildEmailUsingTemplate = function(emailTemplateCode,language,tags,done) {
        buildEmailUsingTemplate(emailTemplateCode,language,tags,done);
}

var EmailTemplates = connection.model('EmailTemplates', emailTemplatesSchema);
module.exports = EmailTemplates;


module.exports = function (app) {

    console.log('Module mailer loaded');
    addModulesUsedList('mailer');


global.mailerModule = true;

function sendEmail(emailSubject, emailMessage, emailTo) {

    var nodemailer = require("nodemailer");


    if (config.mailer.service != 'SMTP')
    {
        var transport = nodemailer.createTransport({
            service: config.mailer.service,
            auth: {
                user: config.mailer.auth.user,
                pass: config.mailer.auth.pass
            }
        });
    } else {
        var transport = nodemailer.createTransport({
            host: config.mailer.host, // hostname
            secureConnection: config.mailer.secureConnection, // use SSL
            port: config.mailer.port, // port for secure SMTP
            auth: {
                user: config.mailer.auth.user,
                pass: config.mailer.auth.pass
            }
        });
    }



    var mailOptions = {
        from: config.mailer.from, // sender address
        to: emailTo, // list of receivers
        subject: emailSubject, // Subject line
        html: emailMessage // html body
    };

    transport.sendMail(mailOptions, function(error, response){
        if(error){
            saveToLog(undefined, 'Error trying to send mail: '+error.message,'FUNCTIONAL','ERROR','send mail', '001','MAILER','SUPERADMIN',{},'','');
            console.log('Error trying to send mail: '+error.message,' from ',config.mailer.from,' to ',emailTo);
        }else{
            console.log('mail sent from',config.mailer.from,' to ',emailTo);
        }

    transport.close(); // shut down the connection pool, no more messages

    });


}
global.sendEmail = sendEmail;



/*

function sendEmailTemplate(theEmailTemplate,recipients,emailField,subject)
{
    var path = require('path')
    var EmailTemplate = require('email-templates');
    var nodemailer = require('nodemailer')
    var wellknown = require('nodemailer-wellknown')
    var async = require('async')


    var template = new EmailTemplate({
        views: {
                options: {
                    extension: 'ejs' // <---- HERE
                }
             }
        });

    if (config.mailer.service != 'SMTP')
    {
        var transport = nodemailer.createTransport({
            service: config.mailer.service,
            auth: {
                user: config.mailer.auth.user,
                pass: config.mailer.auth.pass
            }
        });
    } else {
        var transport = nodemailer.createTransport({
            host: config.mailer.host, // hostname
            secureConnection: config.mailer.secureConnection, // use SSL
            port: config.mailer.port, // port for secure SMTP
            auth: {
                user: config.mailer.auth.user,
                pass: config.mailer.auth.pass
            }
        });
    }

// Send 10 mails at once
async.mapLimit(recipients, 10, function (item, next) {
    if (!item.firstName)
        item.firstName = ' ';
    if (!item.lastName)
        item.lastName = ' ';

        item.appName = config.appName;

    template.renderAll(theEmailTemplate,item)
    .then(function(result){
                transport.sendMail({
                    from: config.mailer.from,
                    to: item[emailField],
                    subject: subject,
                    html: result.html,
                    text: result.text
                }, function (err, responseStatus) {
                    if (err) {
                        return next(err)
                    }
                    next(null, responseStatus.message)
                })
    }
        )
    .catch(function (error) {
            next(error)
    }
        );

}, function (err) {
    if (err) {
        console.error(err)
    }

})

}

*/
function sendEmailTemplate(companyID,emailTemplateCode,language,tags,emailTo,done)
{
    buildEmailUsingTemplate(companyID,emailTemplateCode,language,tags,function(result){
        if (result.result == 1)
        {
            sendEmail(result.subject, result.body, emailTo);
            done({result:1,msg:'email sent'});
        } else {
            done(result);
        }
    });
}
global.sendEmailTemplate = sendEmailTemplate;

}


function buildEmailUsingTemplate(companyID,emailTemplateCode,language,tags,done)
{
        var find = {code: emailTemplateCode,companyID:companyID};

        EmailTemplates.findOne(find,{},function(err, emailTemplate){
            if (!emailTemplate) {
                done({result: 0, msg: "Email template not found."});
            }
            else {
                var body = emailTemplate.body, subject = emailTemplate.subject;

                if (language && emailTemplate.translations) {
                    for (var i in emailTemplate.translations) {
                        if (language == emailTemplate.translations[i].language && emailTemplate.translations[i].translations.body && emailTemplate.translations[i].translations.subject) {
                            body = emailTemplate.translations[i].translations.body;
                            subject = emailTemplate.translations[i].translations.subject;
                            break;
                        }
                    }
                }

                //Replace tags
                if (tags) {
                    var theTags = tags;

                    for(var tag in theTags){
                        body = replaceAll(body, '*|TAG:'+theTags[tag].name+'|*', theTags[tag].value)
                    }
                }

                done({result: 1, subject: subject, body:body});
            }
        });

};
