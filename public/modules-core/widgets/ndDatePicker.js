/*
* <nd-date-picker ng-model=""></nd-date-picker>
* */
app.directive('ndDatePicker', function($rootScope) {
    return {
        restrict: 'E',
        scope: {
            dateFormat: "@",
            placeholder: "@",
            ngModel: '=',
            minDate: '=',
            maxDate: '=',
            xeditable: '='
        },
        templateUrl: "/widgets/views/ndDatePicker.html",
        require: 'ngModel',
        compile: function (element, attrs) {
            return function (scope, element, attrs, controller) {
                var dateFormat = (scope.dateFormat) ? scope.dateFormat : 'dd/mm/yyyy';
                var ngModel = scope.ngModel;
                var minDate = (scope.minDate) ? scope.minDate : '';
                var maxDate = (scope.maxDate) ? scope.maxDate : '';
                var xeditable = (scope.xeditable);
                var formated = false;

                var $this = element.find('.datepicker'),
                    opts = {
                        format: dateFormat, //attrDefault($this, 'format', 'mm/dd/yyyy'),
                        weekStart: 1, //day of the week start. 0 for Sunday - 6 for Saturday
                        startDate: minDate, //attrDefault($this, 'startDate', minDate),
                        endDate: maxDate, //attrDefault($this, 'endDate', ''),
                        daysOfWeekDisabled: attrDefault($this, 'disabledDays', ''),
                        startView: attrDefault($this, 'startView', 0)
                        //rtl: rtl()
                    },
                    $n = $this.next(),
                    $p = $this.prev();

                $this.datepicker(opts);

                scope.$watch('ngModel', function(val,old){
                    if (val && !formated) {
                        formated = true;
                        $this.datepicker('update', new Date(scope.ngModel));
                    }
                });
                scope.$watch('minDate', function(val,old){
                    if (val) {
                        $this.datepicker('setStartDate', new Date(scope.minDate));
                    }
                });
                scope.$watch('maxDate', function(val,old){
                    if (val) {
                        $this.datepicker('setEndDate', new Date(scope.maxDate));
                    }
                });

                element.find('.datepicker').change(function() {
                    if ($(this).val().length == 0) {
                        scope.ngModel = null;
                    }
                    else {
                        scope.ngModel = $this.datepicker('getDate');
                    }
                    controller.$setViewValue(scope.ngModel);
                });

                if($n.is('.input-group-addon') && $n.has('a')) {
                    $n.on('click', function(ev) {
                        ev.preventDefault();
                        $this.datepicker('show');
                    });
                }

                if($p.is('.input-group-addon') && $p.has('a')) {
                    $p.on('click', function(ev) {
                        ev.preventDefault();
                        $this.datepicker('show');
                    });
                }
            };
        }
    };
});


app.directive('bootstrapDatePicker', function() {
         return {
            restrict: 'A',
            require: 'ngModel',
            compile: function() {
               return {
                  pre: function(scope, element, attrs, ngModelCtrl) {
                     var format, dateObj;
                     format = (!attrs.dpFormat) ? 'd/m/yyyy' : attrs.dpFormat;
                     if (!attrs.initDate && !attrs.dpFormat) {
                        // If there is no initDate attribute than we will get todays date as the default
                        dateObj = new Date();
                        scope[attrs.ngModel] = dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + '/' + dateObj.getFullYear();
                     } else if (!attrs.initDate) {
                        // Otherwise set as the init date
                        scope[attrs.ngModel] = attrs.initDate;
                     } else {
                        // I could put some complex logic that changes the order of the date string I
                        // create from the dateObj based on the format, but I'll leave that for now
                        // Or I could switch case and limit the types of formats...
                     }
                     // Initialize the date-picker
                     $(element).datepicker({
                        format: format,
                     }).on('changeDate', function(ev) {
                        // To me this looks cleaner than adding $apply(); after everything.
                        scope.$apply(function () {
                           ngModelCtrl.$setViewValue(ev.format(format));
                        });
                     });
                  }
               }
            }
         }
});
