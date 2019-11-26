module.exports = function (app) {

    console.log('Module dashboards loaded');
    addModulesUsedList('dashboards');
    require('./models/dashboards.js');
    require('./routes/dashboards.js')(app);
    require('./permissions.js');
}
