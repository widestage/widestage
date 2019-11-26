exports.getObjects = function(req,res){

        serverResponse(req, res, 200, {result:1,items:global.objectGrants});

};

exports.getObject = function(req,res){
    var objectName = req.params.module;
    var found = false;
    for (var o in global.objectGrants)
      {
          if (global.objectGrants[o].module === objectName)
              {
                 found = true;
                 serverResponse(req, res, 200, {result:1,item:global.objectGrants[o]});
              }
      }

    if (!found)
        serverResponse(req, res, 200, {result:0,msg:'Object not found'});
};

exports.getAppPermissions = function(req, res)
{
    getAppPermissions(req, function(result)
      {
          serverResponse(req, res, 200, result);
        });
}

exports.getAppPermissions4Test = function(req, done)
{
      getAppPermissions(req, done);
}

function getAppPermissions(req,done)
{
    var appGrants = [];
    for (var o in global.objectGrants)
        {
          if (global.objectGrants[o].type == 'app')
              appGrants.push(global.objectGrants[o]);
        }

      done({result:1,items:appGrants});
}

exports.getPermissionsForRole = function(req, res)
{
    var role = req.params.roleID;
    getPermissionsForRole(req, role, function(result){
          serverResponse(req, res, 200, result);
    });

}

exports.getPermissionsForRole4Test = function(req, role, done)
{
    getPermissionsForRole(req, role, done)
}

function getPermissionsForRole(req, role, done)
{
  var Permissions = connection.model('Permissions');
  var find = {companyID:req.user.companyID,roleID:role}

  Permissions.find(find, {}, {}, function(err, grants){
        done({result:1,items:grants});
  });
}

exports.getPermissionsForModuleObject = function(req,res){
    var module = req.params.module;
    var objectID = req.params.objectID;
    var Permissions = connection.model('Permissions');
    var find = {companyID:req.user.companyID,module:module,objectID:objectID}

    Permissions.find(find, {}, {}, function(err, grants){
          serverResponse(req, res, 200, {result:1,grants:grants});
    });
}

exports.savePermissionsForModule = function(req,res){
    var module = req.params.module;
}

exports.saveObjectPermissionForRole = function(req,res){
    var module = req.params.module;
    var permission = req.params.permission;
    var role = req.params.role;
    var objectID = req.params.objectID;

    var find = {companyID:req.user.companyID,roleID:role,module:module,permission:permission,objectID:objectID},
    update = { granted: req.body.granted },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

    var Permissions = connection.model('Permissions');

    Permissions.findOneAndUpdate(find, update, options, function(error, result) {
        if (error) return;
          serverResponse(req, res, 200, {result:1,msg:'permission successfully updated'});
        // do something with the document
    });
}

exports.saveObjectPermissionForUser = function(req,res){
    var module = req.params.module;
    var permission = req.params.permission;
    var user = req.params.user;
}


exports.savePermissionForRole = function(req,res){
    var module = req.params.module;
    var permission = req.params.permission;
    var role = req.params.role;

    var find = {companyID:req.user.companyID,roleID:role,module:module,permission:permission},
    update = { granted: req.body.granted },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

    var Permissions = connection.model('Permissions');

    Permissions.findOneAndUpdate(find, update, options, function(error, result) {
        if (error) return;
          serverResponse(req, res, 200, {result:1,msg:'permission successfully updated'});
        // do something with the document
    });
}

exports.savePermissionForUser = function(req,res){
    var module = req.params.module;
    var permission = req.params.permission;
    var user = req.params.user;
}
