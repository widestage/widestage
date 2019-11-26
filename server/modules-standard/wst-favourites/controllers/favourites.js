var favourites = connection.model('favourites');

exports.addToMyFavourites = function(req, res)
{
    favourites.addToMyFavourites(req, req.body.type, req.body.favID, function(result){
        serverResponse(req, res, 200, result);
    })
}

exports.removeFromMyFavourites = function(req, res)
{
    favourites.removeFromMyFavourites(req, req.body.type, req.body.favID, function(result){
        serverResponse(req, res, 200, result);
    })
}

exports.getMyFavourites = function(req, res)
{
    favourites.getMyFavourites(req,undefined, function(result){
        serverResponse(req, res, 200, result);
    })
}

exports.getMyFavouritesByType = function(req, res)
{
    var type = req.params.type;

    favourites.getMyFavourites(req,type, function(result){
        serverResponse(req, res, 200, result);
    })
}

exports.isThisInMyFavList = function(req, res)
{
    var type = req.params.type;
    var favID = req.params.favID;

    favourites.isThisInMyFavList(req,type,favID, function(result){
        serverResponse(req, res, 200, result);
    })
}
