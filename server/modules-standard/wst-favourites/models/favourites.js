var mongoose = require('mongoose');

var FavouritesSchema = new mongoose.Schema({
    type: String,
    favID: String,
    userID: String
}, { collection: 'wst_Favourites' });

FavouritesSchema.statics.addToMyFavourites = function(req, type, favID, done){

  this.findOne({type:type,favID:favID,userID:req.user._id},{},function(err, item){
        if (!item)
        {
            var companyID = (req.user) ? req.user.companyID : null;

                var fav = {
                    type: type,
                    favID: favID,
                    userID : (req.isAuthenticated()) ? req.user._id : null
                };

            this.create(fav, function(err, fav2){
                if(err) throw err;

                if (typeof done != 'undefined') done({result: 1, msg: "Fav added"});
            });
        } else {
          done({result: 0, msg: "Fav already added"});
        }
  })
  
}

FavouritesSchema.statics.removeFromMyFavourites = function(req, type, favID, done){

    var companyID = (req.user) ? req.user.companyID : null;

    this.remove({favID:favID,type:type}, function (err, result) {
        if(err) throw err;

        if (typeof done != 'undefined') done({result: 1, msg: "Fav removed"});
    });
}

FavouritesSchema.statics.getMyFavourites = function(req, type, done) {
    //TODO: Change favourites for their own collection instead of using users, users should be only for core user management

    var find = {userID: req.user._id}
    if (type)
        find = {userID: req.user._id, type:type}

    this.find(find, {}, function(err, favs) {
        if (err) throw err;

        var favouritedDashboards = [];
        var favouritedReports = [];

        for (var f in favs)
        {
            if (favs[f].type == 'dashboard')
                    favouritedDashboards.push(favs[f].favID)
            if (favs[f].type == 'report')
                    favouritedReports.push(favs[f].favID)

        }

        if (!type)
        {
              var Dashboards = connection.model('Dashboards');
              var Reports = connection.model('Reports');

              Dashboards.find({companyID: req.user.companyID, nd_trash_deleted: false, _id: {$in: favouritedDashboards}}, {dashboardName: 1}, function(err, dashboards) {
                  if (err) throw err;

                  for (var i in dashboards) {
                      favourites.push({type: "Dashboard", relationedName: dashboards[i].dashboardName, relationedID: dashboards[i]._id});
                  }

                  Reports.find({companyID: req.user.companyID, nd_trash_deleted: false, _id: {$in: favouritedReports}}, {reportName: 1}, function(err, reports) {
                      if (err) throw err;

                      for (var i in reports) {
                          favourites.push({type: "report", relationedName: reports[i].reportName, relationedID: reports[i]._id});
                      }

                      done({result: 1, favourites: favourites})
                  });
              });
          } else {
                if (type == 'report')
                {
                      var Reports = connection.model('Reports');
                      Reports.find({companyID: req.user.companyID, nd_trash_deleted: false, _id: {$in: favouritedReports}}, {reportName: 1}, function(err, reports) {
                          if (err) throw err;

                          for (var i in reports) {
                              favourites.push({type: "report", relationedName: reports[i].reportName, relationedID: reports[i]._id});
                          }

                          done({result: 1, favourites: favourites})
                      });
                }
                if (type == 'dashboard')
                {
                      var Dashboards = connection.model('Dashboards');
                      Dashboards.find({companyID: req.user.companyID, nd_trash_deleted: false, _id: {$in: favouritedDashboards}}, {dashboardName: 1}, function(err, dashboards) {
                          if (err) throw err;

                          for (var i in dashboards) {
                              favourites.push({type: "Dashboard", relationedName: dashboards[i].dashboardName, relationedID: dashboards[i]._id});
                          }
                          done({result: 1, favourites: favourites});
                      });
                }


          }
    });
}

FavouritesSchema.statics.isThisInMyFavList = function(req,type,favID,done)
{
      find = {userID: req.user._id, type:type,favID:favID}

      this.findOne(find, {}, function(err, fav) {
          if (fav)
              done({result: 1, isFav: true});
            else {
              done({result: 1, isFav: false});
            }
      })

}

var favourites = connection.model('favourites', FavouritesSchema);
module.exports = favourites;
