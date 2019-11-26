app.directive('ndSlider', function($timeout) {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            ngBlur: '=',
            ngChange: '=',
            ngDisabled: '=',
            min: "=",
            max: "=",
            step: "=",
            postfix: "@"
        },
        templateUrl: "/widgets/views/ndSlider.html",
        require: 'ngModel',
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {
                var $this = element.children('.slider'), rendered = false;

                $this.addClass(element.attr('class'));

                var value = (scope.ngModel) ? scope.ngModel : 0;
                var min = (scope.min) ? scope.min : 0;
                var max = (scope.max) ? scope.max : 1000;
                var step = (scope.step) ? scope.step : 1;
                var postfix = (scope.postfix) ? scope.postfix : '';

                function attrDefault($el, data_var, default_val) {
                    if(typeof $el.data(data_var) != 'undefined') {
                        return $el.data(data_var);
                    }

                    return default_val;
                }

                function initSlider() {
                    scope.ngDisabled = (scope.ngDisabled);

                    //$this = element.children('.slider');

                    var $label_1 = $('<span class="ui-label"></span>'),
                        $label_2 = $label_1.clone(),

                        orientation = attrDefault($this, 'vertical', 0) != 0 ? 'vertical' : 'horizontal',

                        prefix = attrDefault($this, 'prefix', ''),
                        //postfix = attrDefault($this, 'postfix', ''),

                        fill = attrDefault($this, 'fill', ''),
                        $fill = $(fill),

                        //step = attrDefault($this, 'step', 1),
                        //value = attrDefault($this, 'value', 5),
                        //min = attrDefault($this, 'min', 0),
                        //max = attrDefault($this, 'max', 100),
                        min_val = attrDefault($this, 'min-val', 1),
                        max_val = attrDefault($this, 'max-val', 100),

                        is_range = $this.is('[data-min-val]') || $this.is('[data-max-val]'),

                        reps = 0;

                    // Range Slider Options
                    if(is_range) {
                        $this.slider({
                            range: true,
                            orientation: orientation,
                            min: min,
                            max: max,
                            values: [min_val, max_val],
                            step: step,
                            slide: function(e, ui)
                            {
                                var min_val = (prefix ? prefix : '') + ui.values[0] + (postfix ? postfix : ''),
                                    max_val = (prefix ? prefix : '') + ui.values[1] + (postfix ? postfix : '');

                                $label_1.html( min_val );
                                $label_2.html( max_val );

                                if(fill)
                                    $fill.val(min_val + ',' + max_val);

                                reps++;
                            },
                            change: function(ev, ui)
                            {
                                if(reps == 1)
                                {
                                    var min_val = (prefix ? prefix : '') + ui.values[0] + (postfix ? postfix : ''),
                                        max_val = (prefix ? prefix : '') + ui.values[1] + (postfix ? postfix : '');

                                    $label_1.html( min_val );
                                    $label_2.html( max_val );

                                    if(fill)
                                        $fill.val(min_val + ',' + max_val);
                                }

                                reps = 0;
                            }
                        });

                        var $handles = $this.find('.ui-slider-handle');

                        $label_1.html((prefix ? prefix : '') + min_val + (postfix ? postfix : ''));
                        $handles.first().append( $label_1 );

                        $label_2.html((prefix ? prefix : '') + max_val+ (postfix ? postfix : ''));
                        $handles.last().append( $label_2 );
                    }
                    // Normal Slider
                    else {
                        $this.slider({
                            range: attrDefault($this, 'basic', 0) ? false : "min",
                            orientation: orientation,
                            min: min,
                            max: max,
                            value: value,
                            step: step,
                            slide: function(ev, ui) {
                                var val = (prefix ? prefix : '') + ui.value + (postfix ? postfix : '');

                                $label_1.html( val );

                                if(fill)
                                    $fill.val(val);

                                reps++;
                            },
                            change: function(ev, ui) {
                                if(reps == 1)
                                {
                                    var val = (prefix ? prefix : '') + ui.value + (postfix ? postfix : '');

                                    $label_1.html( val );

                                    if(fill)
                                        $fill.val(val);
                                }

                                reps = 0;

                                if (ev.currentTarget) {
                                    scope.ngModel = $this.slider('value');
                                    controller.$setViewValue(scope.ngModel);
                                    if (scope.ngChange) scope.ngChange();
                                }

                            },
                            create: function(ev, ui) {
                                setTimeout(function() {
                                    scope.ngModel = (scope.ngModel) ? scope.ngModel : 0;
                                }, 500);
                            }
                        });

                        var $handles = $this.find('.ui-slider-handle');

                        $label_1.html((prefix ? prefix : '') + value + (postfix ? postfix : ''));
                        $handles.html( $label_1 );
                    }

                    rendered = true;
                }

                scope.onBlur = function() {
                    if (scope.ngBlur) scope.ngBlur();
                };

                scope.$watch('ngModel', function(val,old){
                    if (rendered) {
                        if (val) { //user is dragging the slider
                            $this.slider('value', parseInt(val));
                            $this.find('.ui-label').text(val+postfix);
                        }
                    }
                    else {
                        initSlider();
                    }
                });

                scope.$watch('ngDisabled', function(val,old){
                    $this.slider("option", "disabled", val);
                });

            };
        }
    };
});