module.exports = function (app) {
    console.log('Module admin email templates');
    addModulesUsedList('adminEmailTemplates');
    require('./models/admin-email-templates.js');
    require('./routes/admin-email-templates.js')(app);
    require('./permissions.js');
}
