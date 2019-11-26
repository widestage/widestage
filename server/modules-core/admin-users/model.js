var mongoose = require('mongoose');


var adminUsersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    code: String,
    companyID: String,
    status: String,
    email: String,
    language: String,
    image: String,
    salt: String,
    hash: String,
    hash_verify_account: String,
    hash_change_password: String,
    change_password: Boolean,
    roles: [],
    filters: [],
    contextHelp: [],
    dialogs: [],
    accessToken: String,
    startDate: {type: Date, default: Date.now },
    endDate: {type: Date},
    history: String,
    title: String,
    companyName: String,
    department: String,
    businessUnit: String,
    brand: String,
    unit: String,
    facebook: {
        id: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        name: String
    },
    google: {
        email: String,
        name: String,
        accessToken: {
            access_token: String,
            token_type: String,
            expiry_date: Number
        }
    },
    dropbox: {
        accessToken: String
    },
    onedrive: {
        accessToken: String
    },
    notifications: {},
    devices: [],
    last_login_date: {type: Date},
    last_login_ip: {type: String},
    usageStatistics: {type: Object},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    invitedBy: {type: String},
    invitedOn: {type: Date},
    acceptedInvitationOn: {type: Date},
    createdBy: {type: String},
    createdOn: {type: Date},
    companyData: {},
    userSettings: {}
}, { collection: 'wice_users' })

if (!adminUsersSchema.options.toObject) adminUsersSchema.options.toObject = {};
adminUsersSchema.options.toObject.transform = function (doc, user, options) {
    delete user.salt;
    delete user.hash;
    delete user.hash_verify_account;
    delete user.hash_change_password;
}

adminUsersSchema.statics.createUser = function(req, done){
    var data = req.body;
    createTheUser(req,data,function(result){
        done(result);
    })
}

adminUsersSchema.statics.setStatus = function(req, done){
    setStatus(req, done);
}

adminUsersSchema.statics.setUserSettings = function(req, done){
    setUserSettings(req, done);
}

adminUsersSchema.statics.createTheUser = function(companyID,userData,done){
    createTheUser(companyID,userData,done)
}

global.registerDBModel('AdminUsers');
var AdminUsers = connection.model('AdminUsers', adminUsersSchema);
module.exports = AdminUsers;


function setStatus(req, done){
    var Users = connection.model(config.usersSchemaName);
        if (req.body.status && req.body.userID)
        {
            if (req.body.status == 'Active' || req.body.status == 'Not active')
            {

                var userID = req.body.userID;
                var userStatus = req.body.status;

                if (!userID || typeof userID == 'undefined') {
                    done({result: 0, msg: "'id' and 'status' are required."});
                    return;
                }
                Users.findOne({"_id" : userID,"companyID": req.user.companyID},{_id:1,status:1}, function (err, findUser) {
                        if (findUser)
                        {
                            Users.update({
                                "_id" : userID
                            }, {
                                $set: {
                                    "status" : userStatus
                                }
                            }, function (err, numAffected) {
                                if(err) throw err;

                                done({result: 1, msg: "Status updated."});
                            });

                        } else {
                            done({result: 0, msg: "No user found for this company, can´t update the user status"});
                        }
                });
          } else {
                done({result: 0, msg: "user status not valid: "+req.body.status});
          }

      } else {
        done({result: 0, msg: "User or status not set"});
      }
}

function createTheUser(companyID,userData,done)
{
    var AdminUsers = connection.model('AdminUsers');
    if (!userData.email) {
        done({result: 0, msg: "'Email' is a required field"});
        return;
    }
    AdminUsers.findOne({"email" : userData.email, companyID: companyID },{},function(err, user){
        if(err) throw err;
        if (user) {
            done({result: 0, msg: "email already in use."});
        } else {

            if (userData.pwd1) {
              var hash = require(__dirname+'/../../util/hash');
                hash(userData.pwd1, function(err, salt, hash){
                    if(err) throw err;
                    userData.password = undefined;
                    userData.salt = salt;
                    userData.hash = hash;
                    userData.companyID = companyID;

                    AdminUsers.create(userData, function(err, user){
                        if(err) throw err;
                        done({result: 1, msg: "User created.", user: user});
                    });
                });
            } else {
                done({result: 0, msg: "'No Password set for the new user."});
            }
        }
    });

}

function setUserSettings(req,done)
{
    var userID = req.user._id;

    AdminUsers.findOne({"_id" : userID}, function (err, findUser) {
        if (findUser)
        {
            findUser.userSettings = req.body;

            AdminUsers.update({
                "_id" : userID
            }, {
                $set: {
                    "userSettings" : req.body
                }
            }, function (err, numAffected) {
                if(err) throw err;
                done({result: 1, msg: "User Settings updated", items: findUser.userSettings});
            });
        } else {
            done({result: 0, msg: "No user found, can´t update user settings"});
        }


    });

}
