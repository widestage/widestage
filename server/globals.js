/* GLOBAL FUNCTIONS */
//var appRoot = __dirname+'/../';
var appRoot = __dirname;
var appRoot2 = __dirname; // used by ignite
global.appRoot2 = appRoot2;
global.appRoot = appRoot;

function passthrough(req, res, next) {
    if (config.crypto.enabled) {
        var CryptoJS = require('crypto-js');

        if (req.query.data) {
            var decrypted = CryptoJS.AES.decrypt(req.query.data, config.crypto.secret);
            req.query = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            req.query = stripInvalidChars(req.query);
            return next();
        }
        else if (req.body.data) {
            var decrypted = CryptoJS.AES.decrypt(req.body.data, config.crypto.secret);
            req.body = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            req.body = stripInvalidChars(req.body);
            return next();
        }
        else {
            return next();
        }
    }
    else {
        return next();
    }
}
global.passthrough = passthrough;

function stripInvalidChars(obj) {
    delete(obj['$$hashKey']);

    if (typeof obj == 'object') {
        for (var i in obj) {
            if (obj[i]) stripInvalidChars(obj[i]);
        }
    }

    return obj;
}

function getNextSequence(name) {
    var Counters = connection.model('Counters');
    var ret = Counters.findAndModify(
        {
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
        }
    );

    return ret.seq;
}
global.getNextSequence = getNextSequence;


function debug(obj) {

}
global.debug = debug;

function serverResponse(req, res, status, obj) {
    if (config.crypto.enabled) {
        var CryptoJS = require('crypto-js');

        var encrypted = CryptoJS.AES.encrypt(JSON.stringify(obj), config.crypto.secret);
        obj = {data: String(encrypted)};

        var result = ")]}',\n"+JSON.stringify(obj);

        res.status(status).send(result);
    }
    else {
        var result = ")]}',\n"+JSON.stringify(obj);

        res.status(status).send(result);
    }
}
global.serverResponse = serverResponse;


function isCoreModuleInstalled(moduleName)
{
    console.log('Checking core module',moduleName,'./core-modules/'+moduleName+'/'+moduleName+'.js')
    var fs = require('fs');
    if (fs.existsSync(__dirname+'/core-modules/'+moduleName+'/'+moduleName+'.js')) {
        return true;
    } else {
        return false;
    }
}
global.isCoreModuleInstalled = isCoreModuleInstalled;

global.listMods = new Array ;
function addModulesUsedList(module){
    listMods.push(module);
}
global.addModulesUsedList = addModulesUsedList;

function restrict(req, res, next) {

    if (config.authentication)
    {
        if(req.isAuthenticated()){
                next();
        }else{

            if (req.session)
                req.session.error = 'Access denied!';
              saveToLog(req, 'Access denied not authenticated user ','SECURITY','WARNING','LOGIN', '003','AUTHENTICATION','ADMIN',{},'','');
              return res.redirect(307,'/login');
        }
    } else {
        next();
    }
}
global.restrict = restrict;

function restrictRole(roles) {
    return function(req, res, next) {
        if(req.isAuthenticated()){
            for (var i in roles) {
                if (req.user.roles.indexOf(roles[i]) > -1){
                    next();
                    return;
                }
            }
        }
        req.session.error = 'Access denied!';
        //TODO: Log annotation security issue
        saveToLog(req, 'Access denied for the user '+req.user.email,'SECURITY','WARNING','LOGIN', '004','AUTHENTICATION','ADMIN',{},'','');
        res.send(401, {result:0,msg:'You don´t have access to this function'});
    };
}
global.restrictRole = restrictRole;


function isGranted(module,permission) {
    return function(req, res, next) {
        if(req.isAuthenticated()){

          for (var p in req.session.permissions)
          {
              if (req.session.permissions[p].module == module && req.session.permissions[p].name == permission)
                  {
                  if (req.session.permissions[p].granted == true)
                    {
                      next();
                      return
                    }
                  }
          }

        }
        req.session.error = 'Access denied!';
        //TODO: Log annotation security issue
        saveToLog(req, 'Access denied for the user '+req.user.name+' ('+req.user.email+') trying to access '+module+' '+permission,'SECURITY','WARNING','LOGIN', '004','AUTHENTICATION','ADMIN',{},'','');
        res.send(401, {result:0,msg:'You don´t have permissions'});
    };
}
global.isGranted = isGranted;
