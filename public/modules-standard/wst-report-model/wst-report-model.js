app.service('reportModel' , function (queryModel,bsLoadingOverlayService,connection,uuid2) {

    this.report = {};

    this.getTheReport = function()
    {
        return this.report;
    }

    this.getReportDefinition = function(id,isLinked,mode,done)
    {
        connection.get('/api/v3/reports/view/'+id, {id: id, mode: mode, linked:isLinked}, function(data) {
            if (data.item)
            {
                //report = data.item;
                done(data.item);
            } else {
                done(null);
            }
        });
    }

    this.setReport = function(report,parentDiv,mode,done)
    {
        setReport(report,parentDiv,mode,done);
    }


    function setReport(report,parentDiv,mode,done)
    {

        this.report = report;

        queryModel.selectedReport = report;
        showOverlay(parentDiv);
        var isLinked = false;

        //queryModel.loadQuery(report.query);
        //queryModel.detectLayerJoins();

        queryModel.getQueryData2(report.query, function(data,sql,query,fromCache, executionTime){
                    report.query.data = data;
                    report.query.sql = sql;
                    report.query.fromCache = (fromCache);
                    report.query.executionTime = (executionTime) ? executionTime : 0;
                    report.parentDiv = parentDiv;
                    repaintReport(report,mode);
                    done(sql);
                    hideOverlay(parentDiv);
            }, report);

    }

    this.prepareReport = function(report,parentDiv,mode)
    {
        prepareReport(report,parentDiv,mode);
    }


    function prepareReport(report,parentDiv,mode)
    {

      this.report = report;
      queryModel.selectedReport = report;
      var isLinked = false;
      report.parentDiv = parentDiv;

        if (report && report.query && report.query.columns && report.query.columns.length > 0)
        {
            //var el = document.getElementById('reportLayout');
            //angular.element(el).empty();
            //$scope.gettingData == true;
            //$scope.showOverlay('OVERLAY_reportLayout');

            if (report.reportType == 'grid' || report.reportType == 'vertical-grid'
                || report.reportType == 'dxPivot'  || report.reportType == 'dxGrid')
                {
                    repaintReport(report,mode);
                }

            if (report.reportType == 'chart-line' || report.reportType == 'chart-donut' || report.reportType == 'chart-pie' || report.reportType == 'gauge')
            {

              var xKeys = [];
              var yKeys = [];
              for (var c in report.query.columns)
              {
                  if (report.query.columns[c].elementRole == 'dimension' && !report.query.columns[c].hidden)
                    xKeys.push(report.query.columns[c]);

                    if (report.query.columns[c].elementRole == 'measure'  && !report.query.columns[c].hidden)
                      yKeys.push(report.query.columns[c]);
              }

                if (xKeys.length > 0 && yKeys.length > 0 )
                {

                  if(!report.properties)
                      report.properties = {};
                  if(!report.properties.chart)
                      report.properties.chart = {};

                      if (report.reportType == 'chart-line')
                          report.properties.chart.type = 'bar';


                    report.properties.chart.dataColumns = yKeys;


                    var customObjectData = xKeys[0];
                    report.properties.chart.dataAxis = {elementName:customObjectData.elementName,
                        queryName:'query1',
                        elementLabel:customObjectData.objectLabel,
                        id:customObjectData.id,
                        type:'bar',
                        color:'#000000'}

                    repaintReport(report,mode);
                }
            }

            if ( report.reportType == 'indicator')
            {
                //reportModel.prepareReport(report,'reportLayout',$scope.mode);
                repaintReport(report,mode);
            }
        }
    }


    this.getReportDataNextPage = function(report,page)
    {
        getReportDataNextPage(report,page);
    }

    function getReportDataNextPage(report,page)
    {

        queryModel.getQueryDataNextPage(report.query,page, function(data,sql,query, fromCache, executionTime){
                report.query.data.push.apply(report.query.data, data);
                report.query.fromCache = (fromCache);
                report.query.executionTime = (executionTime) ? executionTime : 0;
            });
    }

    this.repaintReport = function(report,mode)
    {
        this.report = report;
        repaintReport(report,mode);
    }

    function repaintReport(report,mode)
    {
        var data = report.query.data;

        if (data.length != 0)
            {
        switch(report.reportType)
            {
                case "grid":
                    {

                      //generateGrid(report,mode);
                      if (report.properties.grid && report.properties.grid.refresh)
                          report.properties.grid.refresh();
                    }
                    break;
                case "vertical-grid":
                    {
                      if (report.properties.verticalGrid && report.properties.verticalGrid.refresh)
                          report.properties.verticalGrid.refresh();
                    }
                    break;
                case 'chart-line':
                case 'chart-donut':
                case 'chart-pie':
                case 'gauge':
                    {
                        if (report.reportType == 'chart-donut')
                                    report.properties.chart.type = 'donut';
                                if (report.reportType == 'chart-pie')
                                    report.properties.chart.type = 'pie';
                                if (report.reportType == 'gauge')
                                    report.properties.chart.type = 'gauge';
                        //generatec3Chart(report,mode);
                        if (report.properties.chart && report.properties.chart.refresh)
                          {
                            report.properties.chart.refresh();
                          }
                    }
                    break;
                case 'indicator':{
                    //generateIndicator(report);
                    if (report.properties.indicator && report.properties.indicator.refresh)
                        report.properties.indicator.refresh();
                    }
                    break;
                case "dxPivot":
                    {
                                var htmlCode = dxPivot.getDxPivot(report,mode);
                                var el = document.getElementById(report.parentDiv);

                                        if (el)
                                        {
                                            angular.element(el).empty();
                                            var $div = $(htmlCode);
                                            angular.element(el).append($div);
                                            angular.element(document).injector().invoke(function($compile) {
                                                var scope = angular.element($div).scope();
                                                $compile($div)(scope);
                                                hideOverlay(report.parentDiv);
                                            });
                                        }
                    }
                    break;
                case "dxGrid":
                    {
                                var htmlCode = dxGrid.getDxGrid(report,mode);
                                var el = document.getElementById(report.parentDiv);

                                        if (el)
                                        {
                                            angular.element(el).empty();
                                            var $div = $(htmlCode);
                                            angular.element(el).append($div);
                                            angular.element(document).injector().invoke(function($compile) {
                                                var scope = angular.element($div).scope();
                                                $compile($div)(scope);
                                                hideOverlay(report.parentDiv);
                                            });
                                        }
                    }
                    break;

        }

            } else {
                generateNoDataHTML(report);
            }


    }


    function generateNoDataHTML(report)
    {
       var htmlCode = '<span ng-if="report.reportName" style="font-size: small;color: darkgrey;padding: 5px;">'+report.reportName+'</span><div style="width: 100%;height: 100%;display: flex;align-items: center;"><span style="color: darkgray; font-size: initial; width:100%;text-align: center";><img src="/themes/xwst/assets/images/empty.png">Sorry, we have not found any data for this report with those search criteria</span></div>';
                                var el = document.getElementById(report.parentDiv);
                                        if (el)
                                        {
                                            angular.element(el).empty();
                                            var $div = $(htmlCode);
                                            angular.element(el).append($div);
                                            angular.element(document).injector().invoke(function($compile) {
                                                var scope = angular.element($div).scope();
                                                $compile($div)(scope);
                                                //hideOverlay('OVERLAY_'+report.parentDiv);
                                                hideOverlay(report.parentDiv);
                                            });
                                        }
    }

    this.generateIndicator = function(report)
    {
        generateIndicator(report);
    }

    function showOverlay(referenceId) {
        bsLoadingOverlayService.start({
            referenceId: referenceId
        });
    };

    function hideOverlay(referenceId) {
        bsLoadingOverlayService.stop({
            referenceId: referenceId
        });
    };
/*
    var selectedColumn = undefined;

    this.selectedColumn = function()
    {
        return selectedColumn;
    }

    var selectedColumnHashedID = undefined;

    this.selectedColumnHashedID = function()
    {
        return selectedColumnHashedID;
    }

    var selectedColumnIndex = undefined;

    this.selectedColumnIndex = function()
    {
        return selectedColumnIndex;
    }


    this.changeColumnStyle = function(report,columnIndex ,hashedID)
    {
        selectedColumn = report.properties.columns[columnIndex];
        selectedColumnHashedID  = hashedID;
        selectedColumnIndex  = columnIndex;

        if (!selectedColumn.columnStyle)
             selectedColumn.columnStyle = {color:'#000','background-color':'#EEEEEE','text-align':'left','font-size':"12px",'font-weight':"normal",'font-style':"normal"};

        $('#columnFormatModal').modal('show');

    }

    this.changeColumnSignals = function(report,columnIndex ,hashedID)
    {

        selectedColumn = report.properties.columns[columnIndex];
        selectedColumnHashedID  = hashedID;
        selectedColumnIndex  = columnIndex;

        if (!selectedColumn.signals)
            selectedColumn.signals = [];
        $('#columnSignalsModal').modal('show');
    }

    this.orderColumn = function(report,columnIndex, desc,hashedID) {

        var theColumn = report.query.columns[columnIndex];
        if (desc == true)
            theColumn.sortType = 1;
        else
            theColumn.sortType = -1;
        report.query.order = [];
        report.query.order.push(theColumn);
        showOverlay('OVERLAY_'+hashedID);

        queryModel.getQueryData(report.query, function(data,sql,query){

                report.query.data = data;
                hideOverlay('OVERLAY_'+hashedID);
        });
        //get the column index, identify the report.query.column by  index, then add to query.order taking care about the sortType -1 / 1
    };

    */

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    this.saveAsReport = function(report,mode,done) {
                //Cleaning up the report object
                var clonedReport = clone(report);
                if (clonedReport.properties.chart)
                    {
                    clonedReport.properties.chart.chartCanvas = undefined;
                    clonedReport.properties.chart.data = undefined;
                    //clonedReport.properties.chart.query = undefined;
                    }
                if (clonedReport.query.data)
                    clonedReport.query.data = undefined;
                clonedReport.parentDiv = undefined;

                if (mode == 'new') {
                    connection.post('/api/v3/reports', clonedReport, function(data) {
                        if (data.result == 1) {
                           setTimeout(function () {
                            done(data);
                            }, 400);
                        }
                    });
                } else {
                    connection.post('/api/v3/reports/'+report._id, clonedReport, function(result) {
                        if (result.result == 1) {
                            setTimeout(function () {
                            done();
                            }, 400);
                        }
                    });
        }


    };

    this.saveToExcel = function($scope,reportHash)
    {
        var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
        var ws_name = $scope.selectedReport.reportName;

        var wb = new Workbook(), ws = sheet_from_array_of_arrays($scope,reportHash);

        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;




        var wbout = XLSX.write(wb,wopts);

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        saveAs(new Blob([s2ab(wbout)],{type:""}), ws_name+".xlsx")


    }


     function Workbook() {
        if(!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
    }

    function sheet_from_array_of_arrays($scope,reportHash) {
        var data = $scope.selectedReport.query.data;
        var report = $scope.selectedReport;
        var ws = {};
        var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
        for(var i = 0; i < report.properties.columns.length; i++)
        {
            if(range.s.r > 0) range.s.r = 0;
            if(range.s.c > i) range.s.c = i;
            if(range.e.r < 0) range.e.r = 0;
            if(range.e.c < i) range.e.c = i;


            var cell = {v: report.properties.columns[i].objectLabel };
            var cell_ref = XLSX.utils.encode_cell({c:i,r:0});
            if(typeof cell.v === 'number') cell.t = 'n';
            else if(typeof cell.v === 'boolean') cell.t = 'b';
            else if(cell.v instanceof Date) {
                cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            }
            else cell.t = 's';

            ws[cell_ref] = cell;
        }


        for(var R = 0; R != data.length; ++R) {

            for(var i = 0; i < report.properties.columns.length; i++)
            {
                //var elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName;
                var elementID = 'wst'+report.properties.columns[i].elementID.toLowerCase();
                var elementName = elementID.replace(/[^a-zA-Z ]/g,'');

                if (report.properties.columns[i].aggregation)
                    {
                    //elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName+report.properties.columns[i].aggregation;
                    var elementID = 'wst'+report.properties.columns[i].elementID.toLowerCase()+report.properties.columns[i].aggregation;
                    var elementName = elementID.replace(/[^a-zA-Z ]/g,'');
                    }
                if(range.s.r > R+1) range.s.r = R+1;
                if(range.s.c > i) range.s.c = i;
                if(range.e.r < R+1) range.e.r = R+1;
                if(range.e.c < i) range.e.c = i;

                if ((report.properties.columns[i].elementType == 'DECIMAL' || report.properties.columns[i].elementType == 'INTEGER' || report.properties.columns[i].elementType == 'FLOAT' )&& data[R][elementName])
                {
                    var cell = {v: Number(data[R][elementName]) };
                } else {
                    var cell = {v: data[R][elementName] };
                }
                var cell_ref = XLSX.utils.encode_cell({c:i,r:R+1});
                if(typeof cell.v === 'number') cell.t = 'n';
                else if(typeof cell.v === 'boolean') cell.t = 'b';
                else if(cell.v instanceof Date) {
                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                }
                else cell.t = 's';

                cell.s = {fill: { fgColor: { rgb: "FFFF0000"}}};

                ws[cell_ref] = cell;
            }
        }
        if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);

        return ws;

    }

    this.getReportContainerHTML = function(reportID,reportType)
    {
        var containerID = 'REPORT_CONTAINER_'+reportID;

        var html = '<div class="container-fluid featurette ndContainer"  ndType="container" style="height:100%;padding:0px;">'+
                        '<div class="col-md-12 ndContainer" ndType="column" style="height:100%;padding:0px;">'+
                              '<div page-block class="container-fluid" id="'+containerID+'" ndType="'+reportType+'" ng-init="getRuntimeReport('+"'"+reportID+"'"+')" bs-loading-overlay bs-loading-overlay-reference-id="REPORT_'+reportID+'" style="padding:0px;position: relative;height: 100%;"></div>';

                        '</div>'+
                    '</div>';

        return html;
    }

    this.getPromptHTML = function(prompt)
    {
        var html = '<div id="PROMPT_'+prompt.elementID+'" page-block class="ndContainer" ndType="ndPrompt"><nd-prompt  filter="getFilter('+"'"+prompt.elementID+"'"+')" element-id="'+prompt.elementID+'" label="'+prompt.objectLabel+'" value-field="'+prompt.name+'" show-field="'+prompt.name+'" prompts="prompts" after-get-values="afterPromptGetValues" on-change="promptChanged" ng-model="lastPromptSelectedValue"></nd-prompt></div>';

        return html;
    }


});
