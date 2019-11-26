module.exports = function (app) {

    console.log('Module connections loaded');
    addModulesUsedList('connections');
    require('./models/connections.js');
    require('./routes/connections.js')(app);
    require('./permissions.js');
}
