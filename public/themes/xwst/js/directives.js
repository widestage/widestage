angular.module('xwst.directives', []).

	// Layout Related Directives
	directive('settingsPane', function(){
		return {
			restrict: 'E',
			templateUrl: appHelper.templatePath('layout/settings-pane'),
			controller: 'SettingsPaneCtrl'
		};
	}).
	directive('horizontalMenu', function(){
		return {
			restrict: 'E',
			replace: true,
			templateUrl: appHelper.templatePath('layout/horizontal-menu'),
			controller: 'HorizontalMenuCtrl'
		}
	}).
	directive('sidebarMenu', function(){
		return {
			restrict: 'E',
			templateUrl: appHelper.templatePath('layout/sidebar-menu'),
			controller: 'SidebarMenuCtrl'
		};
	}).
	directive('sidebarChat', function(){
		return {
			restrict: 'E',
			replace: true,
			templateUrl: appHelper.templatePath('layout/sidebar-chat')
		};
	}).
	directive('footerChat', function(){
		return {
			restrict: 'E',
			replace: true,
			controller: 'FooterChatCtrl',
			templateUrl: appHelper.templatePath('layout/footer-chat')
		};
	}).
	directive('sidebarLogo', function(){
		return {
			restrict: 'E',
			replace: true,
			templateUrl: appHelper.templatePath('layout/sidebar-logo')
		};
	}).
	directive('sidebarProfile', function(){
		return {
			restrict: 'E',
			replace: true,
			templateUrl: appHelper.templatePath('layout/sidebar-profile')
		};
	}).
	directive('userInfoNavbar', function(){
		return {
			restrict: 'E',
			replace: true,
			templateUrl: appHelper.templatePath('layout/user-info-navbar')
		};
	}).
	directive('pageTitle', function(){
		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			templateUrl: appHelper.templatePath('layout/page-title'),
			link: function(scope, el, attr){
				scope.title = attr.title;
				scope.description = (attr.description) ? attr.description : false;
			}
		};
	}).
	directive('siteFooter', function(){
		return {
			restrict: 'E',
			templateUrl: appHelper.templatePath('layout/footer')
		};
	}).
	directive('xeBreadcrumb', function(){
		return {
			restrict: 'A',
			link: function(scope, el)
			{
				var $bc = angular.element(el);

				if($bc.hasClass('auto-hidden'))
				{
					var $as = $bc.find('li a'),
						collapsed_width = $as.width(),
						expanded_width = 0;

					$as.each(function(i, el)
					{
						var $a = $(el);

						expanded_width = $a.outerWidth(true);
						$a.addClass('collapsed').width(expanded_width);

						$a.hover(function()
						{
							$a.removeClass('collapsed');
						},
						function()
						{
							$a.addClass('collapsed');
						});
					});
				}
			}
		}
	}).

	// Widgets Directives
	directive('xeCounter', function(){

		return {
			restrict: 'EAC',
			link: function(scope, el, attrs)
			{
				var $el = angular.element(el),
					sm = scrollMonitor.create(el);

				sm.fullyEnterViewport(function()
				{
					var opts = {
						useEasing: 		attrDefault($el, 'easing', true),
						useGrouping:	attrDefault($el, 'grouping', true),
						separator: 		attrDefault($el, 'separator', ','),
						decimal: 		attrDefault($el, 'decimal', '.'),
						prefix: 		attrDefault($el, 'prefix', ''),
						suffix:			attrDefault($el, 'suffix', ''),
					},
					$count		= attrDefault($el, 'count', 'this') == 'this' ? $el : $el.find($el.data('count')),
					from        = attrDefault($el, 'from', 0),
					to          = attrDefault($el, 'to', 100),
					duration    = attrDefault($el, 'duration', 2.5),
					delay       = attrDefault($el, 'delay', 0),
					decimals	= new String(to).match(/\.([0-9]+)/) ? new String(to).match(/\.([0-9]+)$/)[1].length : 0,
					counter 	= new countUp($count.get(0), from, to, decimals, duration, opts);

					setTimeout(function(){ counter.start(); }, delay * 1000);

					sm.destroy();
				});
			}
		};
	}).
	directive('xeFillCounter', function(){

		return {
			restrict: 'EAC',
			link: function(scope, el, attrs)
			{
				var $el = angular.element(el),
					sm = scrollMonitor.create(el);

				sm.fullyEnterViewport(function()
				{
					var fill = {
						current: 	null,
						from: 		attrDefault($el, 'fill-from', 0),
						to: 		attrDefault($el, 'fill-to', 100),
						property: 	attrDefault($el, 'fill-property', 'width'),
						unit: 		attrDefault($el, 'fill-unit', '%'),
					},
					opts 		= {
						current: fill.to, onUpdate: function(){
							$el.css(fill.property, fill.current + fill.unit);
						},
						delay: attrDefault($el, 'delay', 0),
					},
					easing 		= attrDefault($el, 'fill-easing', true),
					duration 	= attrDefault($el, 'fill-duration', 2.5);

					if(easing)
					{
						opts.ease = Sine.easeOut;
					}

					// Set starting point
					fill.current = fill.from;

					TweenMax.to(fill, duration, opts);

					sm.destroy();
				});
			}
		};
	}).
	directive('xeStatusUpdate', function(){

		return {
			restrict: 'EAC',
			link: function(scope, el, attrs)
			{
				var $el          	= angular.element(el),
					$nav            = $el.find('.xe-nav a'),
					$status_list    = $el.find('.xe-body li'),
					index           = $status_list.filter('.active').index(),
					auto_switch     = attrDefault($el, 'auto-switch', 0),
					as_interval		= 0;

				if(auto_switch > 0)
				{
					as_interval = setInterval(function()
					{
						goTo(1);

					}, auto_switch * 1000);

					$el.hover(function()
					{
						window.clearInterval(as_interval);
					},
					function()
					{
						as_interval = setInterval(function()
						{
							goTo(1);

						}, auto_switch * 1000);;
					});
				}

				function goTo(plus_one)
				{
					index = (index + plus_one) % $status_list.length;

					if(index < 0)
						index = $status_list.length - 1;

					var $to_hide = $status_list.filter('.active'),
						$to_show = $status_list.eq(index);

					$to_hide.removeClass('active');
					$to_show.addClass('active').fadeTo(0,0).fadeTo(320,1);
				}

				$nav.on('click', function(ev)
				{
					ev.preventDefault();

					var plus_one = $(this).hasClass('xe-prev') ? -1 : 1;

					goTo(plus_one);
				});
			}
		};
	}).

	// Extra (Section) Directives
	directive('tocify', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.tocify))
					return false;

				var $this = angular.element(el),
					watcher = scrollMonitor.create($this.get(0));

				$this.tocify({
					context: '.tocify-content',
					selectors: "h2,h3,h4,h5"
				});


				$this.width( $this.parent().width() );

				watcher.lock();

				watcher.stateChange(function()
				{
					$($this.get(0)).toggleClass('fixed', this.isAboveViewport)
				});
			}
		}
	}).
	directive('scrollable', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.perfectScrollbar))
					return false;

				var $this = angular.element(el),
					max_height = parseInt(attrDefault($this, 'max-height', 200), 10);

				max_height = max_height < 0 ? 200 : max_height;

				$this.css({maxHeight: max_height}).perfectScrollbar({
					wheelPropagation: true
				});
			}
		}
	}).

	// Forms Directives
	directive('tagsinput', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				var $el = angular.element(el);

				if( ! jQuery.isFunction(jQuery.fn.tagsinput))
					return false;

				$el.tagsinput();
			}
		}
	}).
	/*directive('dropzone', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				var $el = angular.element(el);

				if( ! jQuery.isFunction(jQuery.fn.dropzone))
					return false;

				$el.dropzone();
			}
		}
	}).*/
	directive('wysihtml5', function(){

		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.wysihtml5))
					return false;

				var $this = angular.element(el),
					stylesheets = attrDefault($this, 'stylesheet-url', '')


				$(".wysihtml5").wysihtml5({
					size: 'white',
					stylesheets: stylesheets.split(','),
					"html": attrDefault($this, 'html', true),
					"color": attrDefault($this, 'colors', true),
				});
			}
		}
	}).
	directive('autogrow', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.autosize))
					return false;

				var $el = angular.element(el);

				$el.autosize();
			}
		}
	}).
	directive('slider', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.slider))
					return false;

				var $this = angular.element(el),
					$label_1 = $('<span class="ui-label"></span>'),
					$label_2 = $label_1.clone(),

					orientation = attrDefault($this, 'vertical', 0) != 0 ? 'vertical' : 'horizontal',

					prefix = attrDefault($this, 'prefix', ''),
					postfix = attrDefault($this, 'postfix', ''),

					fill = attrDefault($this, 'fill', ''),
					$fill = $(fill),

					step = attrDefault($this, 'step', 1),
					value = attrDefault($this, 'value', 5),
					min = attrDefault($this, 'min', 0),
					max = attrDefault($this, 'max', 100),
					min_val = attrDefault($this, 'min-val', 10),
					max_val = attrDefault($this, 'max-val', 90),

					is_range = $this.is('[data-min-val]') || $this.is('[data-max-val]'),

					reps = 0;


				// Range Slider Options
				if(is_range)
				{
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
				else
				{

					$this.slider({
						range: attrDefault($this, 'basic', 0) ? false : "min",
						orientation: orientation,
						min: min,
						max: max,
						value: value,
						step: step,
						slide: function(ev, ui)
						{
							var val = (prefix ? prefix : '') + ui.value + (postfix ? postfix : '');

							$label_1.html( val );


							if(fill)
								$fill.val(val);

							reps++;
						},
						change: function(ev, ui)
						{
							if(reps == 1)
							{
								var val = (prefix ? prefix : '') + ui.value + (postfix ? postfix : '');

								$label_1.html( val );

								if(fill)
									$fill.val(val);
							}

							reps = 0;
						}
					});

					var $handles = $this.find('.ui-slider-handle');
						//$fill = $('<div class="ui-fill"></div>');

					$label_1.html((prefix ? prefix : '') + value + (postfix ? postfix : ''));
					$handles.html( $label_1 );

					//$handles.parent().prepend( $fill );

					//$fill.width($handles.get(0).style.left);
				};
			}
		}
	}).
	directive('formWizard', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.bootstrapWizard))
					return;

				var $this = $(el),
					$tabs = $this.find('> .tabs > li'),
					$progress = $this.find(".progress-indicator"),
					_index = $this.find('> ul > li.active').index();

				// Validation
				var checkFormWizardValidaion = function(tab, navigation, index)
					{
			  			if($this.hasClass('validate'))
			  			{
							var $valid = $this.valid();

							if( ! $valid)
							{
								$this.data('validator').focusInvalid();
								return false;
							}
						}

				  		return true;
					};


				// Setup Progress
				if(_index > 0)
				{
					$progress.css({width: _index/$tabs.length * 100 + '%'});
					$tabs.removeClass('completed').slice(0, _index).addClass('completed');
				}

				$this.bootstrapWizard({
					tabClass: "",
			  		onTabShow: function($tab, $navigation, index)
			  		{
			  			var pct = $tabs.eq(index).position().left / $tabs.parent().width() * 100;

			  			$tabs.removeClass('completed').slice(0, index).addClass('completed');
			  			$progress.css({width: pct + '%'});
			  		},

			  		onNext: checkFormWizardValidaion,
			  		onTabClick: checkFormWizardValidaion
			  	});

			  	$this.data('bootstrapWizard').show( _index );

			  	$this.find('.pager a').on('click', function(ev)
			  	{
				  	ev.preventDefault();
			  	});
			}
		}
	}).
	directive('colorpicker', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.colorpicker))
					return false;

				var $this = angular.element(el),
					opts = {
					},
					$n = $this.next(),
					$p = $this.prev(),

					$preview = $this.siblings('.input-group-addon').find('.color-preview');

				$this.colorpicker(opts);

				if($n.is('.input-group-addon') && $n.has('a'))
				{
					$n.on('click', function(ev)
					{
						ev.preventDefault();

						$this.colorpicker('show');
					});
				}

				if($p.is('.input-group-addon') && $p.has('a'))
				{
					$p.on('click', function(ev)
					{
						ev.preventDefault();

						$this.colorpicker('show');
					});
				}

				if($preview.length)
				{
					$this.on('changeColor', function(ev){

						$preview.css('background-color', ev.color.toHex());
					});

					if($this.val().length)
					{
						$preview.css('background-color', $this.val());
					}
				}
			}
		}
	}).
	directive('validate', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.validate))
					return false;

				var $this = angular.element(el),
					opts = {
						rules: {},
						messages: {},
						errorElement: 'span',
						errorClass: 'validate-has-error',
						highlight: function (element) {
							$(element).closest('.form-group').addClass('validate-has-error');
						},
						unhighlight: function (element) {
							$(element).closest('.form-group').removeClass('validate-has-error');
						},
						errorPlacement: function (error, element)
						{
							if(element.closest('.has-switch').length)
							{
								error.insertAfter(element.closest('.has-switch'));
							}
							else
							if(element.parent('.checkbox, .radio').length || element.parent('.input-group').length)
							{
								error.insertAfter(element.parent());
							}
							else
							{
								error.insertAfter(element);
							}
						}
					},
					$fields = $this.find('[data-validate]');


				$fields.each(function(j, el2)
				{
					var $field = $(el2),
						name = $field.attr('name'),
						validate = attrDefault($field, 'validate', '').toString(),
						_validate = validate.split(',');

					for(var k in _validate)
					{
						var rule = _validate[k],
							params,
							message;

						if(typeof opts['rules'][name] == 'undefined')
						{
							opts['rules'][name] = {};
							opts['messages'][name] = {};
						}

						if($.inArray(rule, ['required', 'url', 'email', 'number', 'date', 'creditcard']) != -1)
						{
							opts['rules'][name][rule] = true;

							message = $field.data('message-' + rule);

							if(message)
							{
								opts['messages'][name][rule] = message;
							}
						}
						// Parameter Value (#1 parameter)
						else
						if(params = rule.match(/(\w+)\[(.*?)\]/i))
						{
							if($.inArray(params[1], ['min', 'max', 'minlength', 'maxlength', 'equalTo']) != -1)
							{
								opts['rules'][name][params[1]] = params[2];


								message = $field.data('message-' + params[1]);

								if(message)
								{
									opts['messages'][name][params[1]] = message;
								}
							}
						}
					}
				});

				$this.validate(opts);
			}
		}
	}).
	directive('inputmask', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.inputmask))
					return false;

				var $this = angular.element(el),
					mask = $this.data('mask').toString(),
					opts = {
						numericInput: attrDefault($this, 'numeric', false),
						radixPoint: attrDefault($this, 'radixPoint', ''),
						rightAlign: attrDefault($this, 'numericAlign', 'left') == 'right'
					},
					placeholder = attrDefault($this, 'placeholder', ''),
					is_regex = attrDefault($this, 'isRegex', '');

				if(placeholder.length)
				{
					opts[placeholder] = placeholder;
				}

				switch(mask.toLowerCase())
				{
					case "phone":
						mask = "(999) 999-9999";
						break;

					case "currency":
					case "rcurrency":

						var sign = attrDefault($this, 'sign', '$');;

						mask = "999,999,999.99";

						if($this.data('mask').toLowerCase() == 'rcurrency')
						{
							mask += ' ' + sign;
						}
						else
						{
							mask = sign + ' ' + mask;
						}

						opts.numericInput = true;
						opts.rightAlignNumerics = false;
						opts.radixPoint = '.';
						break;

					case "email":
						mask = 'Regex';
						opts.regex = "[a-zA-Z0-9._%-]+@[a-zA-Z0-9-]+\\.[a-zA-Z]{2,4}";
						break;

					case "fdecimal":
						mask = 'decimal';
						$.extend(opts, {
							autoGroup		: true,
							groupSize		: 3,
							radixPoint		: attrDefault($this, 'rad', '.'),
							groupSeparator	: attrDefault($this, 'dec', ',')
						});
				}

				if(is_regex)
				{
					opts.regex = mask;
					mask = 'Regex';
				}

				$this.inputmask(mask, opts);
			}
		}
	}).
	directive('timepicker', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.timepicker))
					return false;

				var $this = angular.element(el),
					opts = {
						template: attrDefault($this, 'template', false),
						showSeconds: attrDefault($this, 'showSeconds', false),
						defaultTime: attrDefault($this, 'defaultTime', 'current'),
						showMeridian: attrDefault($this, 'showMeridian', true),
						minuteStep: attrDefault($this, 'minuteStep', 15),
						secondStep: attrDefault($this, 'secondStep', 15)
					},
					$n = $this.next(),
					$p = $this.prev();

				$this.timepicker(opts);

				if($n.is('.input-group-addon') && $n.has('a'))
				{
					$n.on('click', function(ev)
					{
						ev.preventDefault();

						$this.timepicker('showWidget');
					});
				}

				if($p.is('.input-group-addon') && $p.has('a'))
				{
					$p.on('click', function(ev)
					{
						ev.preventDefault();

						$this.timepicker('showWidget');
					});
				}
			}
		}
	}).
	directive('datepicker', function(){
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
						startView: attrDefault($this, 'startView', 0),
						//rtl: rtl()
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
	}).
	directive('daterange', function(){
		return {
			restrict: 'AC',
			link: function(scope, el, attr)
			{
				if( ! jQuery.isFunction(jQuery.fn.daterangepicker))
					return false;

				var $this = angular.element(el);

					// Change the range as you desire
				var ranges = {
					'Today': [moment(), moment()],
					'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
					'Last 7 Days': [moment().subtract('days', 6), moment()],
					'Last 30 Days': [moment().subtract('days', 29), moment()],
					'This Month': [moment().startOf('month'), moment().endOf('month')],
					'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
				};

				var opts    = {
						format: attrDefault($this, 'format', 'MM/DD/YYYY'),
						timePicker: attrDefault($this, 'timePicker', false),
						timePickerIncrement: attrDefault($this, 'timePickerIncrement', false),
						separator: attrDefault($this, 'separator', ' - '),
					},
					min_date   = attrDefault($this, 'minDate', ''),
					max_date   = attrDefault($this, 'maxDate', ''),
					start_date = attrDefault($this, 'startDate', ''),
					end_date   = attrDefault($this, 'endDate', '');

				if($this.hasClass('add-ranges'))
				{
					opts['ranges'] = ranges;
				}

				if(min_date.length)
				{
					opts['minDate'] = min_date;
				}

				if(max_date.length)
				{
					opts['maxDate'] = max_date;
				}

				if(start_date.length)
				{
					opts['startDate'] = start_date;
				}

				if(end_date.length)
				{
					opts['endDate'] = end_date;
				}


				$this.daterangepicker(opts, function(start, end)
				{
					var drp = $this.data('daterangepicker');

					if($this.is('[data-callback]'))
					{
						//daterange_callback(start, end);
						callback_test(start, end);
					}

					if($this.hasClass('daterange-inline'))
					{
						$this.find('span').html(start.format(drp.format) + drp.separator + end.format(drp.format));
					}
				});

				if(typeof opts['ranges'] == 'object')
				{
					$this.data('daterangepicker').container.removeClass('show-calendar');
				}
			}
		}
	}).
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
	}).

	// Other Directives
	directive('loginForm', function(){
		return {
			restrict: 'AC',
			link: function(scope, el){

				jQuery(el).find(".form-group:has(.control-label)").each(function(i, el)
				{
					var $this = angular.element(el),
						$label = $this.find('label'),
						$input = $this.find('.form-control');

						$input.on('focus', function()
						{
							$this.addClass('is-focused');
						});

						$input.on('keydown', function()
						{
							$this.addClass('is-focused');
						});

						$input.on('blur', function()
						{
							$this.removeClass('is-focused');

							if($input.val().trim().length > 0)
							{
								$this.addClass('is-focused');
							}
						});

						$label.on('click', function()
						{
							$input.focus();
						});

						if($input.val().trim().length > 0)
						{
							$this.addClass('is-focused');
						}
				});
			}
		};
	});
	
	