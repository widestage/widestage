var env = process.env.NODE_ENV || 'production';
// Application Params
process.argv.forEach(function(val, index, array) {
    if (index == 2) env = val;
});
if (!global.env)  //for calls from test
  global.env = env;

console.log('Loaded enviroment',env);

const serverRoot = 'server/';

var server = undefined;


var express = require('express'),
    path = require('path'),
    http = require('http');

global.http = http;

var cluster = require('cluster');
global.lang = require('i18next');
//const favicon = require('serve-favicon')



//track logger
var morgan = require('morgan');


var app = express();


// helmet for security, uncomment if you are not using the module security (modules-core)
/* var helmet = require('helmet') app.use(helmet())  */

//HTTP request logger

if (env == 'production')
{
    app.use(morgan('dev', {
      skip: function (req, res) { return res.statusCode < 400 }
    }));
} else {
    app.use(morgan('tiny'));
}

//

app.set('view engine', 'ejs');
app.set('views', __dirname + '/server/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/modules-core')));
app.use(express.static(path.join(__dirname, 'public/modules-standard')));
app.use(express.static(path.join(__dirname, 'public/modules-pro')));
app.use(express.static(path.join(__dirname, 'bower_components')));
//app.use(express.static(path.join(__dirname, 'node_modules')));



var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'})); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

var multer = require('multer');
app.use(multer({dest:'./public/uploads/temp'}).single('file'));

global.app = app;

require('./server/globals');

if (global.env != 'test')
{
        if (cluster.isMaster) {
            var numCPUs = require('os').cpus().length;

            // Fork workers.
            for (var i = 0; i < numCPUs; i++) {
                console.log ('forking ',i);
                cluster.fork();
            }

            cluster.on('exit', function(deadWorker, code, signal) {
                var worker = cluster.fork();

                // Note the process IDs
                var newPID = worker.process.pid;
                var oldPID = deadWorker.process.pid;

                // Log the event
                console.log('worker '+oldPID+' died.');
                console.log('worker '+newPID+' born.');
            });
        } else {
                var serverConfig = require('./server/serverConfig/serverConfig.js');
                serverConfig.init(app, function(){
                    var ipaddr  = global.config.ip || '127.0.0.1';
                    var port    = global.config.port  || 8089;
                    console.log( "the port is " + port);
                    global.server = app.listen(port,ipaddr, function() {
                          console.log("Server running at http://" + ipaddr + ":" + port + "/ in worker "+cluster.worker.id);
                          console.log(" installed modules are : " + global.listMods.join("\r\n"));
                        });
                });
        }

} else {

    var serverConfig = require('./server/serverConfig/serverConfig.js');
                serverConfig.init(app, function(){
                    var ipaddr  = global.config.ip || '127.0.0.1';
                    var port    = global.config.port  || 8089;
                    console.log( "the port is " + port);
                    global.server = app.listen(port,ipaddr, function() {
                          console.log("Server running at http://" + ipaddr + ":" + port );
                          console.log(" installed modules are : " + global.listMods.join("\r\n"));
                        });
                });

}

module.exports = global.server;
