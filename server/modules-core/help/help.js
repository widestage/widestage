module.exports = function (app) {

    console.log('Module help loaded');
    addModulesUsedList('help');
    require('./routes/help.js')(app);
}
