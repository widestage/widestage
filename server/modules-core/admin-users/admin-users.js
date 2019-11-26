module.exports = function (app) {

    console.log('Module users admin loaded');
    addModulesUsedList('users admin');
    require('./model.js');
    require('./routes.js')(app);
    require('./permissions.js');

}
