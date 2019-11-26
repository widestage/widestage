exports.getDocument = function(req, res) {

    var language = req.params.language;
    var doc = req.params.document;

    var fs = require('fs');
    var routes_dir = __dirname + '/../../../../public/help/'+ language+'/'+doc+'.html';
    var eng_routes_dir = __dirname + '/../../../../public/help/en/'+doc+'.html';

    if (fs.existsSync(routes_dir)) {
        fs.readFile(routes_dir, "utf8", function(err, data){
            if(err) throw err;
            serverResponse(req, res, 200, {result:1, item:data});
        });
    } else {

        if (language != 'en')
           {
             if (fs.existsSync(eng_routes_dir)) {
                 fs.readFile(eng_routes_dir, "utf8", function(err, data){
                     if(err) throw err;
                     serverResponse(req, res, 200, {result:1, item:data});
                 });
             } else {
               serverResponse(req, res, 200, {result:1, item:'<strong> No help available for this topic </strong>'});
            }


           } else {
             serverResponse(req, res, 200, {result:1, item:'<strong> No help available for this topic </strong>'});
           }

    }


};
