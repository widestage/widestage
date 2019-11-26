module.exports = function (app) {

    console.log('Module wst-objects loaded');
    addModulesUsedList('wst-objects');
    require('./routes.js')(app);
    require('./permissions.js');

}
