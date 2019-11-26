exports.generateSQL = function(req,dbms,query,collections, dataSource, params,thereAreJoins, done)
{
      generateSQL(req,dbms,query,collections, dataSource, params,thereAreJoins, done);
};


function generateSQL(req, dbms, query, collections, dataSource, params, thereAreJoins, done) {
    var from = [];
    var fields = [];
    var fieldIDs = [];
    var groupBy = [];
    var orderBy = [];
    var joins = [];
    var processedCollections = [];
    var elements = [];
    var leadTable = {};
    var leadTableJoinsCount = 0;

    //connection params...
    var DBLquotes = '';
    var dateFormat = 'YYYY/MM/DD';
    var packetSize = -1;
    if (dataSource.params)
      {
        if (dataSource.params.quotedElementNames)
              DBLquotes = '"';
        if (dataSource.params.dateFormat)
              dateFormat = dataSource.params.dateFormat;
      }

    if (collections.length == 1)
    {
        leadTable = collections[0];
    }

    for (var c in collections) {
        var table = collections[c];
        table.joinsCount = 0;

        for (var j in table.joins) {
            var join = table.joins[j];
            if (join.sourceParentID == table.collectionID)
            {
                table.joinsCount = table.joinsCount + 1;
            }

            if (join.targetParentID == table.collectionID)
            {
                table.joinsCount = table.joinsCount + 1;
            }
        }

        if (table.joinsCount > leadTableJoinsCount)
        {
            leadTable = table;
            leadTableJoinsCount = table.joinsCount;
        }

    }


    for (var c in collections) {
        var table = collections[c];
        var strJoin = '';



        for (var j in table.joins) {

            var join = table.joins[j];

            if (join.sourceParentID == table.collectionID)
            {

                if (join.joinType == 'default')
                    strJoin = ' INNER JOIN ';

                processedCollections.push(join.targetParentID);

                strJoin = strJoin +  join.targetCollectionName  +' '+ join.targetParentID + ' ON (';

                strJoin = strJoin + join.sourceParentID + '.' + DBLquotes+join.sourceElementName+DBLquotes + ' = ' + join.targetParentID + '.' + DBLquotes+join.targetElementName+DBLquotes;
                strJoin = strJoin + ')';
            }
        }

        if (processedCollections.indexOf(table.collectionID) == -1)

            //from.push(table.collectionName +' '+table.collectionID + strJoin);
            from.push(table.table_name +' '+table.collectionID + strJoin);

        processedCollections.push(table.collectionID);

        for (var e in table.columns)
        {
            var field = table.columns[e];
            elements.push(field);


            if (field.hidden != true)
            {
                var elementID = 'wst'+field.elementID.toLowerCase();
                var theElementID = elementID.replace(/[^a-zA-Z ]/g,'');
                fieldIDs.push(theElementID);

                var elementSQL = getFieldSQL(field,DBLquotes,dbms);
                fields.push(elementSQL.sqlWithAlias);
                if (elementSQL.groupSQL)
                    groupBy.push(elementSQL.groupSQL);

            }
        }
    }

    var SQLstring = 'SELECT ';

    for (var f in fields)
    {
        if (f == fields.length -1)
            SQLstring = SQLstring + fields[f];
        else
            SQLstring = SQLstring + fields[f]+', ';
    }



            SQLstring = SQLstring + ' FROM '+ leadTable.sqlEntityName + ' '+ leadTable.sqlEntityAlias + getJoins(leadTable,collections,[],DBLquotes);




    var havings = [];
    getFilters(dbms,dateFormat,query, function(filtersResult,havingsResult){

        if (filtersResult.length > 0)
            SQLstring += ' WHERE ';

        for (var fr in filtersResult)
            SQLstring += filtersResult[fr];
        havings = havingsResult;



        if (groupBy.length > 0)
            SQLstring = SQLstring + ' GROUP BY ';


        for (var f in groupBy)
        {
            if (f == groupBy.length -1)
                SQLstring = SQLstring + groupBy[f];
            else
                SQLstring = SQLstring + groupBy[f]+', ';
        }

        if (havings.length > 0 && groupBy.length > 0)
          {
            SQLstring += ' HAVING ';

            for (var h in havings)
                SQLstring += havings[h];
          }

        if (query.order)
            if (query.order.length > 0)
            {
                var theOrderByString = '';

                for (var f in query.order)
                {
                    var theOrderField = query.order[f];
                    var elementID = 'wst'+theOrderField.elementID.toLowerCase();
                    var theElementID = elementID.replace(/[^a-zA-Z ]/g,'');

                    var sortType = '';
                    if (query.order[f].sortType == 1)
                        sortType = ' DESC';

                    var theIndex = fieldIDs.indexOf(theElementID);

                    if (theIndex >= 0)
                    {
                        //The order by field is in the result set
                            if (theOrderByString == '')
                                theOrderByString += (theIndex +1)+ sortType;
                            else
                                theOrderByString += ', '+(theIndex +1) + sortType;
                    } else {
                        //No index, the field is not in the result set

                            var elementSQL = getFieldSQL(theOrderField,DBLquotes,dbms);

                            if (theOrderByString == '')
                                theOrderByString += elementSQL.sqlWithoutAlias+ sortType;
                            else
                                theOrderByString += ', '+elementSQL.sqlWithoutAlias + sortType;

                    }


                }


                if (theOrderByString != '')
                    SQLstring += ' ORDER BY ' + theOrderByString;

            }

        SQLstring = SQLstring.replace("WHERE  AND", "WHERE");


        done(SQLstring,elements);
    });
}

function getJoins(collection,collections,processedCollections,DBLquotes)
{
    var fromSQL = '';
    for (var c in collections) {
        if (collections[c].collectionID == collection.collectionID && (processedCollections.indexOf(collection.collectionID) == -1))
        {
            var table = collections[c];
            processedCollections.push(collection.collectionID);




            for (var j in table.joins) {
                var join = table.joins[j];

                if (join.sourceParentID == table.collectionID && (processedCollections.indexOf(join.targetParentID) == -1))
                {
                    if (!join.multiplicity)
                        fromSQL = fromSQL + ' INNER JOIN ';
                    if (join.multiplicity == 'inner' || join.multiplicity == 'default')
                        fromSQL = fromSQL + ' INNER JOIN ';
                    if (join.multiplicity == 'left')
                        fromSQL = fromSQL + ' LEFT JOIN ';
                    if (join.multiplicity == 'right')
                        fromSQL = fromSQL + ' RIGHT JOIN ';

                    var theTargetCollection = getCollectionForThisCollectionID(join.targetParentID,collections);

                    fromSQL = fromSQL + ' ' + theTargetCollection.sqlEntityName + ' '+ theTargetCollection.sqlEntityAlias;

                    if (theTargetCollection.sqlEntityAlias && theTargetCollection.sqlEntityAlias != '')
                        fromSQL = fromSQL + ' ON ('+table.sqlEntityAlias+'.'+DBLquotes+join.sourceElementName+DBLquotes+' = '+theTargetCollection.sqlEntityAlias+'.'+DBLquotes+join.targetElementName+DBLquotes+')';
                    else
                        fromSQL = fromSQL + ' ON ('+table.sqlEntityAlias+'.'+DBLquotes+join.sourceElementName+DBLquotes+' = '+theTargetCollection.sqlEntityName+'.'+DBLquotes+join.targetElementName+DBLquotes+')';

                    fromSQL = fromSQL + getJoins(theTargetCollection,collections,processedCollections,DBLquotes);

                }

                if (join.targetParentID == table.collectionID && (processedCollections.indexOf(join.sourceParentID) == -1))
                {
                    if (!join.multiplicity)
                        fromSQL = fromSQL + ' INNER JOIN ';
                    if (join.multiplicity == 'inner' || join.multiplicity == 'default')
                        fromSQL = fromSQL + ' INNER JOIN ';
                    if (join.multiplicity == 'left')
                        fromSQL = fromSQL + ' LEFT JOIN ';
                    if (join.multiplicity == 'right')
                        fromSQL = fromSQL + ' RIGHT JOIN ';

                    var theSourceCollection = getCollectionForThisCollectionID(join.sourceParentID,collections);

                    fromSQL = fromSQL + ' ' + theSourceCollection.sqlEntityName + ' '+ theSourceCollection.sqlEntityAlias;

                    if (theSourceCollection.sqlEntityAlias && theSourceCollection.sqlEntityAlias != '')
                        fromSQL = fromSQL + ' ON ('+table.sqlEntityAlias+'.'+DBLquotes+join.targetElementName+DBLquotes+' = '+theSourceCollection.sqlEntityAlias+'.'+DBLquotes+join.sourceElementName+DBLquotes+')';
                    else
                        fromSQL = fromSQL + ' ON ('+table.sqlEntityAlias+'.'+DBLquotes+join.targetElementName+DBLquotes+' = '+theSourceCollection.sqlEntityName+'.'+DBLquotes+join.sourceElementName+DBLquotes+')';

                    fromSQL = fromSQL + getJoins(theSourceCollection,collections,processedCollections,DBLquotes);
                }

            }




        }

    }

    return fromSQL;

}

function getFieldSQL(field,DBLquotes,dbms)
{

  var sqlWithAlias = '';
  var sqlWithoutAlias = '';
  var groupSQL = undefined;

  var elementID = 'wst'+field.elementID.toLowerCase();
  var theElementID = elementID.replace(/[^a-zA-Z ]/g,'');

  if (field.aggregation) {
      found = true;
      switch (field.aggregation) {
          case 'sum': {
                      sqlWithAlias = 'SUM('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')'+  ' as '+theElementID+'sum';
                      sqlWithoutAlias = 'SUM('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')';
                      }
              break;
          case 'avg': {
                      sqlWithAlias = 'AVG('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')'+  ' as '+theElementID+'avg';
                      sqlWithoutAlias = 'AVG('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')';
                      }
              break;
          case 'min': {
                      sqlWithAlias = 'MIN('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')'+  ' as '+theElementID+'min';
                      sqlWithoutAlias = 'MIN('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')';
                      }
              break;
          case 'max': {
                      sqlWithAlias = 'MAX('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')'+  ' as '+theElementID+'max';
                      sqlWithoutAlias = 'MAX('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')';
                      }
              break;
          case 'count': {
                        sqlWithAlias = 'COUNT('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')'+ ' as '+theElementID+'count';
                        sqlWithoutAlias = 'COUNT('+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')';
                        }
              break;
          case 'count_distinct': {
                        sqlWithAlias = 'COUNT(DISTINCT '+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')'+ ' as '+theElementID+'count_distinct';
                        sqlWithoutAlias = 'COUNT(DISTINCT '+field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes+')';
                        }
      }
  } else {

      if (field.elementType == 'DATE' && field.format)
      {
          //layer date format
          var df = dbms.getDateFormat(field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes,field.format);
          sqlWithAlias = df+' as '+theElementID;
          sqlWithoutAlias = df;
          groupSQL = df;


      } else {
          sqlWithAlias = field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes + ' as '+theElementID;
          groupSQL = field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes;
          sqlWithoutAlias = field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes;
      }

  }

  return {sqlWithAlias:sqlWithAlias, sqlWithoutAlias:sqlWithoutAlias,groupSQL:groupSQL}
}


function getCollectionForThisCollectionID(collectionID,collections)
{
    for (var c in collections)
    {
        if (collections[c].collectionID == collectionID)
            return collections[c];
    }
}

function getFilters(dbms,dateFormat,query,done)
{
    var theFilter = '';
    var filters = [];
    var havings = [];

    for (var f in query.groupFilters) {

        var previousRelational = '';

        if (query.groupFilters[f].conditionLabel)
        {
            previousRelational = ' '+query.groupFilters[f].conditionLabel+' ';
        }

        var filterSQL = getFilterSQL(dbms,dateFormat,query.groupFilters[f]);

        if (filterSQL != '')
        {
            if (!query.groupFilters[f].aggregation)
            {
                if (f > 0)
                    filterSQL = previousRelational + filterSQL;

                filters.push(filterSQL);
            } else {
                if (havings.length > 0)
                    filterSQL = previousRelational + filterSQL;

                havings.push(filterSQL);
            }
        }
    }

    done(filters,havings);

}


function getFilterSQL(dbms,dateFormat,filter,isHaving)
{
    var result = '';


    if (((filter.filterText1 && filter.filterText1 != '') || filter.filterType == 'notNull' || filter.filterType == 'null') ) {

        var thisFilter = {}, filterValue = filter.filterText1;


        if (filter.collectionSchema)
            var filterElementName = filter.collectionSchema+'_'+filter.collectionName + '.' + filter.elementName;
        else
            var filterElementName = filter.collectionName + '.' + filter.elementName;

        if (filter.aggregation) {
          if (filter.aggregation == 'count_distinct')
              filterElementName = 'COUNT(DISTINCT ' + filterElementName + ')';
              else
              filterElementName = filter.aggregation + '(' + filterElementName + ')';
        }

        var filterElementID = 'wst'+filter.elementID.toLowerCase();
        var theFilterElementID = filterElementID.replace(/[^a-zA-Z ]/g,'');

        if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER') {
            if (filter.filterType != "in" && filter.filterType != "notIn")
            {
                filterValue = Number(filterValue);
            }
        }
        if (filter.elementType == 'DATE') {

            if (filter.filterType == "in" || filter.filterType == "notIn")
            {
                result = dateFilter4SQL(dbms,dateFormat,filterElementName,filterValue,filter);
            } else {
                result = dateFilter4SQL(dbms,dateFormat,filterElementName,filterValue,filter);
            }
        }

        if (filter.filterType == "equal" && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = filterElementName +' = '+filterValue;
            else
                result = (filterElementName +' = '+'\''+filterValue+'\'');
        }
        if (filter.filterType == "diferentThan" && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = (filterElementName +' <> '+filterValue);
            else
                result = (filterElementName +' <> '+'\''+filterValue+'\'');
        }
        if (filter.filterType == "biggerThan" && filter.elementType != 'DATE' ) {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = (filterElementName +' > '+filterValue);
            else
                result = (filterElementName +' > '+'\''+filterValue+'\'');
        }
        if (filter.filterType == "notGreaterThan" && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = (filterElementName +' <= '+filterValue);
            else
                result = (filterElementName +' <= '+'\''+filterValue+'\'');
        }
        if (filter.filterType == "biggerOrEqualThan" && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = (filterElementName +' >= '+filterValue);
            else
                result = (filterElementName +' >= '+'\''+filterValue+'\'');
        }
        if (filter.filterType == "lessThan" && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = (filterElementName +' < '+filterValue);
            else
                result = (filterElementName +' < '+'\''+filterValue+'\'');
        }
        if (filter.filterType == "lessOrEqualThan" && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = (filterElementName +' <= '+filterValue);
            else
                result = (filterElementName +' <= '+'\''+filterValue+'\'');
        }
        if (filter.filterType == "between" && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = (filterElementName +' BETWEEN '+filterValue+' AND '+filter.filterText2);
            else
                result = (filterElementName +' BETWEEN '+'\''+filterValue+'\''+' AND '+'\''+filter.filterText2+'\'');
        }
        if (filter.filterType == "notBetween" && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
                result = (filterElementName +' NOT BETWEEN '+filterValue+' AND '+filter.filterText2);
            else
                result = (filterElementName +' NOT BETWEEN '+'\''+filterValue+'\''+' AND '+'\''+filter.filterText2+'\'');
        }
        if (filter.filterType == "contains") {
            result = (filterElementName +' LIKE '+'\'%'+filterValue+'%\'');
        }
        if (filter.filterType == "notContains") {
            result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'%\'');
        }
        if (filter.filterType == "startWith") {
            result = (filterElementName +' LIKE '+'\''+filterValue+'%\'');
        }
        if (filter.filterType == "notStartWith") {
            result = (filterElementName +' NOT LIKE '+'\''+filterValue+'%\'');
        }
        if (filter.filterType == "endsWith") {
            result = (filterElementName +' LIKE '+'\'%'+filterValue+'\'');
        }
        if (filter.filterType == "notEndsWith") {
            result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'\'');
        }
        if (filter.filterType == "like") {
            result = (filterElementName +' LIKE '+'\'%'+filterValue+'%\'');
        }
        if (filter.filterType == "notLike") {
            result = (filterElementName +' NOT LIKE '+'\'%'+filterValue+'%\'');
        }
        if (filter.filterType == "null") {
            result = (filterElementName +' IS NULL ');
        }
        if (filter.filterType == "notNull") {
            result = (filterElementName +' IS NOT NULL ');
        }
        if (filter.filterType == "in"  && filter.elementType != 'DATE') {
            if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
            {
                result = (filterElementName +' IN '+'('+filterValue.join()+')');
            } else {

                var filterSTR = '';
                for (var s in filterValue)
                {
                    if (s == 0)
                        filterSTR += "'"+filterValue[s]+"'";
                    else
                        filterSTR += ",'"+filterValue[s]+"'";
                }
                result = (filterElementName +' IN '+'('+filterSTR+')');
            }

        }
        if (filter.filterType == "notIn" && filter.elementType != 'DATE') {
          if (filter.elementType == 'DECIMAL' || filter.elementType == 'FLOAT' || filter.elementType == 'INTEGER')
          {
              result = (filterElementName +' NOT IN '+'('+filterValue.join()+')');
          } else {

              var filterSTR = '';
              for (var s in filterValue)
              {
                  if (s == 0)
                      filterSTR += "'"+filterValue[s]+"'";
                  else
                      filterSTR += ",'"+filterValue[s]+"'";
              }
              result = (filterElementName +' NOT IN '+'('+filterSTR+')');
          }
        }
    }

    return result;
}

function pad(value,digits)
{
  return (value).toLocaleString('en-US', {minimumIntegerDigits: digits, useGrouping:false});
}

function dateFilter4SQL(dbms,dateFormat,filterElementName,filterValue, filter)
{
    //This is not valid for date-time values... the equal always take the hole day without taking care about the time

    var dateSearchMode = 'direct'; //convert //direct //range

    var formatDate = function(incomingDate)
    {
      var year = incomingDate.getFullYear();
      var month = pad(incomingDate.getMonth()+1,2);
      var day = pad(incomingDate.getDate(),2);

      if (dateFormat = 'YYYY/MM/DD')
          return  year+'/'+month+'/'+day;
      if (dateFormat = 'MM/DD/YYYY')
          return  month+'/'+day+'/'+year;
      if (dateFormat = 'DD/MM/YYYY')
          return  day+'/'+month+'/'+year;
    }

    var today = new Date();
    var year = today.getFullYear();
    var month = pad(today.getMonth()+1,2);
    var day = pad(today.getDate(),2);

    var found = false;

    if (filterValue == '#WST-TODAY#')
    {
        var moment = require('moment');
        var firstDate = moment().format(dateFormat);
        var lastDate = moment(new Date()).add(1,'days').format(dateFormat);

        found = true;

    }

    if (filterValue == '#WST-YESTERDAY#')
    {
      var moment = require('moment');
      var firstDate = moment(new Date()).add(-1,'days').format(dateFormat);
      var lastDate = moment().format(dateFormat);

      found = true;

    }

    if (filterValue == '#WST-THISWEEK#')
    {
        //TODO: first day monday instead sunday
        var moment = require('moment');
        var today = moment();
        var firstDate = today.startOf('isoWeek').format(dateFormat);  //.startOf('week'); for USA week based
        var lastDate = today.endOf('isoWeek').format(dateFormat);

        found = true;


    }

    if (filterValue == '#WST-LASTWEEK#')
    {   //TODO: first day monday instead sunday
        found = true;
        var moment = require('moment');
        var firstDate = moment().subtract(1, 'weeks').startOf('isoWeek').format(dateFormat);
        var lastDate = moment().subtract(1, 'weeks').endOf('isoWeek').format(dateFormat);

    }

    if (filterValue == '#WST-THISMONTH#')
    {
        var moment = require('moment');
        var today = moment();
        var firstDate = today.startOf('month').format(dateFormat);
        var lastDate = today.endOf('month').format(dateFormat);
        found = true;
    }

    if (filterValue == '#WST-LASTMONTH#')
    {
      found = true;
      var moment = require('moment');
      var firstDate = moment().subtract(1, 'months').startOf('month').format(dateFormat);
      var lastDate = moment().subtract(1, 'months').endOf('month').format(dateFormat);

    }

    if (filterValue == '#WST-THISYEAR#')
    {
        var moment = require('moment');
        var today = moment();
        var firstDate = today.startOf('year').format(dateFormat);
        var lastDate = today.endOf('year').format(dateFormat);

        found = true;

    }

    if (filterValue == '#WST-THISQUARTER#')
    {

        var moment = require('moment');
        var today = moment();
        var firstDate = today.startOf('quarter').format(dateFormat);
        var lastDate = today.endOf('quarter').format(dateFormat);

        found = true;

    }

    if (filterValue == '#WST-LASTYEAR#')
    {
      found = true;
      var moment = require('moment');
      var firstDate = moment().subtract(1, 'years').startOf('year').format(dateFormat);
      var lastDate = moment().subtract(1, 'years').endOf('year').format(dateFormat);

    }
    if (filterValue == '#WST-FIRSTQUARTER#')
    {
        found = true;
        var moment = require('moment');
        const today = moment();
        var year = today.year();
        var firstDate = today.startOf('year').format(dateFormat);
        var lastDate = moment([year,2]).endOf('month').format(dateFormat);

    }
    if (filterValue == '#WST-SECONDQUARTER#')
    {
        found = true;
        var moment = require('moment');
        const today = moment();
        var year = today.year();
        var firstDate = moment([year,3]).startOf('month').format(dateFormat);
        var lastDate = moment([year,5]).endOf('month').format(dateFormat);
    }
    if (filterValue == '#WST-THIRDQUARTER#')
    {
      found = true;
      var moment = require('moment');
      const today = moment();
      var year = today.year();
      var firstDate = moment([year,6]).startOf('month').format(dateFormat);
      var lastDate = moment([year,8]).endOf('month').format(dateFormat);
    }
    if (filterValue == '#WST-FOURTHQUARTER#')
    {
      found = true;
      var moment = require('moment');
      const today = moment();
      var year = today.year();
      var firstDate = moment([year,9]).startOf('month').format(dateFormat);
      var lastDate = moment([year,11]).endOf('month').format(dateFormat);
    }
    if (filterValue == '#WST-FIRSTSEMESTER#')
    {
        found = true;
        var moment = require('moment');
        const today = moment();
        var year = today.year();
        var firstDate = today.startOf('year').format(dateFormat);
        var lastDate = moment([year,5]).endOf('month').format(dateFormat);
    }
    if (filterValue == '#WST-SECONDSEMESTER#')
    {
      found = true;
      var moment = require('moment');
      const today = moment();
      var year = today.year();
      var firstDate = moment([year,6]).startOf('month').format(dateFormat);
      var lastDate = moment([year,11]).endOf('month').format(dateFormat);
    }
    if (filterValue == '#WST-LYFIRSTQUARTER#')
    {
      found = true;
      var moment = require('moment');
      var firstDate = moment().subtract(1, 'years').startOf('year').format(dateFormat);
      var year = moment().subtract(1, 'years').year();
      var lastDate = moment([year,2]).endOf('month').format(dateFormat);
    }
    if (filterValue == '#WST-LYSECONDQUARTER#')
    {
        var moment = require('moment');
      var year = moment().subtract(1, 'years').year();
      var firstDate = moment([year,3]).startOf('month').format(dateFormat);
      var lastDate = moment([year,5]).endOf('month').format(dateFormat);
      found = true;

    }
    if (filterValue == '#WST-LYTHIRDQUARTER#')
    {
      var moment = require('moment');
      var year = moment().subtract(1, 'years').year();
      var firstDate = moment([year,6]).startOf('month').format(dateFormat);
      var lastDate = moment([year,8]).endOf('month').format(dateFormat);
      found = true;
    }
    if (filterValue == '#WST-LYFOURTHQUARTER#')
    {
        var moment = require('moment');
      var year = moment().subtract(1, 'years').year();
      var firstDate = moment([year,9]).startOf('month').format(dateFormat);
      var lastDate = moment([year,11]).endOf('month').format(dateFormat);
      found = true;
    }
    if (filterValue == '#WST-LYFIRSTSEMESTER#')
    {
      found = true;
      var moment = require('moment');
      var firstDate = moment().subtract(1, 'years').startOf('year').format(dateFormat);
      var year = moment().subtract(1, 'years').year();
      var lastDate = moment([year,5]).endOf('month').format(dateFormat);
    }
    if (filterValue == '#WST-LYSECONDSEMESTER#')
    {
        var moment = require('moment');
      var year = moment().subtract(1, 'years').year();
      var firstDate = moment([year,6]).startOf('month').format(dateFormat);
      var lastDate = moment([year,11]).endOf('month').format(dateFormat);
      found = true;
    }
    if (found == true)
    {
        if (filter.filterType == "equal" || filter.filterType == "equal-pattern")
            return filterElementName+" BETWEEN '"+firstDate+"' AND '"+lastDate+"'";
        if (filter.filterType == "diferentThan" || filter.filterType == "diferentThan-pattern")
            return filterElementName+" NOT BETWEEN '"+firstDate+"' AND '"+lastDate+"'";
        if (filter.filterType == "biggerThan" || filter.filterType == "biggerThan-pattern")
            return filterElementName+" > '"+lastDate+"'";
        if (filter.filterType == "biggerOrEqualThan"  || filter.filterType == "biggerOrEqualThan-pattern")
            return filterElementName+" >= '"+firstDate+"'";
        if (filter.filterType == "lessThan"  || filter.filterType == "lessThan-pattern")
            return filterElementName+" < '"+firstDate+"'";
        if (filter.filterType == "lessOrEqualThan"  || filter.filterType == "lessOrEqualThan-pattern")
            return filterElementName+" <= '"+lastDate+"'";
    } else {

        if (filter.filterType == "equal" )
        {

            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);

            //default is direct
            var SQLresult =  filterElementName + " = '" + formatDate(searchDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " = '" + formatDate(searchDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult = filterElementName+" >= '"+formatDate(searchDate)+"' AND "+filterElementName +" < '"+formatDate(theNextDay)+"'";

            return SQLresult;
        }

        if (filter.filterType == "diferentThan" && found == false)
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            //return {$not:{$gte: searchDate, $lt: theNextDay}};

            //default is direct
            var SQLresult =  filterElementName + " <> '" + formatDate(searchDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " <> '" + formatDate(searchDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult = filterElementName+" < '"+formatDate(searchDate)+"' OR "+filterElementName +" >= '"+formatDate(theNextDay)+"'";

            return SQLresult;

        }

        if (filter.filterType == "biggerThan" )
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            //return {$gt: theNextDay}
            //default is direct
            var SQLresult =  filterElementName + " > '" + formatDate(searchDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " > '" + formatDate(searchDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult =  filterElementName +" >= '"+formatDate(theNextDay)+"'";

            return SQLresult;

        }

        if (filter.filterType == "notGreaterThan" )
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            //return {$not:{$gt: theNextDay}}
            var SQLresult =  filterElementName + " <= '" + formatDate(searchDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " <= '" + formatDate(searchDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult =   filterElementName +" < '"+formatDate(theNextDay)+"'";

            return SQLresult;
        }

        if (filter.filterType == "biggerOrEqualThan" )
        {
            var searchDate = new Date(filterValue);
            //return {$gte: searchDate}
            var SQLresult =  filterElementName + " >= '" + formatDate(searchDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " >= '" + formatDate(searchDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult =    filterElementName +" >= '"+formatDate(searchDate)+"'";

            return SQLresult;

        }

        if (filter.filterType == "lessThan" )
        {
            var searchDate = new Date(filterValue);
            //return {$lt: searchDate}
            var SQLresult =  filterElementName + " < '" + formatDate(searchDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " < '" + formatDate(searchDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult =  filterElementName +" < '"+formatDate(searchDate)+"'";

            return SQLresult;

        }

        if (filter.filterType == "lessOrEqualThan" )
        {
            var searchDate = new Date(filterValue);
            var theNextDay = new Date(searchDate);
            theNextDay.setDate(searchDate.getDate()+1);
            //return {$lt: theNextDay}
            var SQLresult =  filterElementName + " <= '" + formatDate(searchDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " <= '" + formatDate(searchDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult =  filterElementName +" < '"+formatDate(theNextDay)+"'";

            return SQLresult;

        }

        if (filter.filterType == "between" )
        {
            var searchDate = new Date(filterValue);
            //searchDate.setHours(0, 0, 0, 0);
            var lastDate = new Date(filter.filterText2);
            /*
             var theNextDay = new Date(lastDate);
             theNextDay.setDate(lastDate.getDate()+1);
             */

            //return {$gte: searchDate, $lt: lastDate};
            var SQLresult =  filterElementName + " BETWEEN '" + formatDate(searchDate) + "' AND '" + formatDate(lastDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " BETWEEN '" + formatDate(searchDate) + "' AND '" + formatDate(lastDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult =  filterElementName+" >= '"+formatDate(searchDate)+"' AND "+filterElementName +" < '"+formatDate(lastDate)+"'";

            return SQLresult;
        }

        if (filter.filterType == "notBetween" )
        {
            var searchDate = new Date(filterValue);
            var lastDate = new Date(filter.filterText2);
            //return {$not:{$gte: searchDate, $lt: lastDate}}
            var SQLresult =  filterElementName + " NOT BETWEEN '" + formatDate(searchDate) + "' AND '" + formatDate(lastDate) + "'";

            if (dateSearchMode == 'convert')
                SQLresult =  dbms.getDateFormat(filterElementName,dateFormat) + " NOT BETWEEN '" + formatDate(searchDate) + "' AND '" + formatDate(lastDate) + "'";
            if (dateSearchMode == 'range')
                SQLresult =   filterElementName+" < '"+formatDate(searchDate)+"' AND "+filterElementName +" >= '"+formatDate(lastDate)+"'";

            return SQLresult;

        }
        //IN and NOT in are not implemented for date yet
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

        }

    }
}
