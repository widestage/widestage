module.exports = function (app) {

    console.log('Module wst-admin-users loaded');
    addModulesUsedList('wst-admin-users');
    require('./routes.js')(app);

}
