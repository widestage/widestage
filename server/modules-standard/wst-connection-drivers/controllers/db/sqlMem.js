exports.generateMemSQL = function(req,query,collections, dataSource, params, done)
{
      generateMemSQL(req,query,collections, dataSource, params, done);
};

exports.getSqlEntityName = function(collection)
{
      getSqlEntityName(collection)
};


function generateMemSQL(req, query, collections, dataSource, params, done) {
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
            from.push(table.collectionName +' '+ strJoin);

            //from.push(table.table_name +' '+table.collectionID + strJoin);


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

                var elementSQL = getFieldSQL(field);
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

    SQLstring = SQLstring + ' FROM '+ getSqlEntityName(leadTable) + getJoins(leadTable,collections,[],DBLquotes);

    var havings = [];
    getFilters(dateFormat,query, function(filtersResult,havingsResult){

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

                            var elementSQL = getFieldSQL(theOrderField);

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

                    fromSQL = fromSQL + ' ' + getSqlEntityName(theTargetCollection);

                    if (theTargetCollection.sqlEntityAlias && theTargetCollection.sqlEntityAlias != '')
                        fromSQL = fromSQL + ' ON ('+table.sqlEntityAlias+'.'+DBLquotes+join.sourceElementName+DBLquotes+' = '+theTargetCollection.sqlEntityAlias+'.'+DBLquotes+join.targetElementName+DBLquotes+')';
                    else
                        fromSQL = fromSQL + ' ON ('+table.sqlEntityAlias+'.'+DBLquotes+join.sourceElementName+DBLquotes+' = '+getSqlEntityName(theTargetCollection)+'.'+DBLquotes+join.targetElementName+DBLquotes+')';

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

                    fromSQL = fromSQL + ' ' + getSqlEntityName(theSourceCollection);

                    if (theSourceCollection.sqlEntityAlias && theSourceCollection.sqlEntityAlias != '')
                        fromSQL = fromSQL + ' ON ('+table.sqlEntityAlias+'.'+DBLquotes+join.targetElementName+DBLquotes+' = '+theSourceCollection.sqlEntityAlias+'.'+DBLquotes+join.sourceElementName+DBLquotes+')';
                    else
                        fromSQL = fromSQL + ' ON ('+table.sqlEntityAlias+'.'+DBLquotes+join.targetElementName+DBLquotes+' = '+getSqlEntityName(theSourceCollection)+'.'+DBLquotes+join.sourceElementName+DBLquotes+')';

                    fromSQL = fromSQL + getJoins(theSourceCollection,collections,processedCollections,DBLquotes);
                }

            }




        }

    }

    return fromSQL;

}

function getSqlEntityName(collection)
{
  var tableName = collection.collectionName;
  if (collection.collectionSchema)
      tableName = collection.collectionSchema + '_' +collection.collectionName;

  return tableName;
}

function getFieldSQL(field,entity)
{

  var sqlWithAlias = '';
  var sqlWithoutAlias = '';
  var groupSQL = undefined;

  if (entity)
      field.sqlEntityAlias = entity;

  var elementID = 'wst'+field.elementID.toLowerCase();
  var theElementID = elementID.replace(/[^a-zA-Z ]/g,'');

  if (field.aggregation) {
      found = true;
      switch (field.aggregation) {
          case 'sum': {
                      sqlWithAlias = 'SUM('+field.sqlEntityAlias+'.'+theElementID+'sum) as '+theElementID+'sum';
                      sqlWithoutAlias  = 'SUM('+field.sqlEntityAlias+'.'+theElementID+'sum)';
                      }
              break;
          case 'avg': {
                      sqlWithAlias = 'AVG('+field.sqlEntityAlias+'.'+theElementID+'avg) as '+theElementID+'avg';
                      sqlWithoutAlias  = 'AVG('+field.sqlEntityAlias+'.'+theElementID+'avg)';
                      }
              break;
          case 'min': {
                      sqlWithAlias = 'MIN('+field.sqlEntityAlias+'.'+theElementID+'min) as '+theElementID+'min';
                      sqlWithoutAlias  = 'MIN('+field.sqlEntityAlias+'.'+theElementID+'min)';
                      }
              break;
          case 'max': {
                      sqlWithAlias = 'MAX('+field.sqlEntityAlias+'.'+theElementID+'max) as '+theElementID+'max';
                      sqlWithoutAlias  = 'MAX('+field.sqlEntityAlias+'.'+theElementID+'max)';
                      }
              break;
          case 'count': { //This is sum cause has been previously counted...
                        sqlWithAlias = 'SUM('+field.sqlEntityAlias+'.'+theElementID+'count) as '+theElementID+'count';
                        sqlWithoutAlias  = 'SUM('+field.sqlEntityAlias+'.'+theElementID+'count)';
                        }
              break;
          case 'count_distinct': { //This is sum cause has been previously counted...
                        sqlWithAlias = 'SUM('+field.sqlEntityAlias+'.'+theElementID+'count_distinct) as '+theElementID+'count_distinct';
                        sqlWithoutAlias  = 'SUM('+field.sqlEntityAlias+'.'+theElementID+'count_distinct)';
                        }

      }
  } else {

    /*  if (field.elementType == 'DATE' && field.format)
      {
          //layer date format
          var df = getDateFormat(field.sqlEntityAlias+'.'+DBLquotes+field.elementName+DBLquotes,field.format);
          sqlWithAlias = df+' as '+theElementID;
          sqlWithoutAlias = df;
          groupSQL = df;

if date is comming with format
      } else {*/
          sqlWithAlias = field.sqlEntityAlias+'.'+theElementID;
          sqlWithoutAlias = field.sqlEntityAlias+'.'+theElementID;
          groupSQL = field.sqlEntityAlias+'.'+theElementID;

      //}

  }

  return {sqlWithAlias:sqlWithAlias,sqlWithoutAlias:sqlWithoutAlias,groupSQL:groupSQL}
}


function getCollectionForThisCollectionID(collectionID,collections)
{
    for (var c in collections)
    {
        if (collections[c].collectionID == collectionID)
            return collections[c];
    }
}

function getFilters(dateFormat,query,done)
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

        var filterSQL = getFilterSQL(dateFormat,query.groupFilters[f]);

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

function getFilterSQL(dateFormat,filter,isHaving)
{
    var result = '';


    if (((filter.filterText1 && filter.filterText1 != '') || filter.filterType == 'notNull' || filter.filterType == 'null') ) {

        var thisFilter = {}, filterValue = filter.filterText1;


        if (filter.collectionSchema)
            var filterElementName =  getFieldSQL(filter,filter.collectionSchema+'_'+filter.collectionName).sqlWithoutAlias;//filter.elementName;
        else
            var filterElementName =  getFieldSQL(filter,filter.collectionName).sqlWithoutAlias;//filter.elementName;


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
                result = dateFilter4SQL(dateFormat,filterElementName,filterValue,filter);
            } else {
                result = dateFilter4SQL(dateFormat,filterElementName,filterValue,filter);
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

function dateFilter4SQL(dateFormat,filterElementName,filterValue, filter)
{
    //We do not filter by date fields here as is prone to error due to date format as the data is already filtered in source this doesn´t need to be applied
    return ''
}
