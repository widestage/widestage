/*
module.exports = function (app) {

this.app = app;
}
*/

exports.init = function(app, done)
{
    var fs = require('fs');
        console.log(__dirname+'/../data/'+global.env+'/wiceServerConfig.yml');
        if (fs.existsSync(__dirname+'/../data/'+global.env+'/wiceServerConfig.yml')) {
            console.log('Applying stored server configuration...');
            loadServerConfig(function(theConfig){
                global.config = theConfig;
                require(__dirname+'/../startup.js')(global.app,false);
                done(true);
            });

        } else {
            console.log('There is no configuration, the server must be configured first...');
            app.get('/', function(req, res) {
                res.render('serverConfig');
            });
            app.post('/server-config', this.serverConfig);
            app.post('/restartServer', function (req, res, next) {
               //process.exit(1);
               //This doesn´t work as expected...
               /*for (var id in global.cluster.workers) {
                      global.cluster.workers[id].kill();
                    }
                    // exit the master process
                    process.exit(0);*/
            });

            global.config = {};
            done(false);
        }
}

exports.loadServerConfig = function(done)
{
    loadServerConfig(done);
}

function loadServerConfig(done)
{

     const yaml = require('js-yaml');
     const fs = require('fs');
     const path = require('path');
     var thepath = path.resolve(__dirname+'/../data/'+global.env+'/wiceServerConfig.yml');
        try {
            var theConfig = yaml.safeLoad(fs.readFileSync(thepath))
                //default users collection
                if (!theConfig.usersSchemaName)
                    theConfig.usersSchemaName = 'Users';
                done(theConfig);
        } catch (e) {
            console.log("can't load configuration " + e );
            done(e);
        }
}

exports.serverConfig = function(req,res)
{
        var configData = req.body;
        configData.multipleSubdomains = false;
        configData.nedb_path = '/data';
        if (configData.db_type === 'mongoDB' && configData.mongoServer && configData.mongoDatabase && configData.mongoPort)
            configData.db = 'mongodb://'+configData.mongoServer+':'+configData.mongoPort+'/'+configData.mongoDatabase+'';
        configData.crypto = {
            enabled: false,
            secret: 'SecretPassphrase'
            };
        configData.mailer = {
            service: configData.mailerService, //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: configData.mailerhost, // hostname
            secureConnection: configData.mailersecureConnection, // use SSL true or false
            port: configData.mailerport, // port for secure SMTP
            auth: {
                user: configData.maileruser,
                pass: configData.mailerpass
            },
            from: configData.mailerfrom
            };
        configData.amazon = { //S3 storage for file upload
            clientID: configData.amazonclientID,
            clientSecret: configData.amazonclientSecret,
            region: configData.amazonregion,
            bucket: configData.amazonbucket,
            folder: configData.amazonfolder
            };
        configData.google = { //google authentication if enabled
            clientID: configData.googleclientID,
            clientSecret: configData.googleclientSecret
            };
        configData.pagination = {
            itemsPerPage: 10
            };
        configData.query = {
            defaultRecordsPerPage: 500
            };
        configData.appName = "WideStage";
        configData.appDescription = "Business Intelligence suite";
        configData.appURL = "http://widestage.com";
        configData.supportURL = "http://support.widestage.com";
        configData.appSlogan = "The light weight and powerful Business Intelligence suite";
        configData.sessionSecret = "this is the session secret";
        configData.authentication = true;
        configData.localAuth = true;
        configData.enableGoogleAuth = false;
        configData.microsoftAuth = false;
        configData.facebookAuth = false;
        configData.githubAuth = false;
        configData.slackAuth = false;
        configData.ldapAuth = false;
        configData.azureAuth = false;
        configData.usersSchemaName = "users";
        configData.trackMissingTranslations = false;
        configData.multipleSubdomains = false;
        configData.theme = "xwst";
        configData.nedb_path = "/data";

    if (configData.db_type)
    {
        const fs   = require('fs');
        const path = require('path');
        var mkdirp = require('mkdirp');
        var thepath = path.resolve(__dirname+'/../data/'+global.env);
        console.log("the path to be saved is " + thepath);
        global.config = configData;
        console.log("my configuration is : " + configData);
        console.log("the global configuration is : " + global.config);
        if (!fs.existsSync(thepath)){
            mkdirp(thepath);
        }
        fs.writeFile(thepath+'/wiceServerConfig.yml',JSON.stringify(configData) , function(){
          loadServerConfig(function(){
            var mongoose = require('mongoose');
            require('../core/mongoose')(mongoose);

            initializeEmailTemplates(function(){
              initializeAdminUser(configData, function(){
                  res.send(200, {result:1,msg:'Server configuration saved successfully'});
                  //require(__dirname+'/../startup.js')(global.app,true);
              });
            });
          })

        });
    }
}

//we are going to try a different thing here...
function initializeAdminUser(configData, done)
{
    //This is to connect to the database first
    var mongoose = require('mongoose');
    require('../core/mongoose')(mongoose);

    //Now we need to load the models for users and companies
    require('../core/companies/model.js');
    require('../core/auth-users/model.js');

    //lets try again...
        console.log("loading models ...");
     //   var Users = connection.model('Users');
        var Companies = connection.model('Companies');
        console.log('initializeAdminUser');
        //First time login

                console.log('no records in the users model, this is the initial setup!');
                var theCompany = {};
                theCompany._id = mongoose.Types.ObjectId('5355504552555345522d2d2d');
                theCompany.createdBy = 'wice setup';
                theCompany.companyName = 'default';
                theCompany.companyURL = 'default';
                theCompany.status = 1;
                theCompany.nd_trash_deleted = false;
                Companies.create(theCompany,function(err,company){
                    if (err) {
                        console.log(err.msg);
                        throw err
                    }
                    console.log('Company created successfully');
                    if (company)
                    {
                        var adminUser = {};
                        adminUser._id = mongoose.Types.ObjectId('5355504552555345522d2d2d');
                        adminUser.userName = configData.userName;
                        adminUser.firstName = 'SUPERADMIN';
                        adminUser.email = configData.adminEmail;
                        adminUser.companyID = company._id;
                        adminUser.roles = [];
                        adminUser.roles.push('SUPERADMIN'); //This is the superadmin user
                        adminUser.status = 'Active';
                        adminUser.nd_trash_deleted = false;
                        var hash = require(__dirname+'/../util/hash');

                         hash(config.adminPass1, function(err, salt, hash){
                             if (err) {
                                 console.log(err.msg);
                                 throw err
                                }
                                adminUser.hash = hash;
                                adminUser.salt = salt;
                                var User = connection.model(config.usersSchemaName);
                                 User.create(adminUser, function(err, user){
                                    if(err) throw err;
                                    console.log('User created successfully');
                                    done();

                                });
                            });

                        // });
                    }
                });



            //}

}

function initializeEmailTemplates(done)
{
  require('./emailTemplatesModelForConfig.js');

  var templateStorage = require('./emailTemplates.js');

  var templates = templateStorage.getTemplates();

  createTemplate(templates,0,function(){
    done();
  });

}

function createTemplate(templates,index,done)
{
  if (!templates[index])
    {
      done();
      return
    }

  global.EmailTemplates.create(templates[index], function(err, item){
     if (err)
         console.log('Error creating email template',templates[index].name);
         else {
           console.log('email template',templates[index].name,'created successfully');
           createTemplate(templates,index+1,done);
         }

       });
}
