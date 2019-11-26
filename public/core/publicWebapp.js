var app = angular.module('wice', ['ui.router', 'ui.bootstrap', 'angularUUID2', 'bsLoadingOverlay', 'ui.grid','ui.grid.cellNav', 'ui.grid.resizeColumns', 'ui.grid.pinning',
        'ui.grid.moveColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping', 'tg.dynamicDirective', 'draganddrop','dx','ui.select']);

app.run(function (bsLoadingOverlayService, $rootScope) {
  bsLoadingOverlayService.setGlobalConfig({
    delay: 0, // Minimal delay to hide loading overlay in ms.
    activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
    templateUrl: 'home/views/loading-overlay-template.html' // Template url for overlay element. If not specified - no overlay element is created.
  });

  $rootScope.removeFromArray = function(array, item) {
    var index = array.indexOf(item);

    if (index > -1) array.splice(index, 1);
  };
});

app.service('queryService', function() {
  var theQuery = {};

  var addQuery = function(newObj) {
      theQuery = newObj;
  };

  var getQuery = function(){
      return theQuery;
  };

  return {
    addQuery: addQuery,
    getQuery: getQuery
  };

});

app.service('reportService', function() {
  var theReport = {};

  var addReport = function(newObj) {
      theReport = newObj;
  };

  var getReport = function(){
      return theReport;
  };

  return {
    addReport: addReport,
    getReport: getReport
  };

});

app.factory('PagerService', function() {
    // service definition
    var service = {};

    service.GetPager = GetPager;

    return service;

    // service implementation
    function GetPager(totalItems, currentPage, pageSize, totalPages) {
        // default to first page
        currentPage = currentPage || 1;

        // default page size is 10
        pageSize = pageSize || 10;

        // calculate total pages
        //totalPages = totalPages Math.ceil(totalItems / pageSize);

        var startPage, endPage;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        //var pages = range(startPage, endPage + 1,1);

        var pages = [];
        var i = startPage;
        while (i < endPage +1) {
            pages.push(i);
            i++;
            }

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
});