
exports.partial = function (req, res) {
    var name = req.params.name;
    res.render('partials/'+ name);
};

exports.controllerPartial = function (req, res) {
    var controller = req.params.controller;
    var name = req.params.name;
    res.render('partials/'+controller+'/'+name);
};

exports.controllerCustomPartial = function (req, res) {
    var controller = req.params.controller;
    var name = req.params.name;
    res.render('partials/custom/'+controller+'/'+name);
};

