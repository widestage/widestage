module.exports = function (app) {
    
    console.log('Module notifications loaded');
    addModulesUsedList('notifications');
    require('./models/notifications.js');
    require('./routes/notifications.js')(app);
    
}