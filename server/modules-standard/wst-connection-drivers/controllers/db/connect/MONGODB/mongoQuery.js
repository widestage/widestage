exports.generateSQL = function (req,dbms,query,collections, dataSource, params, thereAreJoins, done) {
    if (thereAreJoins)
    {
        processJoinedCollections(req,query,collections, dataSource, params, thereAreJoins, 0,[], done);
    } else {
        generateSQL(req,query,collections[0], dataSource, params, thereAreJoins, done);
    }
}

exports.generateSQLForCollection = function (req,query,collection, dataSource, params, thereAreJoins, done) {
    generateSQL(req,query,collection, dataSource, params, thereAreJoins, done);
}



function generateSQL(req,query,collection, dataSource, params, thereAreJoins, done) {
    //var index = (index) ? index : 0;
    //var collection = (collections[index]) ? collections[index] : false;
    var result = (result) ? result : [];

    if (!collection) {
        done();
        return;
    }

    //No pagination when there are joins as all data is processed
  /*  if (thereAreJoins && params.page > 1 )
    {
        done();
        return;
    }
*/


    var elements = {};


    //var filters = getCollectionFiltersV2(collection, collection.filters,thereAreJoins);
    var filters = getCollectionFiltersV2(collection, query.groupFilters,thereAreJoins);

    //collection.collectionName = collection.columns[0].collectionName;

    for (var c in collection.columns) {
        elements[collection.columns[c].elementName] = 1;
    }


    //ADD the necessary fields for joins
    for (var i in collection.joins) {
        if (collection.joins[i].sourceParentID == collection.collectionID)
            elements[collection.joins[i].sourceElementName] = 1;
        if (collection.joins[i].targetParentID == collection.collectionID)
            elements[collection.joins[i].targetElementName] = 1;

    }


    var sort = {};

    if (collection.order) {

        for (var i in collection.order) {

                if (collection.order[i] != undefined)
                {

                        var found = false;

                        for (var c in collection.columns) {
                            if (collection.columns[c].elementID == collection.order[i].elementID) {

                                if (collection.columns[c].aggregation) {
                                    found = true;
                                    switch (collection.columns[c].aggregation) {
                                        case 'sum': sort[collection.columns[c].elementName+'sum'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'avg': sort[collection.columns[c].elementName+'avg'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'min': sort[collection.columns[c].elementName+'min'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'max': sort[collection.columns[c].elementName+'max'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'count': sort[collection.columns[c].elementName+'count'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'year': sort['_id.'+collection.columns[c].elementName+'year'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'month': sort['_id.'+collection.columns[c].elementName+'month'] = collection.order[i].sortType*-1;
                                            break;
                                        case 'day': sort['_id.'+collection.columns[c].elementName+'day'] = collection.order[i].sortType*-1;
                                    }
                                }

                                break;
                            }
                        }
                        if (!found) {
                            if (collection.order[i].sortType)
                                sort['_id.'+collection.order[i].elementName] = collection.order[i].sortType*-1;
                            else
                                sort['_id.'+collection.order[i].elementName] = 1;
                        }
                }

        }
    }


        var match = filters, project = {}, group = {}, fields = {}, unwindFields = [];

        for (var i in collection.columns) {
            var found = false;


                for (var c in collection.columns) {


                        if (collection.columns[c].aggregation) {
                            switch (collection.columns[c].aggregation) {
                                case 'sum': group[collection.columns[c].elementName+'sum'] = {$sum: "$"+collection.columns[c].elementName};
                                    break;
                                case 'avg': group[collection.columns[c].elementName+'avg'] = {$avg: "$"+collection.columns[c].elementName};
                                    break;
                                case 'min': group[collection.columns[c].elementName+'min'] = {$min: "$"+collection.columns[c].elementName};
                                    break;
                                case 'max': group[collection.columns[c].elementName+'max'] = {$max: "$"+collection.columns[c].elementName};
                                    break;
                                case 'count': group[collection.columns[c].elementName+'count'] = {$sum: 1};
                                    break;
                                case 'year': {

                                    if (collection.columns[c].extractFromString == true)
                                    {
                                        project[collection.columns[c].elementName+'year'] = {"$substr" : ["$"+collection.columns[c].elementName, collection.columns[c].yearPositionFrom-0, collection.columns[c].yearPositionTo - collection.columns[c].yearPositionFrom]};
                                        fields[collection.columns[c].elementName+'year'] = "$"+collection.columns[c].elementName+'year';
                                    } else {
                                        project[collection.columns[c].elementName+'year'] = {$year: "$"+collection.columns[c].elementName};
                                        fields[collection.columns[c].elementName+'year'] = "$"+collection.columns[c].elementName+'year';
                                    }
                                }
                                    break;
                                case 'month':
                                    if (collection.columns[c].extractFromString == true)
                                    {
                                        project[collection.columns[c].elementName+'month'] = {"$substr" : ["$"+collection.columns[c].elementName, collection.columns[c].monthPositionFrom-0, collection.columns[c].monthPositionTo - collection.columns[c].monthPositionFrom]};
                                        fields[collection.columns[c].elementName+'month'] = "$"+collection.columns[c].elementName+'month';
                                    } else {
                                        project[collection.columns[c].elementName+'month'] = {$month: "$"+collection.columns[c].elementName};
                                        fields[collection.columns[c].elementName+'month'] = "$"+collection.columns[c].elementName+'month';
                                    }
                                    break;
                                case 'day':
                                    if (collection.columns[c].extractFromString == true)
                                    {
                                        project[collection.columns[c].elementName+'day'] = {"$substr" : ["$"+collection.columns[c].elementName, collection.columns[c].dayPositionFrom-0, collection.columns[c].dayPositionTo - collection.columns[c].dayPositionFrom]};
                                        fields[collection.columns[c].elementName+'day'] = "$"+collection.columns[c].elementName+'day';
                                    } else {
                                        project[collection.columns[c].elementName+'day'] = {$dayOfMonth: "$"+collection.columns[c].elementName};
                                        fields[collection.columns[c].elementName+'day'] = "$"+collection.columns[c].elementName+'day';
                                    }

                            }
                        }
                        else {
                            fields[collection.columns[c].elementName] = "$"+collection.columns[c].elementName;
                        }

                        if (collection.columns[c].variable) {
                            switch (collection.columns[c].variable) {
                                case 'toUpper': project[collection.columns[c].elementName] = {$toUpper: "$"+collection.columns[c].elementName};
                                    break;
                                case 'toLower': project[collection.columns[c].elementName] = {$toLower: "$"+collection.columns[c].elementName};
                            }
                        }
                        else { //es necesario añadir todos los campos a project si hay alguna variable, si solo se añaden los campos con variable, el resto no se devuelven en la consulta
                            project[collection.columns[c].elementName] = "$"+collection.columns[c].elementName;
                        }

                }
        }

        //Include necessary fields for joins
       // if (collection.joins > 1)
       // {
            for (var i in collection.joins) {
                if (collection.joins[i].sourceParentID === collection.collectionID)
                {
                    fields[collection.joins[i].sourceElementName] = "$"+collection.joins[i].sourceElementName;
                    project[collection.joins[i].sourceElementName] = "$"+collection.joins[i].sourceElementName;
                }
                if (collection.joins[i].targetParentID === collection.collectionID)
                {
                    fields[collection.joins[i].targetElementName] = "$"+collection.joins[i].targetElementName;
                    project[collection.joins[i].targetElementName] = "$"+collection.joins[i].targetElementName;
                }
            }
        //}



        group['_id'] = fields;


        var aggregation = [{ $match: match }];

        if (!isEmpty(project)) aggregation.push({ $project: project });

        aggregation.push({ $group: group });


        if (!isEmpty(sort)) aggregation.push({ $sort: sort });



        //If there are joins, then we can´t set up limits...
        if (!thereAreJoins && (dataSource.params.packetSize > 0))
        {
            if (params.page) {
                if (params.page > 0)
                    aggregation.push({ $skip: (params.page-1)*dataSource.params.packetSize });
                aggregation.push({ $limit: dataSource.params.packetSize });
            }
            /*else {
             aggregation.push({ $limit: 10 });
             }*/
        }


        var theQuery = 'db.'+collection.collectionName+'.aggregate('+JSON.stringify(aggregation)+')';



        done(collection.collectionName+'.aggregate('+JSON.stringify(aggregation)+')',elements);

}

function getCollectionFiltersV2(collection, filters,thereAreJoins) {
    var theFilters = [], condition = 'AND';

    for (var i in filters) {
        if (filters[i].collectionID == collection.collectionID)
        {
            var filter = filters[i];

            if (filter.group) {

                theFilters.push(getCollectionFiltersV2(collection, filter.filters));
            }
            else if ((filter.filterText1 || filter.filterType == 'notNull' || filter.filterType == 'null') && (!filter.aggregation || !thereAreJoins) ) {

                        var thisFilter = {}, filterValue = filter.filterText1;

                        var filterElementName = filter.elementName;
                        if (filter.aggregation)
                            filterElementName = filter.elementName+filter.aggregation;

                        if (filter.elementType == 'DECIMAL' || filter.elementType == 'INTEGER' || filter.elementType == 'FLOAT') {
                            filterValue = Number(filterValue);
                        }
                        if (filter.elementType == 'DATE') {

                            if (filter.filterType == "in" || filter.filterType == "notIn")
                            {
                                thisFilter = dateFilter(filterValue,filter);
                            } else {
                                thisFilter[filterElementName] = dateFilter(filterValue,filter);
                            }
                        }

                        if (filter.filterType == "equal" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = filterValue;
                        }
                        if (filter.filterType == "diferentThan" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$not: filterValue};;
                        }
                        if (filter.filterType == "biggerThan" && filter.elementType != 'DATE' ) {
                            thisFilter[filterElementName] = {$gt: filterValue};
                        }
                        if (filter.filterType == "notGreaterThan" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$not: {$gt: filterValue}};
                        }
                        if (filter.filterType == "biggerOrEqualThan" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$gte: filterValue};
                        }
                        if (filter.filterType == "lessThan" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$lt: filterValue};
                        }
                        if (filter.filterType == "lessOrEqualThan" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$lte: filterValue};
                        }
                        if (filter.filterType == "between" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$gt: filterValue, $lt: filter.filterText2};
                        }
                        if (filter.filterType == "notBetween" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$not: {$gt: filterValue, $lt: filter.filterText2}};
                        }
                        if (filter.filterType == "contains") {
                            thisFilter[filterElementName] = new RegExp(filterValue, "i");
                        }
                        if (filter.filterType == "notContains") {
                            thisFilter[filterElementName] = {$ne: new RegExp(filterValue, "i")};
                        }
                        if (filter.filterType == "startWith") {
                            thisFilter[filterElementName] = new RegExp('/^'+filterValue+'/', "i");
                        }
                        if (filter.filterType == "notStartWith") {
                            thisFilter[filterElementName] = {$ne: new RegExp('/^'+filterValue+'/', "i")};
                        }
                        if (filter.filterType == "endsWith") {
                            thisFilter[filterElementName] = new RegExp('/'+filterValue+'$/', "i");
                        }
                        if (filter.filterType == "notEndsWith") {
                            thisFilter[filterElementName] = {$ne: new RegExp('/'+filterValue+'$/', "i")};
                        }
                        if (filter.filterType == "like") {
                            thisFilter[filterElementName] = new RegExp('/'+filterValue+'/', "i");
                        }
                        if (filter.filterType == "notLike") {
                            thisFilter[filterElementName] = {$ne: new RegExp('/'+filterValue+'/', "i")};
                        }
                        if (filter.filterType == "null") {
                            thisFilter[filterElementName] = null;
                        }
                        if (filter.filterType == "notNull") {
                            thisFilter[filterElementName] = {$ne: null};
                        }
                        if (filter.filterType == "in"  && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$in: String(filterValue).split(';')};     //;
                        }
                        if (filter.filterType == "notIn" && filter.elementType != 'DATE') {
                            thisFilter[filterElementName] = {$nin: String(filterValue).split(';')};
                        }

                        if (!isEmpty(thisFilter)) {

                            if (filter.conditionLabel)
                            {
                                var pushCondition = [];
                                pushCondition.push(thisFilter);

                                condition = filter.conditionLabel;

                                switch(filter.conditionLabel) {
                                    case 'AND': theFilters.push({$and: pushCondition});
                                        break;
                                    case 'OR': theFilters.push({$or:  pushCondition});
                                        break;
                                    case 'AND NOT': theFilters.push({$not:  pushCondition});
                                        break;
                                    case 'OR NOT': theFilters.push({$nor: pushCondition});
                                        break;
                                    default: theFilters.push({$and:  pushCondition});
                                }
                                //theFilters.push(thisFilter);

                            } else {
                                theFilters.push(thisFilter);

                            }
                        }

            } else if (filter.aggregation && !thereAreJoins)
                      {

                      }
        }
    }

    if (theFilters.length > 0) {
        switch(condition) {
            case 'AND': return {$and: theFilters};
                break;
            case 'OR': return {$or: theFilters};
                break;
            case 'AND NOT': return {$not: theFilters};
                break;
            case 'OR NOT': return {$nor: theFilters};
                break;
            default: return {$and: theFilters};
        }
    }
    else return {};
}

function pad(value,digits)
{
  return (value).toLocaleString('en-US', {minimumIntegerDigits: digits, useGrouping:false});
}

function dateFilter(filterValue, filter)
{
    //This is not valid for date-time values... the equal always take the hole day without taking care about the time

    var moment = require('moment');
    var today = new Date();
    var year = today.getFullYear();
    var month = pad(today.getMonth()+1,2);
    var day = pad(today.getDate(),2);

    var dateSearchMode = 'direct'; //convert //direct //range

    var found = false;

    if (filterValue == '#WST-TODAY#')
    {
        var firstDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate()+1);
        var year1 = tomorrow.getFullYear();
        var month1 = pad(tomorrow.getMonth()+1,2);
        var day1 = pad(tomorrow.getDate(),2);

        var lastDate = new Date(year1+'-'+month1+'-'+day1+'T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-YESTERDAY#')
    {
        var lastDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        var yesterday = new Date(today);
        yesterday.setDate(today.getDate()-1);
        var year1 = yesterday.getFullYear();
        var month1 = pad(yesterday.getMonth()+1,2);
        var day1 = pad(yesterday.getDate(),2);

        var firstDate = new Date(year1+'-'+month1+'-'+day1+'T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-THISWEEK#')
    {   //TODO: first day monday instead sunday
        var curr = new Date; // get current date
        curr.setHours(0, 0, 0, 0);
        var first = curr.getDate() - (curr.getDay()-1); // First day is the day of the month - the day of the week
        var last = first + 7; // last day is the first day + 6 one more day 7 because is a less than

        var firstDate = new Date(curr.setDate(first));
        var lastDate = new Date(curr.setDate(last));
        found = true;

    }

    if (filterValue == '#WST-LASTWEEK#')
    {   //TODO: first day monday instead sunday
        var curr = new Date; // get current date
        curr.setHours(0, 0, 0, 0);
        var lwday = new Date(curr);
        lwday.setDate(curr.getDate()-7);

        var first = lwday.getDate() - (lwday.getDay()-1); // First day is the day of the month - the day of the week
        var last = first + 7; // last day is the first day + 6 one more day 7 because is a less than

        var firstDate = new Date(curr.setDate(first));
        var lastDate = new Date(curr.setDate(last));
        found = true;

    }

    if (filterValue == '#WST-THISMONTH#')
    {

        var firstDate = new Date(year+'-'+month+'-01T00:00:00.000Z');

        if (month == 12)
            var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        else
        {
            var month1 = pad(today.getMonth()+2,2);
            var lastDate = new Date(year+'-'+month1+'-01T00:00:00.000Z');
        }
        found = true;

    }

    if (filterValue == '#WST-LASTMONTH#')
    {

        if (month == 1)
            var firstDate = new Date((year-1)+'-12-01T00:00:00.000Z');
        else {
            var month1 = pad(today.getMonth(),2);
            var firstDate = new Date(year+'-'+month1+'-01T00:00:00.000Z');
        }

        var lastDate = new Date(year+'-'+month+'-01T00:00:00.000Z');
        found = true;

    }

    if (filterValue == '#WST-THISYEAR#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;

    }
    if (filterValue == '#WST-THISQUARTER#')
    {


        var today = moment();
        var firstDate = today.startOf('quarter').format('YYYY-MM-DD')+'T00:00:00.000Z';
        var lastDate = today.endOf('quarter').format('YYYY-MM-DD')+'T00:00:00.000Z';

        found = true;

    }

    if (filterValue == '#WST-LASTYEAR#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year)+'-01-01T00:00:00.000Z');
        found = true;

    }
    if (filterValue == '#WST-FIRSTQUARTER#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date(year+'-04-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-SECONDQUARTER#')
    {
        var firstDate = new Date(year+'-04-01T00:00:00.000Z');
        var lastDate = new Date(year+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-THIRDQUARTER#')
    {
        var firstDate = new Date(year+'-07-01T00:00:00.000Z');
        var lastDate = new Date(year+'-10-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-FOURTHQUARTER#')
    {
        var firstDate = new Date(year+'-10-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-FIRSTSEMESTER#')
    {
        var firstDate = new Date(year+'-01-01T00:00:00.000Z');
        var lastDate = new Date(year+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-SECONDSEMESTER#')
    {
        var firstDate = new Date(year+'-07-01T00:00:00.000Z');
        var lastDate = new Date((year+1)+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFIRSTQUARTER#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-04-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYSECONDQUARTER#')
    {
        var firstDate = new Date((year-1)+'-04-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYTHIRDQUARTER#')
    {
        var firstDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-10-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFOURTHQUARTER#')
    {
        var firstDate = new Date((year-1)+'-10-01T00:00:00.000Z');
        var lastDate = new Date(year+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYFIRSTSEMESTER#')
    {
        var firstDate = new Date((year-1)+'-01-01T00:00:00.000Z');
        var lastDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (filterValue == '#WST-LYSECONDSEMESTER#')
    {
        var firstDate = new Date((year-1)+'-07-01T00:00:00.000Z');
        var lastDate = new Date(year+'-01-01T00:00:00.000Z');
        found = true;
        //return {$gte: firstDate, $lt: lastDate};
    }
    if (found == true)
    {
        if (filter.filterType == "equal" || filter.filterType == "equal-pattern")
            return {$gte: firstDate, $lt: lastDate};
        if (filter.filterType == "diferentThan" || filter.filterType == "diferentThan-pattern")
            return {$not: {$gte: firstDate, $lt: lastDate}};
        if (filter.filterType == "biggerThan" || filter.filterType == "biggerThan-pattern")
            return {$gt: lastDate};
        if (filter.filterType == "biggerOrEqualThan"  || filter.filterType == "biggerOrEqualThan-pattern")
            return {$gte: firstDate};
        if (filter.filterType == "lessThan"  || filter.filterType == "lessThan-pattern")
            return {$lt: firstDate};
        if (filter.filterType == "lessOrEqualThan"  || filter.filterType == "lessOrEqualThan-pattern")
            return {$lt: lastDate};
    } else {

      var searchDate = moment(filterValue).format('YYYY-MM-DD')+'T00:00:00.000Z';
      var theNextDay = moment(filterValue).add(1,'days').format('YYYY-MM-DD')+'T00:00:00.000Z';
      var lastDate =  moment(filter.filterText2).add(1,'days').format('YYYY-MM-DD')+'T00:00:00.000Z';

        if (filter.filterType == "equal" )
        {
            var result = {$eq: searchDate};
            if (dateSearchMode == 'range')
                result = {$gte: searchDate, $lt: theNextDay};

            return result;

        }

        if (filter.filterType == "diferentThan" && found == false)
        {
            var result = {$ne: searchDate};
            if (dateSearchMode == 'range')
                result = {$not:{$gte: searchDate, $lt: theNextDay}};

            return result;
        }

        if (filter.filterType == "biggerThan" )
        {
            return {$gt: searchDate}

        }

        if (filter.filterType == "notGreaterThan" )
        {
            return {$not:{$gt: searchDate}}

        }

        if (filter.filterType == "biggerOrEqualThan" )
        {
            return {$gte: searchDate}
        }

        if (filter.filterType == "lessThan" )
        {
            return {$lt: searchDate}

        }

        if (filter.filterType == "lessOrEqualThan" )
        {
            return {$lt: theNextDay}
        }

        if (filter.filterType == "between" )
        {
            return {$gte: searchDate, $lt: lastDate};
        }

        if (filter.filterType == "notBetween" )
        {
            return {$not:{$gte: searchDate, $lt: lastDate}};
        }
/*
        if (filter.filterType == "in" )
        {
            var theFilter = [];
            var dates = String(filterValue).split(',');
            for (var d in dates)
            {
                var theDate = new Date(dates[d]);
                var theNextDay = new Date(theDate);
                theNextDay.setDate(theDate.getDate()+1);
                var theElementName = filter.elementName;
                var inFilter = {};
                inFilter[filter.elementName] = {$gte: theDate, $lt: theNextDay};
                theFilter.push(inFilter);
            }

            return {$or: theFilter};

        }

        if (filter.filterType == "notIn" )
        {

            var theFilter = [];
            var dates = String(filterValue).split(',');
            for (var d in dates)
            {
                var theDate = new Date(dates[d]);
                var theNextDay = new Date(theDate);
                theNextDay.setDate(theDate.getDate()+1);
                var theElementName = filter.elementName;
                var inFilter = {};
                inFilter[filter.elementName] = {$gte: theDate, $lt: theNextDay};
                theFilter.push(inFilter);
            }

            return {$nor: theFilter};

        }*/

    }
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}
