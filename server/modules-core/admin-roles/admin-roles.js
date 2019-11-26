module.exports = function (app) {

    console.log('Module roles admin loaded');
    addModulesUsedList('roles admin');
    require('./model.js');
    require('./routes.js')(app);
    require('./permissions.js');

}
