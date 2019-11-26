module.exports = function (app) {
    var communications = require('../controllers/communications.js');

    //app.get('/api/custom/Communications/find-all', restrict, communications.CommunicationsFindAll);
    app.get('/api/custom/Communications/get-communications', restrict, communications.getCommunications);
    //app.get('/api/custom/Communications/find-one', restrict, communications.CommunicationsFindOne);
    app.get('/api/custom/Communications/get-communication', restrict, communications.getCommunication);
    //app.post('/api/custom/Communications/update/:id', restrict, communications.CommunicationsUpdate);
    app.post('/api/custom/Communications/update-communication', restrict, communications.updateCommunication);

    app.get('/api/admin/communications/find-all', restrictRole('52988ac5df1fcbc201000008'), communications.adminCommunicationsFindAll);
    app.get('/api/admin/communications/find-one', restrictRole('52988ac5df1fcbc201000008'), communications.adminCommunicationsFindOne);
    app.post('/api/admin/communications/create', restrictRole('52988ac5df1fcbc201000008'), communications.adminCommunicationsCreate);
    app.post('/api/admin/communications/update/:id', restrictRole('52988ac5df1fcbc201000008'), communications.adminCommunicationsUpdate);
    app.post('/api/admin/communications/delete/:id', restrictRole('52988ac5df1fcbc201000008'), communications.adminCommunicationsDelete);
    app.post('/api/admin/communications/generate-for-companies', restrictRole('52988ac5df1fcbc201000008'), communications.adminCommunicationsGenerateForCompanies);
};