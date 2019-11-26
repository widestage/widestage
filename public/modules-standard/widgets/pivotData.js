app.service('dxGrid' , function () {

var pivot = (function() {

  var SortedSet = (function () {

    function find(val, array, comparator) {
      var l = 0;
      var r = array.length - 1;
      var i;
      var compare;
      while (l <= r) {
        i = ((l + r) / 2) | 0;
        compare = comparator(array[i], val);
        if (compare < 0) {
          l = i + 1;
          continue;
        }
        if (compare > 0) {
          r = i - 1;
          continue;
        }
        return i;
      }
      return null;
    }

    var concat = (function(){
      var a = [];
      var c = a.concat;
      function concat(){
        return c.apply(a, arguments);
      }
      return concat;
    }());


    function insert(value, comparator, values) {
      var r = values.length - 1;
      if (r === -1) {
        return [value];
      }
      var l = 0;
      var i, compare;
      while (l <= r) {
        i = ((l + r) / 2) | 0;
        compare = comparator(values[i], value);
        if (compare < 0) {
          //array[i] is less than our value
          l = i + 1;

        } else if (compare > 0) {
          r = i - 1;
        } else {
          //already here
          return values;
        }
      }
      if (comparator(values[i], value) < 0) {
        //insert after i
        return concat(values.slice(0, i + 1), [value], values.slice(i + 1));
      } else {
        //insert before i

        return concat(values.slice(0, i), [value], values.slice(i));
      }
    }

    function SortedSet(comparator) {
      this.comparator = comparator;
      this.values = [];
    }

    SortedSet.prototype.insert = function(value) {
      this.values = insert(value, this.comparator, this.values);
    };

    SortedSet.prototype.indexOf = function(value) {
      return find(value, this.values, this.comparator);
    };

    SortedSet.prototype.size = function() {
      return this.values.length;
    };

    return SortedSet;
  }());

  var Utils = {
    copyProperties : function(source, dest) {
      for (var k in source) {
        if (source.hasOwnProperty(k)) {
          dest[k] = source[k];
        }
      }
    },
    isArray : function(testObject) {
      return testObject && !(testObject.propertyIsEnumerable('length'))
          && typeof testObject === 'object' && typeof testObject.length === 'number';
    },
    stringComparator : function(a, b) {
      return a.localeCompare(b);
    },
    numberComparator : function(a, b) {
      if (a > b) {
        return 1;
      } else if (b > a) {
        return -1;
      } else {
        return 0;
      }
    },
    defaultComparator : function() {
      return 0;
    },
    makeComparator : function(fields, data, comparators) {
      var len = fields.length;
      var i;
      var c = [];
      for (i = 0; i < len; i++) {
        var entry = data[0][fields[i]];
        var entryType = typeof entry;
        if (typeof comparators[fields[i]] === 'function'){
          c[i] = comparators[fields[i]];
        } else if (entryType === 'number') {
          c[i] = this.numberComparator;
        } else if (entryType === 'string') {
          c[i] = this.stringComparator;
        } else if (Utils.isArray(entry)) {
          c[i] = this.defaultComparator;
        } else {
          c[i] = this.defaultComparator;
        }
      }
      return function(a, b) {
        var v = 0;
        for (i = 0; i < len; i++) {
          var field = fields[i];
          v = c[i](a[field], b[field]);
          if (v !== 0) {
            return v;
          }
        }
        return 0;
      }
    }
  };

  var pivot = (function() {

    var defaultOptions = {
      extractor : null,
      comparators : {}
    };

    function extractData(data, options) {
      var extractor = options.extractor;
      if (typeof extractor === 'function') {
        var extracted = [];
        var length = data.length;
        for (var i = 0; i < length; i++) {
          extracted = extracted.concat(extractor(data[i]));
        }
        return extracted;
      } else {
        return data;
      }
    }

    function buildPivotResult(data, leftSet, topSet) {
      var len = data.length;
      var dat;
      var i;
      for (i = 0; i < len; i++) {
        dat = data[i];
        leftSet.insert(dat);
        topSet.insert(dat);
      }

      var result = [];
      result.length = leftSet.size();

      for (i = 0; i < len; i++) {
        dat = data[i];
        var rowIndex = leftSet.indexOf(dat);
        var colIndex = topSet.indexOf(dat);
        var row = result[rowIndex];
        if (row === undefined) {
          row = [];
          row.length = topSet.size();
          result[rowIndex] = row;
        }
        var entry = row[colIndex];
        if (entry === undefined) {
          row[colIndex] = [dat];
        } else {
          entry.push(dat);
        }
      }
      return result;
    }

    function makeHeaders(data, fieldNames){
      var result = [];
      var dataLength = data.length;
      var namesLength = fieldNames.length;
      var i,j;
      for (i=0; i<dataLength; i++){
        var datum = data[i];
        var entry = [];
        for (j=0; j<namesLength; j++){
          entry[j] = datum[fieldNames[j]];
        }
        result[i] = entry;
      }
      return result;
    }

    function pivotData(data, rowNames, columnNames, userOptions) {
      if (userOptions === undefined){
        userOptions = {};
      }
      var options = {};
      Utils.copyProperties(defaultOptions, options);
      if (userOptions) {
        Utils.copyProperties(userOptions, options);
      }

      var leftSet = new SortedSet(Utils.makeComparator(rowNames, data, options));
      var topSet = new SortedSet(Utils.makeComparator(columnNames, data, options));

      data = extractData(data, options);

      var result = buildPivotResult(data, leftSet, topSet);
      result.rowHeaders = makeHeaders(leftSet.values, rowNames);
      result.columnHeaders = makeHeaders(topSet.values, columnNames);
      return result;
    }

    return pivotData;
  }());

  return pivot;
}());

});
