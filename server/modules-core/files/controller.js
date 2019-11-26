var Files = connection.model('Files');

exports.getFiles = function(req,res){
    var find = {"type" : new RegExp('image', "i"), "upload_user_id" : req.user._id};

    if (req.query.format) {
        find['extension'] = req.query.format;
    }

    Files.find(find, {}, {sort: {created: -1}}, function(err, files){
        if(err) throw err;

        serverResponse(req, res, 200, {result: 1, files: files});
    });
};

exports.getMyImages = function(req,res){
    var find = {"catalogType" : 'images', "companyID" : req.user.companyID, $or:[{"upload_user_id" : req.user._id },{"upload_user_id" : null}]};

    if (req.query.format) {
        find['extension'] = req.query.format;
    }

    Files.find(find, {}, {sort: {created: -1}}, function(err, files){
        if(err) throw err;

        serverResponse(req, res, 200, {result: 1, files: files});
    });
};

exports.upload = function(req, res) {
    //You are using upload.single, which you should use req.file not req.files. To upload multiple files, use upload.array.
    uploadFile(req.file, {userID: req.user._id, companyID: req.user.companyID},'user','files', function(data) {
        debug(data);

        res.status(200).send(data);
    });
};

exports.uploadFile = function(file, params, done)
{
    uploadFile(file, params,'company','files', done)
}

exports.uploadCompanyImages = function(req,res)
{
  uploadFile(req.file, {companyID: req.user.companyID},'company' ,'images',function(data) {
      debug(data);

      res.status(200).send(data);
  });
}

exports.uploadUserImages = function(req,res)
{
  uploadFile(req.file, {userID: req.user._id, companyID: req.user.companyID},'user' ,'images',function(data) {
      debug(data);

      res.status(200).send(data);
  });
}

function uploadFile(file, params,level,type, done) {
    var fs = require('fs');

    fs.readFile(file.path, function(err, data) {
        if(err) throw err;

        upload(data, file, params,level,type, done);
    });
}

function upload(data, file, params,level,type, done) {
    var fs = require('fs'), mongoose = require('mongoose');

    var File = {
        _id: mongoose.Types.ObjectId(),
        name: (file.originalname) ? file.originalname : file.name,
        type: (file.type) ? file.type : file.mimetype,
        size: file.size
    };

    if (params.data) {
        File['data'] = params.data;
    }

    var extension = File.name.split(".");

    File['extension'] = String(extension[1]).toLowerCase();
    File['source'] = 1;

    if (params.userID) {
        File['upload_user_id'] = params.userID;
    }
    if (params.companyID) {
        File['companyID'] = params.companyID;
    }

    File['level'] = level;
    File['catalogType'] = type;


    var files = [{name: extension[0]+'.'+File._id+'.'+File.extension, data: data, type: File.type}];

 if (config.uploadStorageType === 'amazonS3') {
        uploadToS3(files, params, function(filesURLs) {
            File['url'] = filesURLs[0];
            if (params.companyID && params.userID)
            {
                Files.create(File, function(err, file){
                    if(err) throw err;
                    done({result: 1, msg: "File uploaded", file: file.toObject()});
                });
            } else {
                done({result: 1, msg: "File uploaded", file: File});
            }
        });
    } else {  //Storing uploaded files locally

        var typeDirectory = __dirname+"/../../../public/uploads/"+type;
        if (!fs.existsSync(typeDirectory)){
            fs.mkdirSync(typeDirectory);
        }

        var companyDirectory = __dirname+"/../../../public/uploads/"+type+'/'+params.companyID;
        if (!fs.existsSync(companyDirectory)){
            fs.mkdirSync(companyDirectory);
        }

        var fileUrl = "/uploads/"+type+'/'+params.companyID;

        if (level == 'user')
        {
          targetDirectory = __dirname+"/../../../public/uploads/"+type+'/'+params.companyID+'/'+params.userID;
          fileUrl = "/uploads/"+type+'/'+params.companyID+'/'+params.userID;
        } else {
          targetDirectory = companyDirectory;
        }

        if (!fs.existsSync(targetDirectory)){
            fs.mkdirSync(targetDirectory);
        }


        var newPath = targetDirectory+'/'+File._id+"."+File.extension;

        fs.writeFile(newPath, data, function (err) {
            if(err) throw err;

            File['url'] = fileUrl+'/'+File._id+"."+File.extension;

            if (params.companyID && params.userID)
            {
                Files.create(File, function(err, file){
                    if(err) throw err;
                    done({result: 1, msg: "File uploaded", file: file.toObject()});
                });
            } else {
                done({result: 1, msg: "File uploaded", file: File});
            }

        });
    }

}

function uploadToS3(files, params, done, index, filesURLs) {
    var index = (index) ? index : 0;
    var filesURLs = (filesURLs) ? filesURLs : [];
    var file = (files[index]) ? files[index] : false;

    if (!file) {
        done(filesURLs);
        return;
    }

    var AWS = require('aws-sdk');

    AWS.config.update({
        accessKeyId: config.amazon.accessKeyId,
        secretAccessKey: config.amazon.secretAccessKey,
        region: config.amazon.region
    });

    var folder = '';
    var s3 = new AWS.S3(), bucket = config.amazon.bucket; //, folder = config.amazon.folder;

    if (params.folder)
        folder += params.folder;
        else
        folder += 'uncategorised';

    if (params.companyID) {
        folder += '/'+params.companyID;
    }

    if (params.userID) {
        folder += '/'+params.userID;
    }

    if (params.path) {
        folder += '/'+params.path;
    }

    s3.createBucket({Bucket: bucket}, function() {

        var key = folder+'/'+file.name;
        if (params.filename)
            key = folder+'/'+params.filename;

        if (!file.type)
            file.type = 'string';

        var S3Params = {
            Bucket: bucket,
            Key: key,
            Body: file.data,
            ACL: "public-read",
            ContentType: file.type
        };

        filesURLs.push('https://'+bucket+'.s3.amazonaws.com/'+key);

        s3.putObject(S3Params, function(err) {
            if(err) throw err;
            uploadToS3(files, params, done, index+1, filesURLs);
        });
    });
}




function uploadToS3V1 (files, params, done, index, filesURLs)
{
    var index = (index) ? index : 0;
    var filesURLs = (filesURLs) ? filesURLs : [];
    var file = (files[index]) ? files[index] : false;

    var AWS = require('aws-sdk');



    AWS.config.update({
        accessKeyId: config.amazon.accessKeyId,
        secretAccessKey: config.amazon.secretAccessKey,
        "region": config.amazon.region
    });


    var s3 = new AWS.S3();

    var bucketName = config.amazon.bucket;
    var folder = 'platform-generated-files'
    var keyName = folder+'/'+file.name;

    var params = {
        Bucket: bucketName,
        Key: keyName,
        Body: "HelloWorld"
    };

    s3.putObject(params, function (err, res) {
        if (err) {
            console.log("Error uploading data: ", err);
        } else {
            console.log("Successfully uploaded data to myBucket/myKey");
        }
    });
}

exports.uploadFromString = function(data, file, params, done) {
    uploadFromString(data, file, params, done);
};

function uploadFromString(data, file, params, done)
{
    file['size'] = String(data).length;

    upload(data, file, params, done);
}

exports.uploadAndSend = function(body, reportName, userID, companyID, done) {
    uploadFromString(body, {name: reportName, type: 'text/csv'}, {userID: userID, companyID: companyID}, function(data) {
        var Users = connection.model(config.usersSchemaName);

        Users.findOne({_id: userID}, {email: 1, language: 1}, function(err, user) {
            if (err) throw err;

            var communication = {
                code: 'REPORTLINK',
                language: user.language,
                tags: {
                    REPORTURL: data.file.url
                }
            };

            NodeDream.sendCommunication(user.email, communication, function(result) {
                debug(result);
                if (done) done({result: 1, msg: 'Report generated.'});
            });
        });
    });
}
