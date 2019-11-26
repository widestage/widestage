var mongoose = require('mongoose');

var QueueMessageBrokerV3Schema = new mongoose.Schema({
    queue: {type: String},
    deliveredBy: {type: String},
    processID: {type: String},
    message: {},
    created: {type: Date, default: Date.now}
}, { collection: 'v3_queueMessageBroker' });

QueueMessageBrokerV3Schema.statics.sendMessage = function (processID,queue,message,done) {
    processMessage(processID,queue,message,done);
}

function processMessage(processID,queue,message, done)
{
    if (queue === 'finalize-evaluation-questionary')
        processFinalizeEvaluationQuestionary(processID,message, function(){
            done();
        });
    if (queue === 'calculate-employee-TP')
        processCalculateEmployeeTP(processID,message, function(){
            done();
        });
    if (queue === 'calculate-employee-selfPerformance-TP')
        processCalculateEmployeeSelfPerformanceTP(processID,message, function(){
            done();
        });
}

function processFinalizeEvaluationQuestionary(processID,message,done)
{
    // go to the employee ratings to calculate the new ratings...
    var evaluation2Employee = require('../../modules-standard/v3-performance/models/evaluationToEmployee.js');
    evaluation2Employee.updateEmployeeWithNewEvaluation(message,function(updatedEmployee){
        if (updatedEmployee)
        {
            done();
        } else {
            console.log('something went wrong when updating employee with a new evaluation');
            saveToLog(undefined, 'something went wrong when updating employee with a new evaluation','FUNCTIONAL','ERROR','finalize evaluation questionary', '001','v3-performance','SUPERADMIN',{},'',processID);
            done();
        }
    })
}

function processCalculateEmployeeTP(processID,message,done)
{
    var calculateEmployeeTP = require('../../modules-standard/v3-performance/models/calculateEmployeeTP.js');
    calculateEmployeeTP.updateEmployeeTPRating(message,false,function(){
        //
        done();
    })
}


function processCalculateEmployeeSelfPerformanceTP(processID,message,done)
{
    var calculateEmployeeTP = require('../../modules-standard/v3-performance/models/calculateEmployeeTP.js');
    calculateEmployeeTP.updateEmployeeTPRating(message,true,function(){
        //
        done();
    })
}

global.registerDBModel('QueueMessageBrokerV3');
var QueueMessageBrokerV3 = connection.model('QueueMessageBrokerV3', QueueMessageBrokerV3Schema);
module.exports = QueueMessageBrokerV3;
