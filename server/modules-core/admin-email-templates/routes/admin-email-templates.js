module.exports = function (app) {
    var adminEmailTemplates = require('../controllers/admin-email-templates.js');
    app.post('/api/v3/admin/email/templates', restrict, adminEmailTemplates.createEmailTemplate);
    app.get('/api/v3/admin/email/templates', restrict, adminEmailTemplates.getEmailTemplates);
    app.post('/api/v3/admin/email/templates/:templateID', restrict, adminEmailTemplates.updateEmailTemplate);
    app.get('/api/v3/admin/email/templates/:templateID', restrict, adminEmailTemplates.getEmailTemplate);
}
