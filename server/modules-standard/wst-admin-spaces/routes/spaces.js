module.exports = function (app) {
        var wstSpaces = require('../controllers/spaces.js');
        app.get('/api/v3/admin/spaces', restrict, wstSpaces.getSpaces);
        app.post('/api/v3/admin/spaces/:ID', restrict, wstSpaces.updateSpace);
        app.post('/api/v3/admin/spaces', restrict, wstSpaces.createSpace);
}
