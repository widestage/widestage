module.exports = function (app, passport) {
    var hash = require('./lib/hash');

    const ExpressBrute = require('express-brute');

    const ExpressBruteMongooseStore = require('express-brute-mongoose');


    /**
     * Setup Express-Brute
     */
    var bruteForce = connection.model('bruteForce');

    const EBstore = new ExpressBruteMongooseStore(bruteForce);

    const bruteforce = new ExpressBrute(EBstore, {
      freeRetries: 5,
      minWait: 60 * 1000,
      maxWait: 5 * 60 * 1000,
      refreshTimeoutOnRequest: false,
      failCallback (req, res, next, nextValidRequestDate) {
        req.flash('alert', {
          class: 'error',
          title: lang.t('auth:errors.toomanyattempts'),
          message: lang.t('auth:errors.toomanyattemptsmsg', { time: moment(nextValidRequestDate).fromNow() }),
          iconClass: 'fa-times'
        })
        res.redirect('/login')
      }
    })

    app.get('/login', function(req, res, next) {

        if (config.multipleSubdomains === true) {
            var host = String(req.headers.host).split('.')[0];
            res.cookie('companySubdomain',host, { maxAge: 900000, httpOnly: true });
                var Companies = connection.model('Companies');

                Companies.findOne({companySuffix: host}, {customization: 1}, function (err, company) {
                    if (err) {
                        saveToLog(req, 'Error on login when searching for company ' + err.message,'SECURITY','ERROR','LOGIN', '006','AUTHENTICATION','SUPERADMIN',{},'','');
                    }

                    var customLogo = "./images/main-logo.png";
                    var customBackgroundColor = undefined;
                    var customBackgroundImage = undefined;
                    var customCSS = "";

                    if (company) {
                        if (company.customization)
                        {
                            if (company.customization.logo)
                                customLogo = company.customization.logo;
                            if (company.customization.login)
                            {
                                if (company.customization.login.backgroundImage)
                                    customBackgroundImage = company.customization.login.backgroundImage;
                                if (company.customization.login.backgroundColor)
                                    customBackgroundColor = company.customization.login.backgroundColor;
                                if (company.customization.login.customCSS)
                                    customCSS = company.customization.login.customCSS;
                            }
                        }
                        var bodyBackground = '';
                        if (!customBackgroundImage)
                            {
                                if (customBackgroundColor)
                                bodyBackground = "background-color:"+customBackgroundColor+"; ";
                            } else
                            bodyBackground =  "background-image:url(\'"+customBackgroundImage+"\'); background-size: cover;";



                        res.render('login', {
                            isgoogleauthenabled: config.enableGoogleAuth,
                            subdomain: host,
                            companyID: company._id,
                            appName: config.appName,
                            appDescription: config.appDescription,
                            appURL: config.appURL,
                            appSlogan: config.appSlogan,
                            customLogo: customLogo,
                            bodyBackground: bodyBackground,
                            customCSS: customCSS,
                            theme:config.theme
                        });
                    }
                    else {
                        return res.redirect('/company-not-found');
                    }
                });

        } else {

          var customLogo = "./images/main-logo.png";

            res.render('login', {
                isgoogleauthenabled: config.enableGoogleAuth,
                subdomain: undefined,
                companyID: '5355504552555345522d2d2d', //SUPERADMIN company
                appName: config.appName,
                appDescription: config.appDescription,
                appURL: config.appURL,
                appSlogan: config.appSlogan,
                customLogo: customLogo,
                bodyBackground: false,
                customCSS: false,
                theme:config.theme
            });
        }
    });

    app.get('/logout', function(req, res, next) {
        res.cookie('remember_me', false, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 day
        req.logout();
        req.session.destroy(function (err) {
            if(err) console.log(err);

        });
        res.redirect('/login');
    });
    //bruteforce.prevent,
    app.post('/api/v3/auth/login', function(req, res, next) {
        if (config.multipleSubdomains === true) {
            var host = String(req.headers.host).split('.')[0];
            //for the test
            if (host == '127') host = 'itgdemo';

            req.body.multipleSubdomains = true;
            req.body.detectedSubdomain = host;

            authenticate(passport,req, res, next);
        } else {
            req.body.multipleSubdomains = false;
            authenticate(passport,req, res, next);
        }
    });

    //Google
    app.get('/auth/google', function(req,res,next) {
        var hash = (req.query.h);

        req.session.completeRegistrationHash = hash;
        req.session.host = req.query.host;
        res.cookie('companySubdomain',req.query.host, { maxAge: 900000, httpOnly: true });

        req.session.save((err) => {
            if (!err) {

                passport.authenticate('google', {}) (req,res,next);

            } else {
                console.log(err);
            }
        });

    });

    app.get('/auth/google/callback',
        passport.authenticate("google",{ failureRedirect: '/login'}),
        function(req,res){
            var host = String(req.session.host);
            var domain = String(req.headers.host).replace('oauth', host);
            res.redirect('http://'+domain+'/');
        }
    );

    app.get('/api/v3/auth/get-my-user-data',restrict, function(req, res, next){
            if (!req.user)
               {
                  return res.redirect(307,'/login');
               }

               auth.getMyUserData(req, res, function(result){
                   serverResponse(req, res, 200, result);
               });

    } );

    app.get('/api/v3/auth/get-my-company-data',restrict, function(req, res,next){

            auth.getMyCompanyData(req,res,function(result){
                serverResponse(req, res, 200, result);
            });

    } );

    app.post('/api/v3/auth/remember-password', function(req, res, next){
        var lang0 = String(req.headers["accept-language"]).split(',');
        lang0 = String (lang0[0]).substring(0, 2);

        if (config.multipleSubdomains === true) {

            var host = String(req.headers.host).split('.')[0];
            var Companies = connection.model('Companies');
                Companies.findOne({companySuffix: host}, {_id: 1,companySuffix: 1}, function (err, company) {
                    if (err) {
                        saveToLog(req, 'Error on login when searching for company ' + err.message,'SECURITY','ERROR','LOGIN', '007','AUTHENTICATION','SUPERADMIN',{},'','');

                    }

                    if (company)
                    {
                        var body = req.body;
                        var url = req.headers.host;
                        var Users = connection.model(config.usersSchemaName);
                        Users.findOne({ email: body.email, companyID: company._id},{_id:1,language:1,status:1}, function (err, findUser) {
                            if(findUser){
                                if (findUser.status == 'Active')
                                {
                                    auth.rememberPassword(findUser.language,body.email, url, function(result){
                                        res.send(200, result);
                                    });
                                } else {
                                    res.send(200, {result: 0, msg: 'This user is not active, contact your admin for more info'});
                                }
                            }else{
                                res.send(200, {result: 0, msg: 'Email not registered for this company'});
                            }
                        });
                    } else {
                         res.send(200, {result: 0, msg: 'Company not found'});
                    }

                });
        } else {
            //Not multipleSubdomains
                        var body = req.body;
                        var url = req.headers.host;
                        var Users = connection.model(config.usersSchemaName);
                        Users.findOne({ email: body.email},{_id:1,language:1,status:1}, function (err, findUser) {
                            if(findUser){
                                if (findUser.status == 'Active' )
                                {
                                    auth.rememberPassword(findUser.language,body.email, url, function(result){
                                        res.send(200, result);
                                    });
                                } else {
                                    res.send(200, {result: 0, msg: 'This user is not active, contact your admin for more info'});
                                }
                            } else {
                                res.send(200, {result: 0, msg: 'Email not registered'});
                            }
                        });
        }
    });

    app.get('/change-password', function(req, res, next){
        getCompanyConfig(req,res,function(result){
            if (result)

                res.render('changePassword',result);
        });

    });

    app.post('/api/v3/auth/change-password', function(req, res, next){
                var Users = connection.model(config.usersSchemaName);
                var data = req.body;
                if (!data.hash || !data.password) {
                    res.send(200, {result: 0, msg: "'hash' and 'password' is required."});
                    return;
                }
                Users.findOne({"hash_change_password" : data.hash},{},function(err, user){
                    if(err) throw err;
                    if (user) {
                        hash(data.password, function(err, salt, hash){
                            if(err) throw err;

                            Users.update({
                                "_id" : user._id
                            }, {
                                $set: {
                                    "salt" : salt,
                                    "hash" : hash,
                                    "hash_change_password" : null
                                }
                            }, function (err) {
                                if(err) throw err;

                                /*var Configurations = connection.model('Configurations');

                                Configurations.getConfiguration('log-user-pwd-change', function(configuration){
                                    if (configuration.value == 1) {
                                        saveToLog(req, 'User password changed: '+user.email,'', 103);
                                    }*/
                                    saveToLog(req, 'User password changed: '+user.email+','+user.code+','+user.name,'SECURITY','INFO','LOGIN', '007','AUTHENTICATION','ADMIN',{},'','');

                                    res.send(200, {result: 1, msg: "Password updated"});


                                    sendEmailTemplate(user.companyID,'passwordChanged',user.language,[],user.email,function(result)
                                    {
                                        if (result.result != 1)
                                            console.log(result);
                                    });
                            });
                        });
                    }
                    else {
                        res.send(200, {result: 0, msg: "Invalid hash or this hash has already been used"});
                    }
                });
    });

    app.get('/api/v3/auth/change-language/:language',restrict, function(req,res,next){
        var Users = connection.model(config.usersSchemaName);
        var lang = req.params.language;

        Users.update({
            "_id" : req.user._id
        }, {
            $set: {language: lang}
        }, function (err) {
            if(err) throw err;

            req.user.language = lang;

            serverResponse(req, res, 200, {result: 1, msg: "Language updated."});

        });
    });

    //Invitation
    var Invitation = require('./controller-invitation.js');
    app.get('/accept-invitation', Invitation.renderAcceptInvitation);
    app.post('/api/v3/auth/new-user-invite',restrict,Invitation.newUserInvite);
    app.post('/api/v3/auth/invite-accepted', Invitation.inviteAccepted);
    //End-invitation

    //---To check
    app.get('/api/v3/auth/accept-invitation/:hash', function(req, res, next) {
        var data = req.params;

        Users.findOne({hash_verify_account: data.hash}, {email: 1, hash: 1, salt: 1, hash_verify_account: 1}, function(err, user) {
            if (err) throw err;

            if (user) {
                Users.update({hash_verify_account: data.hash}, {$set: {
                    status: 'Active'
                }}, function(err) {
                    if (err) throw err;

                    req.body.userName = user.email;
                    req.body.password = user.hash+user.salt;

                    var passport = require("passport");

                    passport.authenticate('local', function(err, user, info) {
                        if (err) throw err;

                        if (!user) {
                            return res.status(200).send({result: 0, msg: info.message});
                        }
                        else {
                            req.logIn(user, function(err) {
                                if (err) throw err;

                                var completeRegisterURL = req.protocol+"://"+req.get('host')+"/complete-registration?h="+user.hash_verify_account;

                                return res.redirect(completeRegisterURL);
                            });
                        }
                    })(req, res, next);
                });
            }
            else {
                res.status(200).send("Invalid hash");
            }
        });
    });

    app.get('/complete-registration', function(req, res){
        var host = String(req.headers.host).split('.')[0];

        if (host != 'app' && host != 'config' && config.ip != "local") {
            var Companies = connection.model('Companies');
            var mainHost = config.host;
            req.session.host = host;




            Companies.findOne({subdomain: host}, {customLogo: 1, customBackground: 1}, function(err, company) {
                if (err) throw err;

                if (company) {
                    res.render('completeRegister', {
                        host: mainHost,
                        subdomain: host,
                        customLogo: company.customLogo,
                        customBackground: company.customBackground,
                        theme:config.theme
                    });
                }
                else {
                    return res.redirect('/company-not-found');
                }
            });
        }
        else {
          var customLogo = "./images/main-logo.png";

            res.render('login', {
                subdomain: (config.ip == 'local') ? 'local' : 'app',
                customLogo: customLogo,
                customBackground: false,
                theme:config.theme
            });
        }
    });

    app.post('/api/v3/auth/complete-registration', function(req, res, next){
        var data = req.body;

        if (!data.hash || !data.password) {
            return res.status(200).send({result: 0, msg: "Hash and 'password' is required."});
        }

        var password = data.password;

        Users.findOne({hash_verify_account: data.hash}, {email: 1, salt: 1, hash: 1}, function (err, user) {
            if (err) throw err;

            if(user){
                req.body.userName = user.email;
                req.body.password = user.hash+user.salt;

                var passport = require("passport");

                passport.authenticate('local', function(err, user, info) {
                    if (err) throw err;

                    if (!user) {
                        return res.status(200).send({result: 0, msg: info.message});
                    } else {
                        req.logIn(user, function(err) {
                            if (err) throw err;

                            var hash = require('./lib/hash');

                            hash(password, function(err, salt, hash){
                                if(err) throw err;

                                var userUpdate = {
                                    salt : salt,
                                    hash : hash,
                                    hash_verify_account: null,
                                    status: 'Active',
                                    language: (req.acceptsLanguages('es')) ? 'es' : 'en'
                                };

                                Users.update({hash_verify_account: data.hash}, {$set: userUpdate}, function(err) {
                                    if (err) throw err;;

                                    req.user.status = 'Active';
                                    req.user.language = (req.acceptsLanguages('es')) ? 'es' : 'en';

                                    res.status(200).send({result: 1, msg: "Registration complete"});
                                });
                            });
                        });
                    }
                })(req, res, next);
            }
            else {
                res.status(200).send({result: 0, msg: "Invalid hash."});
            }
        });
    });

    app.post('/api/v3/auth/missing-translation/:lang',function(req,res,next){
       //save missing translations to the locale files
       if (config.trackMissingTranslations)
       {
           var googleTrans = false;

           res.status(200).send({result: 1, msg: "Translation registered"});
           var data = req.body;
           var lang = req.params.lang;
           var key = data[Object.keys(data)[0]];
           console.log('missing',data[Object.keys(data)[0]]);



            var fs = require('fs');
            var fileName = __dirname+'/../../../public/locales/'+lang+'/translation.json';
            var file = require(fileName);
            //var translations = JSON.stringify(file);
            if (key.substr(0,3) != '[nt]')
            {
                if (!file[key])
                    {
                    //development is in english by default
                    if (lang == 'en')
                        file[key] = key;
                        else
                        {
                        if (googleTrans)
                           {
                               var apiKey = 'XXXXX';
                               //npm install google-translate --save
                               const googleTranslate = require('google-translate')(apiKey);

                                googleTranslate.translate(key, lang, function(err, translation){
                                    var gTranslation= translation.translatedText;
                                    file[key] = gTranslation;
                                    var beautify = require("json-beautify");
                                    fs.writeFile(fileName, beautify(file, null, 2, 100) , function (err) {
                                      if (err) return console.log(err);
                                    });

                                })
                           } else {
                            file[key] = '[nt] '+key;
                            var beautify = require("json-beautify");
                            fs.writeFile(fileName, beautify(file, null, 2, 100) , function (err) {
                              if (err) return console.log(err);
                            });
                           }
                        }
                    }

            }
       }  else {
           res.status(200).send({result: 1, msg: "Translation registered"});
       }
    });


} //module exports

function getCompanyConfig(req,res,done)
{
    if (config.multipleSubdomains === true) {
            var host = String(req.headers.host).split('.')[0];
            res.cookie('companySubdomain',host, { maxAge: 900000, httpOnly: true });
                var Companies = connection.model('Companies');

                Companies.findOne({companySuffix: host}, {customization: 1}, function (err, company) {
                    if (err) {
                        saveToLog(req, 'Error on login when searching for company ' + err.message,'SECURITY','ERROR','LOGIN', '008','AUTHENTICATION','SUPERADMIN',{},'','');

                    }

                    var customLogo = "./images/main-logo.png";
                    var customBackgroundColor = undefined;
                    var customBackgroundImage = undefined;
                    var customCSS = "";

                    if (company) {
                        if (company.customization)
                        {
                            if (company.customization.logo)
                                customLogo = company.customization.logo;
                            if (company.customization.login)
                            {
                                if (company.customization.login.backgroundImage)
                                    customBackgroundImage = company.customization.login.backgroundImage;
                                if (company.customization.login.backgroundColor)
                                    customBackgroundColor = company.customization.login.backgroundColor;
                                if (company.customization.login.customCSS)
                                    customCSS = company.customization.login.customCSS;
                            }
                        }
                        var bodyBackground = '';
                        if (!customBackgroundImage)
                            {
                                if (customBackgroundColor)
                                bodyBackground = "background-color:"+customBackgroundColor+"; ";
                            } else
                            bodyBackground =  "background-image:url(\'"+customBackgroundImage+"\'); background-size: cover;";

                        done({
                            isgoogleauthenabled: config.enableGoogleAuth,
                            subdomain: host,
                            companyID: company._id,
                            appName: config.appName,
                            appDescription: config.appDescription,
                            appURL: config.appURL,
                            appSlogan: config.appSlogan,
                            customLogo: company.customization.logo,
                            bodyBackground: bodyBackground,
                            customCSS: customCSS,
                            theme:config.theme
                        });
                    } else {
                        done(false);
                    }
                });

        } else {
            done({
                isgoogleauthenabled: config.enableGoogleAuth,
                subdomain: undefined,
                companyID: undefined,
                appName: config.appName,
                appDescription: config.appDescription,
                appURL: config.appURL,
                appSlogan: config.appSlogan,
                customLogo: false,
                bodyBackground: false,
                customCSS: false
            })
        }
}

function authenticate(passport, req, res, next)
{
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }

        if (!user) {
                if (global.logFailLogin == true)
                    saveToLog(req, 'User fail login: '+info.message,'SECURITY','INFO','LOGIN', '009','AUTHENTICATION','ADMIN',{},'','');

                res.send(401, info.message);
                return;
        } else {

                var loginData = {
                    "last_login_date" : new Date(),
                    "last_login_ip" : req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
                };

                if (req.body.remember_me) {
                    var token = ((Math.random()*Math.pow(36,10) << 0).toString(36)).substr(-8);
                    loginData['accessToken'] = token;
                    res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 day
                } else {
                    res.cookie('remember_me', false, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 day
                }

                getUserCompany(user,loginData,req, res,next);
        }
    })(req, res, next);
}

function getUserCompany(user,loginData,req, res,next)
{
    //insert the company's Data into the user to avoid a 2nd server query'

           var Companies = connection.model('Companies');
           Companies.findOne({_id:user.companyID, status:1},{"licenseInfo.modules":1,"licenseInfo.licensePackets":1,customization:1,companyName:1,companySuffix:1,modulesProperties:1},function(err, company){


                if (!company)
                {
                    saveToLog(req, 'User fail login: '+user.userName+' ('+user.email+') user company not found!','SECURITY','INFO','LOGIN', '010','AUTHENTICATION','ADMIN',{},'','');
                    res.send(401, "User's company not found!");
                    return

                } else {

                    if (req.body.multipleSubdomains === true && req.body.detectedSubdomain != company.companySuffix)
                    {
                        saveToLog(req, 'Incorrect subdomain, detected: '+req.body.detectedSubdomain+' versus user company:'+company.companySuffix,'SECURITY','WARNING','LOGIN', '011','AUTHENTICATION','ADMIN',{},'','');
                        res.send(401, "Incorrect subdomain");
                        return;
                    } else {
                        req.session.company = company;
                        var Users = connection.model(config.usersSchemaName);
                        Users.update({
                            "_id" : user._id
                        }, {
                            $set: loginData
                        }, function (err) {
                            if(err) throw err;
                            req.logIn(user, function(err) {
                                if (err) { return next(err); }

                                req.session.save((err) => {
                                    if (!err) {
                                        serverResponse(req, res, 200, { user : user, company: company });
                                    } else {
                                        console.log(err);
                                    }
                                });

                                //res.redirect('/#/home');
                                if (global.logSuccessLogin == true) {
                                    saveToLog(req, 'User login: '+user.userName+' ('+user.email+')','SECURITY','INFO','LOGIN', '012','AUTHENTICATION','ADMIN',{},'','');
                                }
                               // res.redirect('/#/home');
                            });
                        });
                    }
                }
            });
}

function checkIfUserIsAdmin(req) {
    var userRoles = (typeof req.user.roles == 'string') ? [req.user.roles] : req.user.roles;

    var adminRoles = ['52988ac5df1fcbc201000008','5327d7ef9c3b0f7801acda0d']

    for (var i in adminRoles) {
        var role = adminRoles[i];

        if (userRoles && userRoles.indexOf(role) > -1){
            return true;
        }
    }

    return false;
}
global.checkIfUserIsAdmin = checkIfUserIsAdmin;
