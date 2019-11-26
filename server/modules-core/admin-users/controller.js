var AdminUsers = connection.model('AdminUsers');
require('../../core/controller.js');
function UsersController(model) {
    this.model = model;
    this.searchFields = ['userName'];
}
UsersController.inherits(Controller);
var controller = new UsersController(AdminUsers);


exports.UsersDelete = function(req,res){
    req.query.trash = true;

    controller.delete(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.UsersFindAll = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;
    req.query.fields = ['email','status','firstName','lastName','title','department','businessUnit','brand','unit','notications','devices','userSettings','roles'];


            controller.findAll(req, function(result){

                    serverResponse(req, res, 200, result);

            });
}

exports.UsersFindOne = function(req,res){

    req.query.companyid = true;
    req.query.id = req.params.id;

    controller.findOne(req, function(result){
        serverResponse(req, res, 200, result);
    });
};

exports.changeUserStatus = function(req,res){

    req.body.userID = req.params.id;

    if (req.body.userID == req.user._id)
    {
        serverResponse(req, res, 200, {result:0,msg:'You can´t change your own status'});
    } else {
        AdminUsers.setStatus(req,function(result){
            serverResponse(req, res, 200, result);
        });
    }

}

exports.setUserSettings = function(req,res)
{
    AdminUsers.setUserSettings(req,function(result){
        serverResponse(req, res, 200, result);
    });
}
/*
exports.UsersCreate = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;

            controller.create(req, function(result){
                serverResponse(req, res, 200, result);
            });
}
*/

exports.UsersUpdate = function(req,res)
{
    req.query.trash = true;
    req.query.companyid = true;

            controller.update(req, function(result){
                serverResponse(req, res, 200, result);
            });
}

exports.UsersActive = function(req, res)
{

      req.query.trash = true;
      req.query.companyid = true;
      req.query.fields = ['email','status','firstName','lastName'];
      req.query.find = [{status:'Active'}];


              controller.findAll(req, function(result){
                  if (result.result == 1)
                  {
                      var users = [];
                      for (var u in result.items)
                      {
                        var user = {};
                        user._id = result.items[u]._id;
                        user.email = result.items[u].email;
                        user.status = result.items[u].status;
                        user.firstName = result.items[u].firstName;
                        user.lastName = result.items[u].lastName;

                        if (result.items[u].firstName || result.items[u].lastName)
                            user.fullName = result.items[u].firstName+' '+result.items[u].lastName;
                            else
                            user.fullName = result.items[u].email;

                        users.push(user);
                      }
                       serverResponse(req, res, 200, {result:1,items:users});
                } else {
                      serverResponse(req, res, 200, result);
                }
              });

}

exports.UsersCreate = function(req,res){
      createUser(req.user.companyID, req.body,req.body.sendPassword,req.headers.host,function(result){
          serverResponse(req, res, 200, result);
      })
}

exports.createUser = function(companyID,userData,sendPassword,url,done)
{
  createUser(companyID,userData,sendPassword,url,done);
}

function createUser(companyID,userData,sendPassword,url,done){


    //Do we have to generate a password?
    if (sendPassword == true)
    {
        var generatePassword = require('password-generator');
        var thePassword = generatePassword();
        userData.pwd1 = thePassword;
        userData.userPassword = thePassword;
    }

    userData.status = 'Active';
    userData.nd_trash_deleted = false;

    AdminUsers.createTheUser(companyID,userData,function(result){

        if (sendPassword == true && thePassword != undefined)
        {

            var replaceTags = [
                  {name:'NEWUSERPASSWORD',value: thePassword},
                  {name:'USEREMAIL', value: userData.email},
                  {name:'SERVERHOSTURL', value:url}

            ]

            if (userData.firstName)
                replaceTags.push({name:'USERFIRSTNAME', value: userData.firstName});
                else
                replaceTags.push({name:'USERFIRSTNAME', value: ''});

            if (userData.lastName)
                replaceTags.push({name:'USERLASTNAME', value: userData.lastName});
                else
                replaceTags.push({name:'USERLASTNAME', value: ''});

            if (userData.code)
                replaceTags.push({name:'USERCODE', value: userData.code});
                else
                replaceTags.push({name:'USERCODE', value: ''});

            sendEmailTemplate(companyID,'newUserAndPassword',userData.language,replaceTags,userData.email,function(result)
            {

            });

        }

        done(result);
    });

/*
    var data = req.body;
    AdminUsers.findOne({companyID: req.user.companyID, userName: data.email }, {_id: 1}, function(err, user) {
        if (err) throw err;

        if (user) {
            serverResponse(req, res, 200, {result: 0, msg: 'userName already in use.'});
        }
        else {
            var crypto = require('crypto');
            var hash_verify_account = crypto.createHash('md5').update(data.email).digest('hex');
            var generatePassword = require('password-generator');
            var thePassword = generatePassword();
            var hash = require('../../util/hash');

            hash(thePassword, function(err, salt, hash){
                if(err) throw err;

                data.status = 'Active';
                data.nd_trash_deleted = false;
                data.hash = hash;
                data.salt = salt;
                data.invitedBy = req.user._id;
                data.hash_verify_account = hash_verify_account;

                Users.create(data, function(err, user) {
                    if (err) throw err;

                    var acceptURL = req.protocol+"://"+req.get('host')+"/api/users/accept-invitation/"+hash_verify_account;

                    sendEmailTemplate('newUserInvitation', [{email: data.email, acceptURL: acceptURL}], 'email', 'widestage invitation');

                    serverResponse(req, res, 200, {result: 1, msg: "User created.", user: user});
                });
            });
        }
    });*/
};
