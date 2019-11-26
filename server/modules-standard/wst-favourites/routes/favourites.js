module.exports = function (app) {

        var wstFavourites = require('../controllers/favourites.js');
        app.post('/api/add-to-my-favourites', restrict, wstFavourites.addToMyFavourites);
        app.post('/api/remove-from-my-favourites', restrict, wstFavourites.removeFromMyFavourites);
        app.get('/api/get-my-favourites',restrict, wstFavourites.getMyFavourites);
        app.get('/api/:type/get-my-favourites',restrict, wstFavourites.getMyFavouritesByType);
        app.get('/api/:type/is-fav/:favID',restrict, wstFavourites.isThisInMyFavList);

}
