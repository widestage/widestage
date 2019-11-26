var mongoose = require('mongoose');
var PermissionsSchema = new mongoose.Schema({
    userID: String,
    roleID: String,
    companyID: String,
    module: String,
    permission: String,
    objectID: String,
    granted: Boolean
}, { collection: 'wice_Permissions' });

console.log('Core permissions loaded');

PermissionsSchema.statics.getPermissions = function(req,done)
{
    getPermissions(req,done);
}

PermissionsSchema.statics.getUserPermissions = function(user,done)
{
    getUserPermissions(user,done);
}

PermissionsSchema.statics.hasPermissionOver = function(req,module,grant,type,object,objectID,done)
{
    getMyPosition(req, function(position){
        if (position)
            hasPermissionOver(req,module,grant,type,object,objectID,done);
    });
}

PermissionsSchema.statics.getMyPrivilegesOverOtherUsers = function(req,module, grant, done)
{
    getMyPosition(req,function(position){
        if (position)
            getMyPrivilegesOverOtherUsers(req,module, grant, done);
    });
}

PermissionsSchema.statics.checkIfUserCan = function(req, module, grant, type, objectTo)
{
    return checkIfUserCan(req, module, grant, type, objectTo)
}

global.registerDBModel('Permissions');
var Permissions = connection.model('Permissions', PermissionsSchema);
module.exports = Permissions;
global.permissions = Permissions;


function getPermissions(done)
{
  var thePermissions = [];
  for (var p in global.objectGrants)
    {
        for (var p2 in global.objectGrants[p].permissions)
            {
              global.objectGrants[p].permissions[p2].name
              var permission = {};
              permission.name = global.objectGrants[p].permissions[p2].name;
              permission.module = global.objectGrants[p].module;
              permission.granted = false;
              thePermissions.push(permission);
            }
    }
    done(thePermissions);
}


function getUserPermissions(user,done)
{

      getPermissions(function(allPermissions)
      {

            if (user.roles.indexOf('SUPERADMIN') > -1) {
                for (var p in allPermissions)
                {
                    allPermissions[p].granted = true;
                }
                done(allPermissions);
            } else {

                  if (user.roles && user.roles.length > 0)
                  {
                        var find = {companyID:user.companyID, roleID: {$in: user.roles}}

                        Permissions.find(find, {}, {}, function(err, grants){
                              for (var p in allPermissions)
                              {
                                  for (var g in grants)
                                  {
                                        if (grants[g].module == allPermissions[p].module && allPermissions[p].name == grants[g].permission && grants[g].granted == true)
                                            {
                                              allPermissions[p].granted = true;
                                            }
                                  }
                              }

                              done(allPermissions);
                        });
                  } else {
                    done(allPermissions);
                  }

            }

      });
}



function hasPermissionOver(req,module,grant,type,object,objectID,done)
{
   if (object && objectID)
   {
   var objectModel = connection.model(object);
   objectModel.find({_id:objectID},{},function(err,objectResult){
       done(checkIfUserCan(req, module, grant, type, objectResult));
   });
   } else {
       done(checkIfUserCan(req, module, grant, type, undefined));
   }
}

function checkIfUserCan(req, module, grant, type, objectTo)
{
   var result = false;
};
