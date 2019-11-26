const Mongoose = require('mongoose');


/**
 * BruteForce schema
 *
 * @type       {<Mongoose.Schema>}
 */
var bruteForceSchema = Mongoose.Schema({
  _id: { type: String},
  data: {
    count: Number,
    lastRequest: Date,
    firstRequest: Date
  },
  expires: { type: Date, index: { expires: '1d' } }
})

global.registerDBModel('bruteForce');
var bruteForce = connection.model('bruteForce', bruteForceSchema);
module.exports = bruteForce;


var authSchema = Mongoose.Schema({
  _id: { type: String}
})

authSchema.statics.rememberPassword = function(language,email, url, done){
  rememberPassword(language,email, url, done);
}

function rememberPassword(language,email, url, done){

    var crypto = require('crypto');
    var hash_change_password = crypto.createHash('md5').update(email).digest('hex');
    var Users = connection.model(config.usersSchemaName);
    Users.update({
        "email" : email
    }, {
        $set: {
            "hash_change_password" : hash_change_password
        }
    }, function (err) {
        if(err) throw err;

        sendEmailTemplate('5355504552555345522d2d2d','rememberPassword',language,[{name:'CHANGEPWDURL',value: url+'/change-password?h='+hash_change_password}],email,function(result)
        {
            if (result.result == 1)
                done({result: 1, msg: "Check your email for instructions"});
                else
                done(result);

        });


    });
}

authSchema.statics.getHash = function(theString){
  getHash(theString);
}

function getHash(theString)
{


}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

authSchema.statics.getMyUserData = function(req,res,done){
    getMyUserData(req,res,done);
}

function getMyUserData(req,res,done)
{
            if (!req.session.permissions)
                req.session.permissions = [];



            //theUserData = req.user;
            var theUserData = {};
            theUserData._id = req.user._id;
            if (req.user.firstName || req.user.lastName)
                {
                theUserData.name = req.user.firstName + ' ' + req.user.lastName;
                theUserData.firstName = req.user.firstName;
                theUserData.lastName = req.user.lastName;
                }
            theUserData.image = req.user.image;
            theUserData.email = req.user.email;
            theUserData.language = req.user.language;
            theUserData.status = req.user.status;
            theUserData.code = req.user.code;
            theUserData.companyID = req.user.companyID;
            theUserData.actualPosition = req.user.actualPosition;
            theUserData.roles = req.user.roles;
            theUserData.brands = req.user.brands;
            theUserData.departments = req.user.departments;
            theUserData.units = req.user.units;
            theUserData.idunit = req.user.idunit;
            theUserData.actualDepartment = req.user.actualDepartment;
            theUserData.dialogs = req.user.dialogs;
            theUserData.filters = req.user.filters;
            theUserData.roles = req.user.roles;
            theUserData.rolesData = req.user.rolesData;
            theUserData.provider = req.user.provider;
            theUserData.userSettings = req.user.userSettings;
            theUserData.permissions = [];
            theUserData.installedModules = global.listMods;
            theUserData.environment = global.env;
            theUserData.supportURL = global.config.supportURL;
            theUserData.appURL = global.config.appURL;

            var isSUPERADMIN = false;
            permissions.getUserPermissions(req.user,function(permissions){
                    if(req.isAuthenticated()){
                        for (var r in req.user.roles)
                            {
                              if (req.user.roles[r] === 'SUPERADMIN')
                                  {
                                      isSUPERADMIN = true;
                                      req.session.isSUPERADMIN = isSUPERADMIN;
                                      theUserData.isSUPERADMIN = isSUPERADMIN;
                                  }
                            }

                            theUserData.permissions = permissions;
                            req.session.permissions  = permissions;
                    }

                    req.user = theUserData;
                    req.session.user = theUserData;
                    done({result: 1, page: 1, pages: 1, items: {user: theUserData}});

            });
}

authSchema.statics.getMyCompanyData = function(req,res,done){
    getMyCompanyData(req,res,done);
}

function getMyCompanyData(req, res, done)
{
           var Companies = connection.model('Companies');
            Companies.findOne({_id:req.user.companyID},{"licenseInfo.modules":1,"licenseInfo.licensePackets":1,customization:1,companyName:1,companySuffix:1,modulesProperties:1},function(err, company){
                    done({result: 1, item: company});
            });
}

authSchema.statics.isValidUserPassword = function(req,username, password, done)
{
    isValidUserPassword(req,username, password, done);
}

function isValidUserPassword(req,username, password, done) {

    var hash = require('./lib/hash');
    //TODO: status
    var find = {$or:[ {'code': username}, {'email': username} ],status:'Active',nd_trash_deleted: false}
    var fields = {name:1,firstName:1,lastName:1,email:1,status:1,code:1,companyID:1,salt:1,hash:1,actualPosition:1,roles:1,brands:1,departments:1,units:1,idunit:1,actualDepartment:1,image:1,provider:1,userSettings:1}

    if (req.body.multipleSubdomains === true)
    {
        find = {$or:[ {'code': username}, {'email': username} ],status:'Active',companyID:req.body.companyID,nd_trash_deleted: false}
    }
    var Users = connection.model(config.usersSchemaName);
    Users.findOne(find,fields, function(err, user){
        if(err) return done(err);
        if(!user) return done(null, false, { message : 'User'+' '+username+' '+'does not exists or is inactive' });
        if(user.status == 0) return done(null, false, { message : 'User not verified '+username });

        hash(password, user.salt, function(err, hash){
            if(err) return done(err);
            if(hash == user.hash || password == user.hash+user.salt) {
                //delete the hash and salt values
                user.salt = undefined;
                user.hash = undefined;
                return done(null, user);

            }
            else {
                done(null, false, { message : 'Password do not match' });

            }
        });
    });
};

authSchema.statics.inviteUser = function(req,res)
{
    inviteUser(req,function(result){
        serverResponse(req, res, 200, result);
    });
}

function inviteUser(req, done)
{
    var data = req.body;
    if (data.email)
    {
    var UsersV3 = connection.model(config.usersSchemaName);

    var Companies = connection.model('Companies');
    Companies.findOne({_id: req.user.companyID}, {createdBy: 1, "customization.defaultLanguage": 1}, function(err, company) {
        if (err) throw err;

          if (company) {
            UsersV3.findOne({email: data.email, companyID: req.user.companyID}, {_id: 1}, function(err, user) {
                if (err) throw err;

                if (user) {
                    done({result: 0, msg: 'User already exists'});
                } else {
                    var crypto = require('crypto');
                    var invitation_hash = crypto.createHash('md5').update(data.email).digest('hex');

                        if(err) throw err;

                        UsersV3.create({
                            companyID: req.user.companyID,
                            status: 'waiting-confirmation',
                            code: data.email,
                            email: data.email,
                            username: data.email,
                            language: company.customization.defaultLanguage,
                            invitation_hash: invitation_hash,
                            invitedBy: req.user._id
                        }, function(err, user){
                            if(err) throw err;

                            var url = 'http://'+req.headers.host+'/accept-invitation?h='+invitation_hash;

                            var body = '<p>You have been invited to join'+' '+config.appName+'</p>';
                            body += '<br/>';
                            body += '<p><a href="'+url+'">Click here to accept the invitation</a></p>';
                            body += '<br/>';
                            body += '<p>If the link does not work, copy and paste it:<p>';
                            body += '<p>'+url+'<p>';
                            body += '<p>If you do not want to accept it, just ignore this message<p>';

                            var messageSubject = config.appName + 'Invitation';

                            if (data.messageBody)
                                {
                                    body = replaceAll(data.messageBody, "{{accept-url}}", url)
                                }

                            if (data.messageSubject)
                                    messageSubject = data.messageSubject;

                            sendEmail(messageSubject, body, data.email);

                            done({result: 1, msg: 'User created', item: user});
                        });
                    //});
                }
            });
        }
        else {
            done({result: 0, msg: 'Invalid company'});
        }
    });
    } else {
        done({result: 0, msg: 'no valid email'});
    }
}

authSchema.statics.inviteAccepted = function(req, res)
{
    inviteAccepted(req,function(result){
        serverResponse(req, res, 200, result);
    });
}

function inviteAccepted(req,done)
{
    var data = req.body;

    var UsersV3 = connection.model(config.usersSchemaName);

    if (data.hash)
    {
        UsersV3.findOne({invitation_hash: data.hash,status:'waiting-confirmation'}, {}).lean().exec(function(err, user) {
            if (err) throw err;

            if (user) {
                if (data.password && isStrongPwd1)
                {

                    user.password = data.password;
                    var hash = require(appRoot+'/core/authentication/lib/hash.js');
                    hash(user.password, function(err, salt, hash){
                        if(err) throw err;

                        UsersV3.update({_id: user._id}, {$set: {
                            status: 'Active',
                            salt: salt,
                            hash: hash,
                            invitation_hash: null
                        }}, function(err) {
                            if (err) throw err;

                            req.logIn(user, function(err) {
                                if (err) if(err) throw err;
                                done({result: 1, msg: 'Registration complete.'});
                            });
                        });
                    });
                } else {
                    done({result: 0, msg: "Invalid password."});
                }
            } else {
                done({result: 0, msg: "Invalid hash."});
            }
        });
    } else {
        done({result: 0, msg: "Invalid hash."});
    }
}

authSchema.statics.deleteUser = function(req, res)
{
    deleteUser(req,function(result){
        serverResponse(req, res, 200, result);
    });
}

function deleteUser(req,done)
{
    var data = req.body;
    var userID = req.params.userID;

    if (userID != req.user._id)
    {
        var UsersV3 = connection.model(config.usersSchemaName);
        var Companies = connection.model('Companies');

        Companies.findOne({_id: req.user.companyID}, {createdBy: 1}, function(err, company) {
            if (err) throw err;

            if (company) {
                UsersV3.remove({_id: userID, companyID: req.user.companyID}, function (err) {
                    if(err) throw err;

                    done({result: 1, msg: 'Administrator deleted'});
                });
            }
            else {
                done({result: 0, msg: 'Invalid company'});
            }
        });
    } else {
        done({result: 0, msg: 'You can not delete yourself'})
    }
}

global.registerDBModel('auth');
var auth= connection.model('auth', authSchema);
module.exports = auth;
global.auth = auth;

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

global.replaceAll = replaceAll;


function isStrongPwd1(password) {
                var regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()_-]).{8,}/;
                var validPassword = regExp.test(password);
                return validPassword;
}
