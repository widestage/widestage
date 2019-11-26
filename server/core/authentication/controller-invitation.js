var hash = require(appRoot+'/core/authentication/lib/hash.js');

exports.newUserInvite = function(req, res)
{
    auth.inviteUser(req,res);
}


exports.renderAcceptInvitation = function(req, res) {
    var fs = require('fs');

    var host = String(req.headers.host).split('.')[0];
    var domain = (config.admin) ? req.headers.host : String(req.headers.host).replace(host, 'oauth');

    res.render('acceptInvitation',{host:host,domain:domain,hash:req.query.h});
    
};

exports.inviteAccepted = function(req, res) {
    auth.inviteAccepted(req,res);
};