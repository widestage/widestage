var mongoose = require('mongoose');


var ConnectionsSchema = new mongoose.Schema({
    companyID: {type: String, required: false},
    name: {type: String, required: true},
    type: {type: String, required: true},
    status: {type: String, required: true}, //-1 error, 0 not active, 1 active
    params:  {},
    limits: {},
    //a params  quotedElementNames: {type: Boolean, required: true, default: false},
    //a params cacheTime: {type: Number, required: true, default: 60},
    //params.packetSize
    //a limits limitUsage: {type: Boolean, required: true, default: false},
    //a limits usageLimit: {type: Number}, //bytes
    //a limits limitExecutions: {type: Boolean, required: true, default: false},
    //a limits limitOfExecutions: {type: Number},
    //a statistics totalUsage: {type: Number}, //bytes
    //a statistics numberOfExecutions: {type: Number},
    //a statistics usageStatistics: {type: Object},
    version: {type: Number, required: true, default: 1},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    createdBy: {type: String},
    createdOn: {type: Date},
    statusInfo: {type: Object}
}, { collection: 'wst_Connections' });



ConnectionsSchema.statics.changeStatus = function(req, ConnectionID, status, done){
//-1 error, 0 not active, 1 active

            Connections.update({_id:ConnectionID}, {$set: {status: status}}, function (err, result) {
                if(err) throw err;
                var numAffected = (typeof result.n == 'undefined') ? result.nModified : result.n; //MongoDB 2.X return n, 3.X return nModified?
                if (numAffected>0)
                {
                    done({result: 1, msg: numAffected+" Connection updated."});
                } else {
                    done({result: 0, msg: "Error updating Connection, no record have been updated for Connection: "+ConnectionID});
                }
            });
}

ConnectionsSchema.statics.setStatusInfo = function(req, ConnectionID, status, done){
//-1 error, 0 not active, 1 active

            Connections.update({_id:ConnectionID}, {$set: {status: status}}, function (err, result) {
                if(err) throw err;
                var numAffected = (typeof result.n == 'undefined') ? result.nModified : result.n; //MongoDB 2.X return n, 3.X return nModified?
                if (numAffected>0)
                {
                    done({result: 1, msg: numAffected+" record updated."});
                } else {
                    done({result: 0, msg: "Error updating record, no record have been updated for Connection: "+ConnectionID});
                }
            });
}

ConnectionsSchema.statics.invalidateConnection = function(req, ConnectionID, errorcode,actioncode,msg, done){
    //Change the status of the Connection to -1
    //Search for all layers that uses the Connection and change the status to -1 (temporay unavailable)
    //For every layer search for every repors that use the layer and change the status to -1 (temporary unavailable)
    //For every layer search for every dashboard that has reports that uses the layer and change the status of the dashboard to -1 (temporary unavailable)
    //theConnection.status = -1;
    //theConnection.statusInfo = {errorCode:data.code,actionCode:data.actionCode,message:data.msg,lastDate:new Date()}

                    //Connections.changeStatus(req,ConnectionID,-1,function(result){
                        
                        var statusInfo = {type:'ALERT',errorCode:errorcode,actionCode:actioncode,message:msg,lastDate:new Date()}
                    //});



                    Connections.update({_id:ConnectionID}, {$set: {status: -1,statusInfo:statusInfo}}, function (err, result) {
                            if(err) throw err;
                            var numAffected = (typeof result.n == 'undefined') ? result.nModified : result.n; //MongoDB 2.X return n, 3.X return nModified?
                            if (numAffected>0)
                            {
                                done({result: 1, msg: numAffected+" record updated."});
                            } else {
                                done({result: 0, msg: "Error updating record, no record have been updated for Connection: "+ConnectionID});
                            }
                        });


}



global.registerDBModel('Connections');
var Connections = connection.model('Connections', ConnectionsSchema);
module.exports = Connections;
global.Connections = Connections;
