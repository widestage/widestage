
module.exports = function (app,authenticationEnabled) {

    var bodyTemplate = __dirname +'/../public/themes/'+config.theme+'/templates/index_body.html';
    var javascripts = __dirname +'/../public/themes/'+config.theme+'/templates/javascripts.html';
    var stylesheets = __dirname +'/../public/themes/'+config.theme+'/templates/stylesheets.html';
    
    var pageProps = {
        appName:config.appName,
        appDescription:config.appDescription,
        appURL:config.appURL,
        theme:config.theme,
        bodyTemplate:bodyTemplate,
        javascripts:javascripts,
        stylesheets:stylesheets
    }
                
    if (authenticationEnabled)
    {
        app.get('/', restrict, function(req, res) {
            getJS(function(theScripts, theCSSs){
                pageProps.scripts = theScripts;
                pageProps.csss = theCSSs;
                res.render('index',pageProps);
            });
            
        });
    } else { //no authentication free to enter in the home page
        app.get('/', function(req, res) {
            getJS(function(theScripts, theCSSs){
                pageProps.scripts = theScripts;
                pageProps.csss = theCSSs;
                res.render('index',pageProps);
            });
        });
    }

    app.get('/company-not-found', function(req, res, next) {
        res.render('companyNotFound',{appName:config.appName,appURL:config.appURL,theme:config.theme});
    });

    /* PASSTHROUGH */
    app.get('*', passthrough);
    app.post('*', passthrough);

}


function getJS(done)
{
    var theScripts = [];
    var theCSSs = [];
    
    scanModulesDir('core',function(scripts,csss){
        for (var s in scripts)
            theScripts.push(scripts[s]);
        for (var c in csss)
            theCSSs.push(csss[c]);
        scanModulesDir('standard',function(scripts,csss){
            for (var s in scripts)
                theScripts.push(scripts[s]);
            for (var c in csss)
                theCSSs.push(csss[c]);
            scanModulesDir('pro',function(scripts,csss){
                for (var s in scripts)
                    theScripts.push(scripts[s]);
                for (var c in csss)
                    theCSSs.push(csss[c]);
                    
                scanThemesDir(config.theme,function(scripts,csss){
                    for (var s in scripts)
                        theScripts.push(scripts[s]);
                    for (var c in csss)
                        theCSSs.push(csss[c]);
                        
                    done(theScripts,theCSSs);
                });  
                    
                    
                
            });
        });
    });
    
    /*
    var fs = require('fs');
       
       
       //Core modules
        var routes_dir =  __dirname +'/../public/modules-core';
        fs.readdirSync(routes_dir).forEach(function (file) {
            if(file[0] === '.') return;
               
                var module_dir =  routes_dir+'/'+ file;
                fs.readdirSync(module_dir).forEach(function (module_file) {
                    if(module_file[0] === '.') return;
                    if(module_file === 'views') return;
                    if (module_file.indexOf('.js') > 0) //is a JS file
                    {
                        if (fs.existsSync(module_dir+'/'+module_file)) {
                            theScripts.push('modules-core/'+file+'/'+module_file);
                        }
                    }
                    
                    if (module_file === 'css')
                    {
                        var css_dir = module_dir+'/css';
                        fs.readdirSync(css_dir).forEach(function (css_file) {
                            if(css_file[0] === '.') return;
                            if (css_file.indexOf('.css') > 0) //is a CSS file
                            {
                                if (fs.existsSync(css_dir+'/'+css_file)) {
                                    theCSSs.push('modules-core/'+css_dir+'/'+css_file);
                                }
                            }
                        })
                    }
                    
                });
        });
       
        
        var routes_dir =  __dirname +'/../public/modules-standard';
        if (fs.existsSync(routes_dir)) {
            fs.readdirSync(routes_dir).forEach(function (file) {
                if(file[0] === '.') return;
                   
                    var module_dir =  routes_dir+'/'+ file;
                    fs.readdirSync(module_dir).forEach(function (module_file) {
                        if(module_file[0] === '.') return;
                        if(module_file === 'views') return;
                        if (module_file.indexOf('.js') > 0) //is a JS file
                        {
                            if (fs.existsSync(module_dir+'/'+module_file)) {
                                theScripts.push('modules-standard/'+file+'/'+module_file);
                            }
                        }
                    });
            });
        }
        
        
        //Pro modules
        var routes_dir =  __dirname +'/../public/modules-pro';
        if (fs.existsSync(routes_dir)) {
            fs.readdirSync(routes_dir).forEach(function (file) {
                if(file[0] === '.') return;
                   
                    var module_dir =  routes_dir+'/'+ file;
                    fs.readdirSync(module_dir).forEach(function (module_file) {
                        if(module_file[0] === '.') return;
                        if(module_file === 'views') return;
                        if (module_file.indexOf('.js') > 0) //is a JS file
                        {
                            if (fs.existsSync(module_dir+'/'+module_file)) {
                                theScripts.push('modules-pro/'+file+'/'+module_file);
                            }
                        }
                    });
            });
        }
        */
        
        
}

function scanModulesDir(type,done)
{
    var theScripts = [];
    var theCSSs = [];
    var fs = require('fs');
    
        var routes_dir =  __dirname +'/../public/modules-'+type;
        if (fs.existsSync(routes_dir)) {
            fs.readdirSync(routes_dir).forEach(function (file) {
                if(file[0] === '.') return;
                   
                    var module_dir =  routes_dir+'/'+ file;
                    fs.readdirSync(module_dir).forEach(function (module_file) {
                        if(module_file[0] === '.') return;
                        if(module_file === 'views') return;
                        if (module_file.indexOf('.js') > 0) //is a JS file
                        {
                            if (fs.existsSync(module_dir+'/'+module_file)) {
                                theScripts.push('modules-'+type+'/'+file+'/'+module_file);
                            }
                        }
                        
                        if (module_file === 'css')
                        {
                            var css_dir = module_dir+'/css';
                            fs.readdirSync(css_dir).forEach(function (css_file) {
                                if(css_file[0] === '.') return;
                                if (css_file.indexOf('.css') > 0) //is a CSS file
                                {
                                    if (fs.existsSync(css_dir+'/'+css_file)) {
                                        theCSSs.push('modules-'+type+'/'+file+'/css/'+css_file);
                                    }
                                }
                            })
                        }
                        
                    });
            });
        }
    done(theScripts,theCSSs)
}

function scanThemesDir(theme,done)
{
    var theScripts = [];
    var theCSSs = [];
    var fs = require('fs');
    
        var routes_dir =  __dirname +'/../public/themes/'+theme;
        if (fs.existsSync(routes_dir)) {
            fs.readdirSync(routes_dir).forEach(function (file) {
                if(file[0] === '.') return;
                   
                    var module_dir =  routes_dir+'/'+ file;
                    fs.readdirSync(module_dir).forEach(function (module_file) {
                        if(module_file[0] === '.') return;
                        if(module_file === 'views') return;
                        if (module_file.indexOf('.js') > 0) //is a JS file
                        {
                            if (fs.existsSync(module_dir+'/'+module_file)) {
                                theScripts.push('themes/'+theme+'/'+file+'/'+module_file);
                            }
                        }
                        
                        if (module_file === 'css')
                        {
                            var css_dir = module_dir+'/css';
                            fs.readdirSync(css_dir).forEach(function (css_file) {
                                if(css_file[0] === '.') return;
                                if (css_file.indexOf('.css') > 0) //is a CSS file
                                {
                                    if (fs.existsSync(css_dir+'/'+css_file)) {
                                        theCSSs.push('themes/'+theme+'/'+file+'/css/'+css_file);
                                    }
                                }
                            })
                        }
                        
                        
                    });
            });
        }
    done(theScripts,theCSSs)
}