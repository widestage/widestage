var mongoose = require('mongoose');


var RolesSchema = new mongoose.Schema({
    companyID: {type: String, required: false},
    name: {type: String, required: true},
    description: {type: String},
    permissions: [],
    grants: [],
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wice_Roles' });



global.registerDBModel('Roles');
var Roles = connection.model('Roles', RolesSchema);
module.exports = Roles;
