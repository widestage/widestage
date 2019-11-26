module.exports = function (app) {

    console.log('Module permissions loaded');
    addModulesUsedList('permissions');
    require('./model.js');
    require('./routes.js')(app);

}
