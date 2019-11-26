module.exports = function (app) {
    
    console.log('Module logs loaded');
    addModulesUsedList('logs');
    require('./model.js');
    require('./routes.js')(app);
    
}

global.logsModule = true;

function saveToLog(req, text, type, logType, family, code,module,recipient,otherInfo,associatedID,transactionID) {
    var Logs = global.connection.model('Logs');

    Logs.saveToLog(req, {text: text, type: type, logType: logType,logFamily:family, module:module,recipient:recipient, code: code,associatedID:associatedID,transactionID:transactionID},otherInfo, function(){

    });
};
global.saveToLog = saveToLog;
