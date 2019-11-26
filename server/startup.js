module.exports = function (app,configStartup) {

        var mongoose = require('mongoose');
        require('./core/mongoose')(mongoose);
        require('./core/companies/companies.js')(app);
        require('./core/auth-users/model.js');
        require('./core/authentication/authentication.js')(app);
        //require('./core/security/permissions.js');
        require('./core/security/security.js');
        require('./routes')(app,true); //authenticationEnabled
        global.modules = [];

        if (global.env == 'test' || global.env == 'dev' || global.env == 'local')
            mongoose.set('debug', true); //output all queries in test and dev mode

        var fs = require('fs');

        //Core modules
        var routes_dir = __dirname + '/'+'modules-core';
        fs.readdirSync(routes_dir).forEach(function (file) {
            if(file[0] === '.') return;

            if (fs.existsSync(routes_dir+'/'+ file+'/'+file+'.js')) {
                require(routes_dir+'/'+ file+'/'+file)(app);
                global.modules.push(file);
            }
        });



        //Standard modules
        var routes_dir = __dirname + '/'+'modules-standard';
        fs.readdirSync(routes_dir).forEach(function (file) {
            if(file[0] === '.') return;

            if (fs.existsSync(routes_dir+'/'+ file+'/'+file+'.js')) {
                require(routes_dir+'/'+ file+'/'+file)(app);
                global.modules.push(file);
            }

        });

        if (fs.existsSync(__dirname + '/'+'modules-pro')) {
            //Pro modules
            var routes_dir = __dirname + '/'+'modules-pro';
            fs.readdirSync(routes_dir).forEach(function (file) {
                if(file[0] === '.') return;
                if (fs.existsSync(routes_dir+'/'+ file+'/'+file+'.js')) {
                    global[file] = require(routes_dir+'/'+ file+'/'+file)(app);
                    global.modules.push(file);
                }

            });
        }




}
