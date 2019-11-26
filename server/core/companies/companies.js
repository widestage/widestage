module.exports = function (app) {
    
    console.log('Module companies admin loaded');
    addModulesUsedList('companies');
    require('./model.js');
    require('./routes.js')(app);
    
}