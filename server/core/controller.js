require('./rototype.js');

function Controller(model) {
    this.model = model;

    //this.searchFields = ['name'];
}

Controller.method('findAll', function (req, done) {
    var Model = this.model, perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var find = {}, searchText = (req.query.search) ? req.query.search : false, fields = {};
    var fieldsToGet = (req.query.fields) ? req.query.fields : false;

    if (page <= 0 )
            var params = {}
        else
            var params = (page) ? {skip: (page-1)*perPage, limit: perPage} : {};

    if (req.query.sort) {
        var sortField = {};

        sortField[req.query.sort] = (req.query.sortType) ? req.query.sortType : 1;

        params['sort'] = sortField;
    }

    if (fieldsToGet) {
        if (typeof fieldsToGet == 'string') {
            fields = JSON.parse(fieldsToGet);
        }
        else {
            for (var i in fieldsToGet) {
                fields[fieldsToGet[i]] = 1;
            }
        }
    }

    var mandatoryFilters = [];

    if (req.query.trash == true)
    {
        var trashField = {}
        trashField['nd_trash_deleted'] = false;

        mandatoryFilters.push(trashField);
    }

    if (req.query.userid == true)
    {
        var userField = {}
        userField[user_id] = req.user._id;

        mandatoryFilters.push(userField);
    }

    if (req.query.companyid == true)
    {
        var companyField = {}
        companyField['companyID'] = req.user.companyID;

        mandatoryFilters.push(companyField);
    }

    if (req.query.find)
    {
        for (var i in req.query.find)
            mandatoryFilters.push(req.query.find[i]);
    }

    var searchFind = {}

    if (searchText) {

        var findFields = [];
        var searchFields = this.searchFields;

        for (var i in searchFields) {
            var thisField = {};

            //thisField[searchFields[i]] = {$regex : searchText};
            thisField[searchFields[i]] = new RegExp(searchText, "i"); //"i" is for case-insensitive

            findFields.push(thisField);
        }
        searchFind =  (findFields.length > 0) ? {$or: findFields} : {};
    }

    if (searchFind != {})
        mandatoryFilters.push(searchFind);

    if (mandatoryFilters != [])
        find =  {$and: mandatoryFilters};

    //TODO: params don´t work with NEDB

    Model.find(find, fields, params, function(err, items){
        if(err) throw err;
        Model.count(find, function (err, count) {
            done({result: 1, page: page, pages: ((page) ? Math.ceil(count/perPage) : 1), count: count, perPage: perPage,  items: items});
        });
    });
});

Controller.method('findOne', function (req, done) {

    if (!req.query.id) {
        done({result: 0, msg: "'id' is required."});
        return;
    }

    var find = generateFindFields(req, req.query.id);

    if (req.query.find)
    {
        for (var i in req.query.find)
            find['$and'].push(req.query.find[i]);
    }


    this.model.findOne(find,{},function(err, item){
        if (!item) {
            done({result: 0, msg: "Item not found."});
        }
        else {
            done({result: 1, item: item.toObject()});
        }
    });
});

Controller.method('findOneV3', function (req, done) {
    var find = generateFindFields(req, req.params.id);

    var fieldsToGet = (req.query.fields) ? req.query.fields : false, fields = {};

    if (fieldsToGet) {
        if (typeof fieldsToGet == 'string') {
            fields[fieldsToGet] = 1;
        }
        else {
            for (var i in fieldsToGet) {
                fields[fieldsToGet[i]] = 1;
            }
        }
    }

    if (req.query.find) {
        try {
            req.query.find = JSON.parse(req.query.find);
        }
        catch(err) {}

        if (!req.query.find.length) {
            req.query.find = [req.query.find];
        }
        for (var i in req.query.find)
            find['$and'].push(req.query.find[i]);
    }

    if (this.model.load) {
        this.model.load(find,fields, function(err, item){
            //if(err) throw err; Si no encuentra el id salta el error?
            if (!item) {
                done({result: 0, msg: "Item not found."});
            }
            else {
                done({result: 1, item: item.toObject()});
            }
        });
    }
    else {
        this.model.findOne(find,fields,function(err, item){
            //if(err) throw err; Si no encuentra el id salta el error?
            if (!item) {
                done({result: 0, msg: "Item not found."});
            }
            else {
                done({result: 1, item: item.toObject()});
            }
        });
    }
});

Controller.method('findOneForServer', function (req, done) {
    if (!req.query.id) {
        done({result: 0, msg: "'id' is required."});
        return;
    }

    var find = generateFindFields(req, req.query.id);

    this.model.findOne(find,{},function(err, item){

        if (!item) {
            done({result: 0, msg: "Item not found."});
        }
        else {
            done({result: 1, item: item});
        }
    });
});

Controller.method('create', function (req, done) {
    var data = req.body;


    if (req.query.userid == true)
    {
        data.createdBy = (req.isAuthenticated()) ? req.user._id : null;
        data.createdOn = new Date();
    }

    if (req.query.companyid == true)
    {
        data.companyID = (req.isAuthenticated()) ? req.user.companyID : null;
    }

    if (req.query.trash == true)
    {
        data.nd_trash_deleted = false;
    }

    var user = (req.isAuthenticated()) ? req.user.username : "unsigned user";
    if (!data.nd_history) data.nd_history = [];

    data.nd_history.push({text:'Created on '+new Date()+' by '+user,
        user_id : (req.isAuthenticated()) ? req.user._id : null,
        user_name : (req.isAuthenticated()) ? req.user.username : null,
        user_companyID : (req.isAuthenticated()) ? req.user.companyID : null,
        user_companyName : (req.isAuthenticated()) ? req.user.companyName : null
    });



    this.model.create(data, function(err, item){
        if(err) throw err;
        done({result: 1, msg: "Item created", item: item.toObject()});
    });
});


Controller.method('update', function (req, done) {
    var data = req.body, id = data._id;

    var find = generateFindFields(req, id);

    delete(data.id);
    delete(data._id);

    if (req.query.userid == true)
    {
        data.user_id = (req.isAuthenticated()) ? req.user._id : null;
    }
    if (req.query.companyid == true)
    {
        data.companyID = (req.isAuthenticated()) ? req.user.companyID : null;
    }

    var user = (req.isAuthenticated()) ? req.user.username : "unsigned user";
    if (!data.nd_history) data.nd_history = [];

    data.nd_history.push({text:'Updated on '+new Date()+' by '+user,
        user_id : (req.isAuthenticated()) ? req.user._id : null,
        user_name : (req.isAuthenticated()) ? req.user.username : null,
        user_companyID : (req.isAuthenticated()) ? req.user.companyID : null,
        user_companyName : (req.isAuthenticated()) ? req.user.companyName : null
    });

    this.model.update(find, {$set: data }, function (err, result) {
        if(err) throw err;

        var numAffected = (typeof result.n == 'undefined') ? result.nModified : result.n; //MongoDB 2.X return n, 3.X return nModified?

        if (numAffected>0)
        {
            done({result: 1, msg: numAffected+" record updated."});
        } else {
            done({result: 0, msg: "Error updating record, no record have been updated"});
        }
    });
});

Controller.method('remove', function (req, done) {
    if (!req.params.id) {
        done({result: 0, msg: "'id' is required."});
        return;
    }

    var find = generateFindFields(req, req.params.id);
    this.model.remove(find, function (err, result) {
        if(err) throw err;


            done({result: 1, msg: "items deleted."});

    });
});

function generateFindFields(req, id)
{
    var mandatoryFilters = [];
    var idField = {};
    //idField = {_id:id}
    idField['_id'] = id;

    mandatoryFilters.push({_id:id});
    //var trashField = {}
    //trashField['nd_trash_deleted'] = false;

      //  mandatoryFilters.push(trashField);

    if (req.query.trash == true)
    {
        var trashField = {}
        trashField['nd_trash_deleted'] = false;

        mandatoryFilters.push(trashField);
    }

    if (req.query.userid == true)
    {
        var userField = {}
        userField[user_id] = req.user._id;

        mandatoryFilters.push(userField);
    }

    if (req.query.companyid == true)
    {
        var companyField = {}
        companyField['companyID'] = req.user.companyID;

        mandatoryFilters.push(companyField);
    }

    if (mandatoryFilters != [])
        return  {"$and": mandatoryFilters};
        else
        return {};

}

global.Controller = Controller;
