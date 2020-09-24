
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
        logoSmall: '/images/logo-small.png',
        logoMedium: '/images/logo-medium.png',
        customCSS: '',
        stylesheets:stylesheets
    }
                
    if (authenticationEnabled)
    {
        app.get('/', restrict, function(req, res) {
            getCompanyCustomization(req.user.companyID,function(results)
            {
                if (results.result == 1)
                {
                    pageProps.logoSmall = results.companyDefaults.logoSmall;
                    pageProps.logoMedium = results.companyDefaults.logoMedium;
                    pageProps.customCSS = results.companyDefaults.customCSS;
                    getJS(function(theScripts, theCSSs){
                        pageProps.scripts = theScripts;
                        pageProps.csss = theCSSs;
                        res.render('index',pageProps);
                    });
                }
            })
            
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
    
   /*SHARED RESOURCES*/

    app.get('/sh/:resourceType/:resourceID', function(req, res) {

        var SharedResources = connection.model('SharedResources')
        SharedResources.getSharedResource(req, function(result) {
            if (result.result == 1 && result.item && result.item.resourceID == req.params.resourceID && (result.item.sharedLinkOption == 'Anyone' || result.item.sharedLinkOption == 'iFrame'))
            {
                if (result.item.sharedLinkOption == 'iFrame')
                    pageProps.sharedBodyTemplate = __dirname +'/../public/themes/'+config.theme+'/templates-shared/iframe_body.html';
                    else
                    pageProps.sharedBodyTemplate = __dirname +'/../public/themes/'+config.theme+'/templates-shared/index_body.html';
                pageProps.sharedJavascripts = __dirname +'/../public/themes/'+config.theme+'/templates-shared/javascripts.html';
                pageProps.sharedStylesheets = __dirname +'/../public/themes/'+config.theme+'/templates-shared/stylesheets.html';

                sharedGetJS(req.params.resourceType,function(theScripts, theCSSs){
                    pageProps.scripts = theScripts;
                    pageProps.csss = theCSSs;
                    res.render('shared',pageProps);
                });
            } else {
                
                //sorry that resource is not shared...
                pageProps.sharedStylesheets = __dirname +'/../public/themes/'+config.theme+'/templates-shared/stylesheets.html';
                pageProps.errorMsg = "Sorry that resource is not shared or doesn't exists anymore..."
                res.render('error',pageProps);
            }
        });
    }); 

    app.get('/company-not-found', function(req, res, next) {
         pageProps.sharedStylesheets = __dirname +'/../public/themes/'+config.theme+'/templates-shared/stylesheets.html';
                pageProps.errorMsg = "Sorry that company URL doesn't exists or is not active anymore..."
                res.render('error',pageProps);
    });

    /* PASSTHROUGH */
    app.get('*', passthrough);
    app.post('*', passthrough);

}


function getCompanyCustomization(companyID,done)
{

        var Companies = connection.model('Companies');

        Companies.findOne({_id: companyID}, {customization: 1}, function (err, company) {
            if (err) {
                saveToLog(req, 'Error on login when searching for company ' + err.message,'SECURITY','ERROR','LOGIN', '006','AUTHENTICATION','SUPERADMIN',{},'','');
                done({result:0,msg:'Error on login when searching for company ' + err.message})
            }

            var customLogoSmall = '/images/logo-small.png';
            var customLogoMedium = "/images/logo-medium.png";
            var customCSS = "";

            if (company) {
                if (company.customization)
                {
                    if (company.customization.logoSmall)
                        customLogoSmall = company.customization.logoSmall; 
                    if (company.customization.logoMedium)
                        customLogoMedium = company.customization.logoMedium; 
                    if (company.customization.customCSS)
                        customCSS = company.customization.customCSS; 
                    
                }
                done({result:1,companyDefaults: {
                            logoSmall: customLogoSmall,
                            logoMedium: customLogoMedium,
                            customCSS: customCSS
                        }});
            }
            else {
                done({result:0,msg:'Company not found'})
            }
        });
    


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
                                theScripts.push('/themes/'+theme+'/'+file+'/'+module_file);
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
                                        theCSSs.push('/themes/'+theme+'/'+file+'/css/'+css_file);
                                    }
                                }
                            })
                        }
                        
                        
                    });
            });
        }
    done(theScripts,theCSSs)
}



/*SHARED RESOURCES*/
function sharedGetJS(resource,done)
{
    var theScripts = [];
    var theCSSs = [];

    /*  
    sharedScanModulesDir('core',undefined,function(scripts,csss){
        for (var s in scripts)
            theScripts.push(scripts[s]);
        for (var c in csss)
            theCSSs.push(csss[c]);
        sharedScanModulesDir('standard',resource,function(scripts,csss){
            for (var s in scripts)
                theScripts.push(scripts[s]);
            for (var c in csss)
                theCSSs.push(csss[c]);
            sharedScanModulesDir('pro',resource,function(scripts,csss){
                for (var s in scripts)
                    theScripts.push(scripts[s]);
                for (var c in csss)
                    theCSSs.push(csss[c]);
    */
                    for (var s in global.sharing)
                    {
                        if (global.sharing[s].module == resource)
                        {
                            for( var f in global.sharing[s].files)
                                theScripts.push(global.sharing[s].files[f]);
                        }
                    }
                    
                scanThemesDir(config.theme,function(scripts,csss){
                    for (var s in scripts)
                        theScripts.push(scripts[s]);
                    for (var c in csss)
                        theCSSs.push(csss[c]);
                        
                    done(theScripts,theCSSs);
                });  
                    
                    
                
           // });
        //});
    //});
}


function sharedScanModulesDir(type,resource,done)
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
                            if (module_file == resource+'.js' || !resource)
                            {
                                if (fs.existsSync(module_dir+'/'+module_file)) {
                                    theScripts.push('/modules-'+type+'/'+file+'/'+module_file);
                                }
                            }
                        }
                        
                        if (module_file === 'css')
                        {
                            var css_dir = module_dir+'/css';
                            fs.readdirSync(css_dir).forEach(function (css_file) {
                                if(css_file[0] === '.') return;
                                if (css_file.indexOf('.css') > 0) //is a CSS file
                                {
                                    if (module_file == resource+'.js'  || !resource)
                                    {
                                        if (fs.existsSync(css_dir+'/'+css_file)) {
                                            theCSSs.push('/modules-'+type+'/'+file+'/css/'+css_file);
                                        }
                                    }
                                }
                            })
                        }
                        
                    });
            });
        }
    done(theScripts,theCSSs)
}
