module.exports = function (app) {
    
    console.log('Module socket loaded');
    addModulesUsedList('socket');
    require('./routes/socket.js')(app);
    
}


var io = require('socket.io')(http);