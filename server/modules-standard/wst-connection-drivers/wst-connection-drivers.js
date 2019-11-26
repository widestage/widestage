module.exports = function (app) {

    console.log('Module connection-drivers loaded');
    addModulesUsedList('connection-drivers');
    //require('./models/connections.js');
    require('./routes/connection-drivers.js')(app);
    //require('./permissions.js');
}
