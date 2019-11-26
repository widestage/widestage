module.exports = function (app) {
    var authUsers = require('../controllers/users.js');
    app.post('/api/v3/users/change-my-password',restrict, authUsers.changeMyPassword);

}
