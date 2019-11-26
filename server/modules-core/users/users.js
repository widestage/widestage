module.exports = function (app) {

    console.log('Module users loaded');
    addModulesUsedList('users');

    require('./routes/users.js')(app);
}
