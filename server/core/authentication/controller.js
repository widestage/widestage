var mongoose = require('mongoose')
    , LocalStrategy = require('passport-local').Strategy
    , RememberMeStrategy = require('passport-remember-me').Strategy
    , GoogleStrategy = require('passport-google-oauth20').Strategy;


var Users = connection.model(config.usersSchemaName); 
var hash = require('./lib/hash');

module.exports = function (passport) {
    


passport.serializeUser(function(user, done) {
/*
        if (user.companyID) {
                    var Companies = connection.model('Companies');

                    Companies.findOne({_id: user.companyID}, {
                        companyID: 1,
                        name: 1,
                        subdomain: 1,
                        language: 1, 
                        defaultDocument: 1,
                        defaultDocumentType: 1
                    }, function(err, company){
                        if (company) {
                            user['companyData'] = company;
                        }
                        done(err, user);
                    });*/
       // } else {
            done(null, user);
        //}


    });

    passport.deserializeUser(function(user, done) {
        done(false, user);
    });

    passport.use(new LocalStrategy({
            usernameField: 'userName',
            passwordField: 'password',
            passReqToCallback : true
        },
        function(req,username, password, done) {
            auth.isValidUserPassword(req,username, password, done);
        }));

    passport.use(new RememberMeStrategy(
        function(token, done) {
            Users.findOne({accessToken: token},{}, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        },
        function(user, done) {
            var token = ((Math.random()*Math.pow(36,10) << 0).toString(36)).substr(-8);
            Users.update({
                "_id" : user.id
            }, {
                $set: {
                    "accessToken" : token
                }
            }, function (err) {
                if (err) { return done(err); }
                return done(null, token);
            });
        }
    ));

    if (typeof config.google !== 'undefined' && config.google !== null && (config.google.clientID && String(config.google.clientID).length > 0) && (config.google.clientSecret && String(config.google.clientSecret).length > 0)) 
    {
        passport.use(new GoogleStrategy({
                clientID: config.google.clientID,
                clientSecret: config.google.clientSecret,
                scope: ['profile', 'email'],
                callbackURL: config.google.callbackURL,
                passReqToCallback: true
            },
            function(req, accessToken, refreshToken, profile, done) {
                findOrCreateGoogleUser(req, profile, done);
            }
        ));
    }

}

exports.isAuthenticated = function (req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/login");
    }
}

function findOrCreateGoogleUser(req, profile, done){
    var Users = connection.model('Users');
    var Companies = connection.model('Companies');

var referer = req.headers.referer;
var host = referer.substring(
    referer.lastIndexOf("//") + 2, 
    referer.indexOf(".")
);



    //var host = String(req.session.host);
    var domain = String(req.headers.host).replace('oauth', host);
    
    var userFind = {};
    var userUpdate = {};
    
    if (req.session.completeRegistrationHash)
    {
        userFind.hash_verify_account = req.session.completeRegistrationHash;
        //userFind.status = 'waiting-confirmation';
        userUpdate.google = {email: profile.emails[0].value,
                             name:  profile.displayName }
        userUpdate.authenticationProvider = 'google';
        //userUpdate.status = 'Active';
        
    } else {
        userFind.status = 'Active';
        userFind.authenticationProvider = 'google';
    }
    
    

    Companies.findOne({companySuffix: String(host).toLowerCase()}, {}, function(err, company) {
        if (company) {
            
            userFind.companyID = company._id;
            userFind.email = profile.emails[0].value;
            
            Users.findOne(userFind, function(err, user){
                if (err) throw err;
                
                userUpdate.last_login_date = new Date();
                userUpdate.last_login_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                if (user){
                    user.companyData = company;
                    
                    Users.update({_id: user._id}, {$set: userUpdate}, function(err){
                        if(err) throw err;
                        
                        if (global.logSuccessLogin == true) {
                            saveToLog(req, 'User login: '+user.name+' ('+user.email+')','SECURITY','INFO','LOGIN', '002','AUTHENTICATION','ADMIN',{},'','');
                            }
                        done(null, user);
                    });
                }else{
                    saveToLog(req, 'This account ('+userFind.email+') is not registered or active','SECURITY','INFO','LOGIN', '005','AUTHENTICATION','ADMIN',{usersFind:userFind},'','');
                    done('This account ('+userFind.email+') is not registered or active, please ask your admin to verify your access to '+config.appName);
                    //done(false);
                }
            });
        }
        else {
            done('google Company not found.');
        }
    });
};



