module.exports = function (app) {

var HelpDocs = require('../controllers/help.js');

app.get('/api/v3/help/:language/:document',  HelpDocs.getDocument);

}
