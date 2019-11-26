module.exports = function (app) {
    var Companies = require('./controller.js');

    app.get('/api/company/get-company-data', restrict, Companies.getCompanyData);
    app.post('/api/company/save-public-space',restrictRole(['SUPERADMIN']),Companies.savePublicSpace);
    app.post('/api/company/save-custom-css',restrictRole(['SUPERADMIN']),Companies.saveCustomCSS);
    app.post('/api/company/save-custom-logo',restrictRole(['SUPERADMIN']),Companies.saveCustomLogo);
    app.post('/api/company/save-setup',restrictRole(['SUPERADMIN']),Companies.saveSetup);

    app.get('/api/company/get-space',Companies.getSpace);
    
   // app.get('/api/config/companies/find-all', restrictRole(['SUPERADMIN']), ProCompanies.AdminFindAll);
//    app.get('/api/config/companies/find-one', restrictRole(['SUPERADMIN']), ProCompanies.AdminFindOne);
  //  app.post('/api/config/companies/create', restrictRole(['SUPERADMIN']), ProCompanies.AdminCreate);
    //app.post('/api/config/companies/update/:id', restrictRole(['SUPERADMIN']), ProCompanies.AdminUpdate);
    //app.post('/api/config/companies/delete/:id', restrictRole(['SUPERADMIN']), ProCompanies.AdminDelete);
    
    app.get('/api/company/get-custom-logo',Companies.getCustomLogo);

};
