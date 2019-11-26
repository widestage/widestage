exports.changeMyPassword = function(req,res){

    if (req.body.pwd1 && req.body.pwd2)
    {
        if (req.body.pwd1 == req.body.pwd2)
        {
            var hash = require('../../../util/hash');
            hash(req.body.pwd1, function(err, salt, hash){
                if(err) throw err;
                Users.update({_id:req.user._id},{salt:salt,hash:hash}, function(result){
                    var result = {result: 1, msg: "Password changed"};
                    serverResponse(req, res, 200, result);
                });

            });
        } else {
            var result = {result: 0, msg: "Passwords do not match"};
            serverResponse(req, res, 200, result);
        }
    }
};
