function attrDefault($el, data_var, default_val)
{
    if(typeof $el.data(data_var) != 'undefined')
    {
        return $el.data(data_var);
    }

    return default_val;
}

var colorsForPicker = ['#D24D57', '#F22613', '#D91E18', '#96281B', '#EF4836', '#D64541', '#C0392B', '#CF000F', '#E74C3C', '#DB0A5B', '#F64747', '#F1A9A0', '#D2527F', '#E08283', '#F62459', '#E26A6A', '#DCC6E0', '#663399', '#674172', '#AEA8D3', '#913D88', '#9A12B3', '#BF55EC', '#BE90D4', '#8E44AD', '#9B59B6', '#446CB3', '#E4F1FE', '#4183D7', '#59ABE3', '#81CFE0', '#52B3D9', '#C5EFF7', '#22A7F0', '#3498DB', '#2C3E50', '#19B5FE', '#336E7B', '#22313F', '#6BB9F0', '#1E8BC3', '#3A539B', '#34495E', '#67809F', '#2574A9', '#1F3A93', '#89C4F4', '#4B77BE', '#5C97BF', '#4ECDC4', '#A2DED0', '#87D37C', '#90C695', '#26A65B', '#03C9A9', '#68C3A3', '#65C6BB', '#1BBC9B', '#1BA39C', '#66CC99', '#36D7B7', '#C8F7C5', '#86E2D5', '#2ECC71', '#16a085', '#3FC380', '#019875', '#03A678', '#4DAF7C', '#2ABB9B', '#00B16A', '#1E824C', '#049372', '#26C281', '#FDE3A7', '#F89406', '#EB9532', '#E87E04', '#F4B350', '#F2784B', '#EB974E', '#F5AB35', '#D35400', '#F39C12', '#F9690E', '#F9BF3B', '#F27935', '#E67E22', '#ececec', '#6C7A89', '#D2D7D3', '#EEEEEE', '#BDC3C7', '#ECF0F1', '#95A5A6', '#DADFE1', '#ABB7B7', '#F2F1EF', '#BFBFBF', '#E6E2AF', '#A7A37E', '#EFECCA', '#046380', '#002F2F', '#468966', '#FFF0A5', '#FFB03B', '#B64926', '#8E2800', '#1E1E20'];

angular.module('wice.directives', []).
    directive('spinner', function(){
        return {
            restrict: 'AC',
            link: function(scope, el, attr)
            {
                var $ig = angular.element(el),
                    $dec = $ig.find('[data-type="decrement"]'),
                    $inc = $ig.find('[data-type="increment"]'),
                    $inp = $ig.find('.form-control'),

                    step = attrDefault($ig, 'step', 1),
                    min = attrDefault($ig, 'min', 0),
                    max = attrDefault($ig, 'max', 0),
                    umm = min < max;


                $dec.on('click', function(ev)
                {
                    ev.preventDefault();

                    var num = new Number($inp.val()) - step;

                    if(umm && num <= min)
                    {
                        num = min;
                    }

                    $inp.val(num);
                });

                $inc.on('click', function(ev)
                {
                    ev.preventDefault();

                    var num = new Number($inp.val()) + step;

                    if(umm && num >= max)
                    {
                        num = max;
                    }

                    $inp.val(num);
                });
            }


        }
    }).directive('erDraggable', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            elem.draggable({
                containment: elem.parent().parent()
            },{
                stop: function( event, ui ) {
                    //jqSimpleConnect.repaintAll();

                }
            });
        }
    };
}).directive('datepicker', function(){
    return {
        restrict: 'AC',
        link: function(scope, el, attr)
        {
            if( ! jQuery.isFunction(jQuery.fn.datepicker))
                return false;

            var $this = angular.element(el),
                opts = {
                    format: attrDefault($this, 'format', 'mm/dd/yyyy'),
                    startDate: attrDefault($this, 'startDate', ''),
                    endDate: attrDefault($this, 'endDate', ''),
                    daysOfWeekDisabled: attrDefault($this, 'disabledDays', ''),
                    startView: attrDefault($this, 'startView', 0)
                },
                $n = $this.next(),
                $p = $this.prev();

            $this.datepicker(opts);

            if($n.is('.input-group-addon') && $n.has('a'))
            {
                $n.on('click', function(ev)
                {
                    ev.preventDefault();

                    $this.datepicker('show');
                });
            }

            if($p.is('.input-group-addon') && $p.has('a'))
            {
                $p.on('click', function(ev)
                {
                    ev.preventDefault();

                    $this.datepicker('show');
                });
            }
        }
    }
})

.directive('blRangeSlider', function($rootScope, $parse) { //inspector

    return {
        restrict: 'A',
        link: function($scope, el, attrs) {
            var model = $parse(attrs.blRangeSlider);

            //initiate slider
            el.slider({
                min: 0,
                step: 1,
                max: attrs.max ? attrs.max : 100,
                range: "min",
                animate: true,
                slide: function(e, ui) {
                    if (attrs.blRangeSlider.indexOf('props') > -1) {
                        $scope.$apply(function() { model.assign($scope, ui.value); });
                    } else {
                        //inspector.applySliderValue(attrs.blRangeSlider, ui.value, 'px');
                    }

                }
            });

            //reset slider when user selects a different DOM element or different
            //style directions (top, bot, left, right)
            $scope.$on('element.reselected', function() { el.slider('value', 0) });
            $scope.$on(attrs.blRangeSlider+'.directions.changed', function() { el.slider('value', 0) });

            el.on("slidestart", function(event, ui) {
                //inspector.sliding = true;
                //$scope.$broadcast(attrs.blRangeSlider.replace(/[A-Z][a-z]+/g, '')+'.slidestart', attrs.blRangeSlider);

                //hide select and hover box while user is dragging
                //as their positions will get messed up
                //$scope.selectBox.add($scope.hoverBox).hide();
            });

            el.on("slidestop", function(event, ui) {
                //$scope.$broadcast(attrs.blRangeSlider.replace(/[A-Z][a-z]+/g, '')+'.slidestop', attrs.blRangeSlider);
                //$scope.repositionBox('select');
                //inspector.sliding = false;
                //$rootScope.$broadcast('builder.css.changed');
            });
        }
    }
})



.directive('ndCheckbox', function($rootScope) {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            ngChange: '=',
            ngDisabled: '='
        },
        template: '<input type="checkbox" class="cbr" ng-model="ngModel">',
        require: 'ngModel',
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {
                var $el = element.children();
                var $wrapper = '<div class="cbr-replaced"><div class="cbr-input"></div><div class="cbr-state"><span></span></div></div>';
                var rendered = false;

                function initCheckbox() {
                    var is_radio = $el.is(':radio'),
                        is_checkbox = $el.is(':checkbox'),
                        is_disabled = $el.is(':disabled'),
                        styles = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'purple', 'blue', 'red', 'gray', 'pink', 'yellow', 'orange', 'turquoise'];

                    if( ! is_radio && ! is_checkbox)
                        return;

                    $el.after( $wrapper );
                    $el.addClass('cbr-done');

                    var $wrp = $el.next();
                    $wrp.find('.cbr-input').append( $el );

                    if(is_radio)
                        $wrp.addClass('cbr-radio');

                    if(is_disabled)
                        $wrp.addClass('cbr-disabled');

                    if(scope.ngModel) //$el.is(':checked')
                    {
                        $wrp.addClass('cbr-checked');
                    }

                    // Style apply
                    jQuery.each(styles, function(key, val) {
                        var cbr_class = 'cbr-' + val;

                        if( element.hasClass(cbr_class))
                        {
                            $wrp.addClass(cbr_class);
                            element.removeClass(cbr_class);
                        }
                    });

                    // Events
                    if ((element).parent().is('label')) { //Adds click in label
                        element.on('click', function(ev) {
                            if(is_radio && $el.prop('checked') || $wrp.parent().is('label'))
                                return;

                            if(jQuery(ev.target).is($el) == false)
                            {
                                $el.prop('checked', ! $el.is(':checked'));
                                $el.trigger('change');
                            }
                        });
                    }
                    $wrp.on('click', function(ev) {
                        if(is_radio && $el.prop('checked') || $wrp.parent().is('label'))
                            return;

                        if(jQuery(ev.target).is($el) == false)
                        {
                            $el.prop('checked', ! $el.is(':checked'));
                            $el.trigger('change');
                        }
                    });

                    $el.on('change', function(ev) {
                        $wrp.removeClass('cbr-checked');

                        if($el.is(':checked'))
                            $wrp.addClass('cbr-checked');

                    });

                    rendered = true;
                }

                scope.$watch('ngModel', function(val,old){
                    if (rendered) {
                        $el.prop('checked', val);
                        $el.trigger('change');
                    }
                    else {
                        initCheckbox();
                    }
                });

            };
        }
    };
})

.directive('noSpecialChar', function () {
  function link(scope, elem, attrs, ngModel) {
                ngModel.$parsers.push(function(viewValue) {
                  var reg = /^[a-zA-Z0-9]*$/;
                  if (viewValue.match(reg)) {
                    return viewValue;
                  }
                  var transformedValue = ngModel.$modelValue;
                  ngModel.$setViewValue(transformedValue);
                  ngModel.$render();
                  return transformedValue;
                });
            }

            return {
                restrict: 'A',
                require: 'ngModel',
                link: link
            };   
});
