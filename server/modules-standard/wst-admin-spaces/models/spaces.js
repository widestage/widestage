var mongoose = require('mongoose');

var SpacesSchema = new mongoose.Schema({
    spaceDefinition: {},
    companyID: String
}, { collection: 'wst_Spaces' });


SpacesSchema.statics.getCompanySpace = function(req, done){

      Spaces.findOne({companyID:req.user.companyID},{},function(err, item){
          if (!item) {
              done({result: 0, msg: "Item not found."});
          }
          else {
              done({result: 1, item: item.toObject()});
          }
      });

}


var Spaces = connection.model('Spaces', SpacesSchema);
module.exports = Spaces;
