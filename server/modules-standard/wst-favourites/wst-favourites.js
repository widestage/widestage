module.exports = function (app) {

    console.log('Module favourites loaded');
    addModulesUsedList('favourites');
    require('./models/favourites.js');
    require('./routes/favourites.js')(app);
}
