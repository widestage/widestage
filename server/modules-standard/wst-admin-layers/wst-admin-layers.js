module.exports = function (app) {

    console.log('Module layers loaded');
    addModulesUsedList('layers');
    require('./models/layers.js');
    require('./routes/layers.js')(app);
    require('./permissions.js');
}
