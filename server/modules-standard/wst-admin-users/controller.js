exports.getUserCounts = function(req,res){
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var theCounts = {};

        //get all reports
        var Reports = connection.model('Reportsv2');
        Reports.count({companyID: companyID,owner:userID,isPublic:true,nd_trash_deleted:false}, function (err, reportCount) {
            theCounts.publishedReports = reportCount;
            //get all dashboards
            var Dashboards = connection.model('Dashboardsv2');
            Dashboards.count({companyID: companyID,owner:userID,isPublic:true,nd_trash_deleted:false}, function (err, dashCount) {
                theCounts.publishedDashBoards = dashCount;

                Reports.count({companyID: companyID,owner:userID,isPublic:false,nd_trash_deleted:false}, function (err, privateReportCount) {
                    theCounts.privateReports = privateReportCount;

                    var Dashboards = connection.model('Dashboardsv2');
                    Dashboards.count({companyID: companyID,owner:userID,isPublic:false,nd_trash_deleted:false}, function (err, privateDashCount) {
                        theCounts.privateDashBoards = privateDashCount;
                        serverResponse(req, res, 200, theCounts);
                    });
                });

            });
        });


};

exports.getUserReports = function(req,res){
    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var Reports = connection.model('Reportsv2');
    Reports.find({companyID: companyID,owner:userID,nd_trash_deleted:false},{reportName:1,parentFolder:1,isPublic:1,reportType:1,reportDescription:1,status:1}, function (err, reports) {
        serverResponse(req, res, 200, {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: reports});
    });
}

exports.getUserDashboards = function(req,res){
    var perPage = config.pagination.itemsPerPage, page = (req.query.page) ? req.query.page : 1;
    var userID = req.query.userID;
    var companyID = req.user.companyID;
    var Dashboards = connection.model('Dashboardsv2');
    Dashboards.find({companyID: companyID,owner:userID,nd_trash_deleted:false},{dashboardName:1,parentFolder:1,isPublic:1,dashboardDescription:1,status:1}, function (err, privateDashCount) {
        serverResponse(req, res, 200, {result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count/perPage) : 1), items: privateDashCount});
    });
}
