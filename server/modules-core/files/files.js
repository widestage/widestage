module.exports = function (app) {
    
    console.log('Module files loaded');
    addModulesUsedList('files');
    require('./model.js');
    require('./routes.js')(app);
}

function fileUpload(file,path,done)
{
    var fs = require('fs');

    fs.readFile(file.path, function(err, data) {
        if(err) throw err;

        fs.writeFile(path, data, function (err) {
            if(err) throw err;
            done({result: 1, msg: "File uploaded", file: file.toObject()});

        });
    });
}