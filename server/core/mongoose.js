module.exports = function (mongoose, done) {


    var dbURI = global.config.db;
    var db = {};


    if (config.db_type == 'NeDB')
        {
            var fs = require('fs');


            console.log('local database connection');

            global.connection = {
                model: function(model, schema) {

                    if (!db[model])
                    {
                        console.log(model+' DO NOT EXIST!!!');
                    } else {
                        if (schema) {
                            for (var key in schema.statics) {
                                db[model][key] = schema.statics[key];
                            }
                        }

                        return db[model];
                    }
                },
                close: function(callback) {
                    callback();
                }
            };

        } //else {
        if (config.db_type == 'mongoDB')
        {
            var mongoose = require('mongoose');
            global.connection = mongoose.createConnection(dbURI,{ server: { poolSize: 5 } });

            // CONNECTION EVENTS
            // When successfully connected
            connection.on('connected', function () {
                if (typeof done != 'undefined') {
                    done();
                }
                else {
                    console.log('Mongoose connection open to ' + dbURI);
                }
            });

            // If the connection throws an error
            connection.on('error',function (err) {
                console.log('Mongoose default connection error: ' + err);
            });

            // When the connection is disconnected
            connection.on('disconnected', function () {
                console.log('Mongoose default connection disconnected');
            });
        }


    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function() {
        connection.close(function () {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });


    global.registerDBModel = function(model)
    {
      if (config.db_type == 'NeDB')
          {
                  var Datastore = require('nedb');
                  db[model] = new Datastore({filename: __dirname+'/../'+config.nedb_path+'/'+global.env+'/'+model+'.db', autoload: true});
                  db[model].create = db[model].insert;
          }
    }

/*
    var fs = require('fs');


    var models_dir = __dirname + '/../modules';
    var core_models_dir = __dirname + '/../core-modules';

    //Custom models

    fs.readdirSync(models_dir).forEach(function (file) {
        if(file[0] === '.') return;
        if (fs.existsSync(models_dir+'/'+ file+'/model.js')) {
            require(models_dir+'/'+ file+'/model.js');
        }
    });

    //core models
    fs.readdirSync(core_models_dir).forEach(function (file) {
        if(file[0] === '.') return;
        if (fs.existsSync(core_models_dir+'/'+ file+'/model.js')) {
            require(core_models_dir+'/'+ file+'/model.js');
        }
    });

    */
}
