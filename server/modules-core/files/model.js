var mongoose = require('mongoose');

var FilesSchema = new mongoose.Schema({
    companyID: {type: String, required: false},
    name: {type: String, required: true},
    type: {type: String, required: true},
    url: {type: String},
    size: {type: Number},
    level: {type:String},
    catalogType: {type:String},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    upload_user_id: {type: String},
    createdOn: { type: Date, default: Date.now }
}, { collection: 'wst_Files' });


global.registerDBModel('Files');
var Files = connection.model('Files', FilesSchema);
module.exports = Files;
