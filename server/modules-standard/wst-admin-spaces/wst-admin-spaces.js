module.exports = function (app) {

    console.log('Module spaces loaded');
    addModulesUsedList('spaces');
    require('./models/spaces.js');
    require('./routes/spaces.js')(app);
    require('./permissions.js');
}
