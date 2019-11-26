module.exports = function (app) {
    
    console.log('Module Queue Message Broker V3 loaded');
    addModulesUsedList('queueMessageBrokerV3');
    require('./model.js');
    
}