module.exports = function (app) {

    console.log('Module reports loaded');
    addModulesUsedList('reports');
    require('./models/reports.js');
    require('./routes/reports.js')(app);
    require('./permissions.js');
}
