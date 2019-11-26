var mongoose = require('mongoose');

var adminEmailTemplatesSchema = new mongoose.Schema({
    companyID: {type: String},
    type: {type: Number}, //1-NodeDream, 2-Custom
    language: {type: String},
    code: {type: String},
    name: {type: String},
    description: {type: String},
    subject: {type: String},
    body: {type: String},
    modules: {type: Array},
    translations: {type: Array},
    tags: {type: Array},
    created: {type: Date, default: Date.now},
    modified: {type: Date}
}, { collection: 'wice_Email_Templates' });

var AdminEmailTemplates = connection.model('AdminEmailTemplates', adminEmailTemplatesSchema);
module.exports = AdminEmailTemplates;
