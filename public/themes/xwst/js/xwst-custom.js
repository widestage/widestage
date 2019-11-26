/**
 *	xwst Main
 *
 *	Theme by: www.laborator.co
 **/

var public_vars = public_vars || {};

;(function($, window, undefined){

	'use strict';

	$(document).ready(function()
	{

		// Main Vars
		public_vars.$body                 = $("body");
		public_vars.$pageContainer        = public_vars.$body.find(".page-container");
		public_vars.$chat                 = public_vars.$pageContainer.find("#chat");
		public_vars.$sidebarMenu          = public_vars.$pageContainer.find('.sidebar-menu');
		public_vars.$sidebarProfile       = public_vars.$sidebarMenu.find('.sidebar-user-info');
		public_vars.$mainMenu             = public_vars.$sidebarMenu.find('.main-menu');

		public_vars.$horizontalNavbar     = public_vars.$body.find('.navbar.horizontal-menu');
		public_vars.$horizontalMenu       = public_vars.$horizontalNavbar.find('.navbar-nav');

		public_vars.$mainContent          = public_vars.$pageContainer.find('.main-content');
		public_vars.$mainFooter           = public_vars.$body.find('footer.main-footer');

		public_vars.$userInfoMenuHor      = public_vars.$body.find('.navbar.horizontal-menu');
		public_vars.$userInfoMenu         = public_vars.$body.find('nav.navbar.user-info-navbar');

		public_vars.$settingsPane         = public_vars.$body.find('.settings-pane');
		public_vars.$settingsPaneIn       = public_vars.$settingsPane.find('.settings-pane-inner');

		public_vars.wheelPropagation      = true; // used in Main menu (sidebar)

		public_vars.$pageLoadingOverlay   = public_vars.$body.find('.page-loading-overlay');

		public_vars.defaultColorsPalette = ['#68b828','#7c38bc','#0e62c7','#fcd036','#4fcdfc','#00b19d','#ff6264','#f7aa47'];

        setup_sidebar_menu();

		
		
		// Go to top links
		$('body').on('click', 'a[rel="go-top"]', function(ev)
		{
			ev.preventDefault();

			var obj = {pos: $(window).scrollTop()};

			TweenLite.to(obj, .3, {pos: 0, ease:Power4.easeOut, onUpdate: function()
			{
				$(window).scrollTop(obj.pos);
			}});
		});





		
		// Perfect Scrollbar
		if($.isFunction($.fn.perfectScrollbar))
		{
			if(public_vars.$sidebarMenu.hasClass('fixed'))
				ps_init();

			$(".ps-scrollbar").each(function(i, el)
			{
				var $el = $(el);
				
				if($el.hasClass('ps-scroll-down'))
				{
					$el.scrollTop($el.prop('scrollHeight'));
				}

				$el.perfectScrollbar({
					wheelPropagation: false
				});
			});


			// Chat Scrollbar
			var $chat_inner = public_vars.$pageContainer.find('#chat .chat-inner');

			if($chat_inner.parent().hasClass('fixed'))
				$chat_inner.css({maxHeight: $(window).height()}).perfectScrollbar();


			// User info opening dropdown trigger PS update
			$(".dropdown:has(.ps-scrollbar)").each(function(i, el)
			{
				var $scrollbar = $(this).find('.ps-scrollbar');

				$(this).on('click', '[data-toggle="dropdown"]', function(ev)
				{
					ev.preventDefault();

					setTimeout(function()
					{
						$scrollbar.perfectScrollbar('update');
					}, 1);
				});
			});


			// Scrollable
			$("div.scrollable").each(function(i, el)
			{
				var $this = $(el),
					max_height = parseInt(attrDefault($this, 'max-height', 200), 10);

				max_height = max_height < 0 ? 200 : max_height;

				$this.css({maxHeight: max_height}).perfectScrollbar({
					wheelPropagation: true
				});
			});
		}
		

	});
	
	// Enable/Disable Resizable Event
	var wid = 0;

	$(window).resize(function() {
		clearTimeout(wid);
		wid = setTimeout(trigger_resizable, 200);
	});

})(jQuery, window);


// Sideber Menu Setup function
var sm_duration = .2,
	sm_transition_delay = 150;

function setup_sidebar_menu()
{
	if(public_vars.$sidebarMenu.length)
	{
		var $items_with_subs = public_vars.$sidebarMenu.find('li:has(> ul)'),
			toggle_others = public_vars.$sidebarMenu.hasClass('toggle-others');

		$items_with_subs.filter('.active').addClass('expanded');

		$items_with_subs.each(function(i, el)
		{
			var $li = jQuery(el),
				$a = $li.children('a'),
				$sub = $li.children('ul');

			$a.on('click', function(ev)
			{
				ev.preventDefault();

				if(toggle_others)
				{
					sidebar_menu_close_items_siblings($li);
				}

				if($li.hasClass('expanded') || $li.hasClass('opened'))
					sidebar_menu_item_collapse($li, $sub);
				else
					sidebar_menu_item_expand($li, $sub);
			});
		});
	}
}

function sidebar_menu_item_expand($li, $sub)
{
	if($li.data('is-busy') || ($li.parent('.main-menu').length && public_vars.$sidebarMenu.hasClass('collapsed')))
		return;

	$li.addClass('expanded').data('is-busy', true);
	$sub.show();

	var $sub_items     	  = $sub.children(),
		sub_height        = $sub.outerHeight(),

		win_y             = jQuery(window).height(),
		total_height      = $li.outerHeight(),
		current_y         = public_vars.$sidebarMenu.scrollTop(),
		item_max_y        = $li.position().top + current_y,
		fit_to_viewpport  = public_vars.$sidebarMenu.hasClass('fit-in-viewport');

	$sub_items.addClass('is-hidden');
	$sub.height(0);


	TweenMax.to($sub, sm_duration, {css: {height: sub_height}, onUpdate: ps_update, onComplete: function(){
		$sub.height('');
	}});

	var interval_1 = $li.data('sub_i_1'),
		interval_2 = $li.data('sub_i_2');

	window.clearTimeout(interval_1);

	interval_1 = setTimeout(function()
	{
		$sub_items.each(function(i, el)
		{
			var $sub_item = jQuery(el);

			$sub_item.addClass('is-shown');
		});

		var finish_on = sm_transition_delay * $sub_items.length,
			t_duration = parseFloat($sub_items.eq(0).css('transition-duration')),
			t_delay = parseFloat($sub_items.last().css('transition-delay'));

		if(t_duration && t_delay)
		{
			finish_on = (t_duration + t_delay) * 1000;
		}

		// In the end
		window.clearTimeout(interval_2);

		interval_2 = setTimeout(function()
		{
			$sub_items.removeClass('is-hidden is-shown');

		}, finish_on);


		$li.data('is-busy', false);

	}, 0);

	$li.data('sub_i_1', interval_1),
	$li.data('sub_i_2', interval_2);
}

function sidebar_menu_item_collapse($li, $sub)
{
	if($li.data('is-busy'))
		return;

	var $sub_items = $sub.children();

	$li.removeClass('expanded').data('is-busy', true);
	$sub_items.addClass('hidden-item');

	TweenMax.to($sub, sm_duration, {css: {height: 0}, onUpdate: ps_update, onComplete: function()
	{
		$li.data('is-busy', false).removeClass('opened');

		$sub.attr('style', '').hide();
		$sub_items.removeClass('hidden-item');

		$li.find('li.expanded ul').attr('style', '').hide().parent().removeClass('expanded');

		ps_update(true);
	}});
}

function sidebar_menu_close_items_siblings($li)
{
	$li.siblings().not($li).filter('.expanded, .opened').each(function(i, el)
	{
		var $_li = jQuery(el),
			$_sub = $_li.children('ul');

		sidebar_menu_item_collapse($_li, $_sub);
	});
}

// Horizontal Menu Setup function
function setup_horizontal_menu()
{
	public_vars.$horizontalNavbar     = public_vars.$body.find('.navbar.horizontal-menu');
	public_vars.$horizontalMenu       = public_vars.$horizontalNavbar.find('.navbar-nav');

	if(public_vars.$horizontalMenu.length)
	{
		var $items_with_subs = public_vars.$horizontalMenu.find('li:has(> ul)'),
			click_to_expand = public_vars.$horizontalNavbar.hasClass('click-to-expand');

		if(click_to_expand)
		{
			$('.main-content, .sidebar-menu').on('click', function(ev)
			{
				$items_with_subs.removeClass('hover');
			});
		}

		$items_with_subs.each(function(i, el)
		{
			var $li = jQuery(el),
				$a = $li.children('a'),
				$sub = $li.children('ul'),
				is_root_element = $li.parent().is('.navbar-nav');

			$li.addClass('has-sub');


			// Mobile Only
			$a.on('click', function(ev)
			{
				if(isxs())
				{
					ev.preventDefault();

					// Automatically will toggle other menu items in mobile view
					if(true)
					{
						sidebar_menu_close_items_siblings($li);
					}

					if($li.hasClass('expanded') || $li.hasClass('opened'))
						sidebar_menu_item_collapse($li, $sub);
					else
						sidebar_menu_item_expand($li, $sub);
				}
			});

			// Click To Expand
			if(click_to_expand)
			{
				$a.on('click', function(ev)
				{
					ev.preventDefault();

					if(isxs())
						return;

					// For parents only
					if(is_root_element)
					{
						$items_with_subs.filter(function(i, el){ return jQuery(el).parent().is('.navbar-nav'); }).not($li).removeClass('hover');
						$li.toggleClass('hover');
					}
					// Sub menus
					else
					{
						var sub_height;

						// To Expand
						if($li.hasClass('expanded') == false)
						{
							$li.addClass('expanded');
							$sub.addClass('is-visible');

							sub_height = $sub.outerHeight();

							$sub.height(0);

							TweenLite.to($sub, .15, {css: {height: sub_height}, ease: Sine.easeInOut, onComplete: function(){ $sub.attr('style', ''); }});

							// Hide Existing in the list
							$li.siblings().find('> ul.is-visible').not($sub).each(function(i, el)
							{
								var $el = jQuery(el);

								sub_height = $el.outerHeight();

								$el.removeClass('is-visible').height(sub_height);
								$el.parent().removeClass('expanded');

								TweenLite.to($el, .15, {css: {height: 0}, onComplete: function(){ $el.attr('style', ''); }});
							});
						}
						// To Collapse
						else
						{
							sub_height = $sub.outerHeight();

							$li.removeClass('expanded');
							$sub.removeClass('is-visible').height(sub_height);
							TweenLite.to($sub, .15, {css: {height: 0}, onComplete: function(){ $sub.attr('style', ''); }});
						}
					}
				});
			}
			// Hover To Expand
			else
			{
				$li.hoverIntent({
					over: function()
					{
						if(isxs())
							return;

						if(is_root_element)
						{
							$li.addClass('hover');
						}
						else
						{
							$sub.addClass('is-visible');
							sub_height = $sub.outerHeight();

							$sub.height(0);

							TweenLite.to($sub, .25, {css: {height: sub_height}, ease: Sine.easeInOut, onComplete: function(){ $sub.attr('style', ''); }});
						}
					},
					out: function()
					{
						if(isxs())
							return;

						if(is_root_element)
						{
							$li.removeClass('hover');
						}
						else
						{
							sub_height = $sub.outerHeight();

							$li.removeClass('expanded');
							$sub.removeClass('is-visible').height(sub_height);
							TweenLite.to($sub, .25, {css: {height: 0}, onComplete: function(){ $sub.attr('style', ''); }});
						}
					},
					timeout: 200,
					interval: is_root_element ? 10 : 100
				});
			}
		});
	}
}

// Perfect scroll bar functions by Arlind Nushi
function ps_update(destroy_init)
{
	if(isxs())
		return;

	if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
	{
		if(public_vars.$sidebarMenu.hasClass('collapsed'))
		{
			return;
		}

		public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar('update');

		if(destroy_init)
		{
			ps_destroy();
			ps_init();
		}
	}
}


function ps_init()
{
	if(isxs())
		return;

	if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
	{
		if(public_vars.$sidebarMenu.hasClass('collapsed') || ! public_vars.$sidebarMenu.hasClass('fixed'))
		{
			return;
		}

		public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar({
			wheelSpeed: 1,
			wheelPropagation: public_vars.wheelPropagation
		});
	}
}

function ps_destroy()
{
	if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
	{
		public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar('destroy');
	}
}

// Radio and Check box replacement by Arlind Nushi
function cbr_replace()
{
	var $inputs = jQuery('input[type="checkbox"].cbr, input[type="radio"].cbr').filter(':not(.cbr-done)'),
		$wrapper = '<div class="cbr-replaced"><div class="cbr-input"></div><div class="cbr-state"><span></span></div></div>';

	$inputs.each(function(i, el)
	{
		var $el = jQuery(el),
			is_radio = $el.is(':radio'),
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

		if($el.is(':checked'))
		{
			$wrp.addClass('cbr-checked');
		}


		// Style apply
		jQuery.each(styles, function(key, val)
		{
			var cbr_class = 'cbr-' + val;

			if( $el.hasClass(cbr_class))
			{
				$wrp.addClass(cbr_class);
				$el.removeClass(cbr_class);
			}
		});


		// Events
		$wrp.on('click', function(ev)
		{
			if(is_radio && $el.prop('checked') || $wrp.parent().is('label'))
				return;

			if(jQuery(ev.target).is($el) == false)
			{
				$el.prop('checked', ! $el.is(':checked'));
				$el.trigger('change');
			}
		});

		$el.on('change', function(ev)
		{
			$wrp.removeClass('cbr-checked');

			if($el.is(':checked'))
				$wrp.addClass('cbr-checked');

			cbr_recheck();
		});
	});
}

function cbr_recheck()
{
	var $inputs = jQuery("input.cbr-done");

	$inputs.each(function(i, el)
	{
		var $el = jQuery(el),
			is_radio = $el.is(':radio'),
			is_checkbox = $el.is(':checkbox'),
			is_disabled = $el.is(':disabled'),
			$wrp = $el.closest('.cbr-replaced');

		if(is_disabled)
			$wrp.addClass('cbr-disabled');

		if(is_radio && ! $el.prop('checked') && $wrp.hasClass('cbr-checked'))
		{
			$wrp.removeClass('cbr-checked');
		}
	});
}


// Element Attribute Helper
function attrDefault($el, data_var, default_val)
{
	if(typeof $el.data(data_var) != 'undefined')
	{
		return $el.data(data_var);
	}

	return default_val;
}

// Date Formatter
function date(format, timestamp) {
	//	discuss at: http://phpjs.org/functions/date/
	// original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
	// original by: gettimeofday
	//	parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
	// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// improved by: MeEtc (http://yass.meetcweb.com)
	// improved by: Brad Touesnard
	// improved by: Tim Wiel
	// improved by: Bryan Elliott
	// improved by: David Randall
	// improved by: Theriault
	// improved by: Theriault
	// improved by: Brett Zamir (http://brett-zamir.me)
	// improved by: Theriault
	// improved by: Thomas Beaucourt (http://www.webapp.fr)
	// improved by: JT
	// improved by: Theriault
	// improved by: Rafał Kukawski (http://blog.kukawski.pl)
	// improved by: Theriault
	//	input by: Brett Zamir (http://brett-zamir.me)
	//	input by: majak
	//	input by: Alex
	//	input by: Martin
	//	input by: Alex Wilson
	//	input by: Haravikk
	// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// bugfixed by: majak
	// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// bugfixed by: Brett Zamir (http://brett-zamir.me)
	// bugfixed by: omid (http://phpjs.org/functions/380:380#comment_137122)
	// bugfixed by: Chris (http://www.devotis.nl/)
	//		note: Uses global: php_js to store the default timezone
	//		note: Although the function potentially allows timezone info (see notes), it currently does not set
	//		note: per a timezone specified by date_default_timezone_set(). Implementers might use
	//		note: this.php_js.currentTimezoneOffset and this.php_js.currentTimezoneDST set by that function
	//		note: in order to adjust the dates in this function (or our other date functions!) accordingly
	//	 example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
	//	 returns 1: '09:09:40 m is month'
	//	 example 2: date('F j, Y, g:i a', 1062462400);
	//	 returns 2: 'September 2, 2003, 2:26 am'
	//	 example 3: date('Y W o', 1062462400);
	//	 returns 3: '2003 36 2003'
	//	 example 4: x = date('Y m d', (new Date()).getTime()/1000);
	//	 example 4: (x+'').length == 10 // 2009 01 09
	//	 returns 4: true
	//	 example 5: date('W', 1104534000);
	//	 returns 5: '53'
	//	 example 6: date('B t', 1104534000);
	//	 returns 6: '999 31'
	//	 example 7: date('W U', 1293750000.82); // 2010-12-31
	//	 returns 7: '52 1293750000'
	//	 example 8: date('W', 1293836400); // 2011-01-01
	//	 returns 8: '52'
	//	 example 9: date('W Y-m-d', 1293974054); // 2011-01-02
	//	 returns 9: '52 2011-01-02'

	var that = this;
	var jsdate, f;
	// Keep this here (works, but for code commented-out below for file size reasons)
	// var tal= [];
	var txt_words = [
	'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
	];
	// trailing backslash -> (dropped)
	// a backslash followed by any character (including backslash) -> the character
	// empty string -> empty string
	var formatChr = /\\?(.?)/gi;
	var formatChrCb = function (t, s) {
	return f[t] ? f[t]() : s;
	};
	var _pad = function (n, c) {
	n = String(n);
	while (n.length < c) {
		n = '0' + n;
	}
	return n;
	};
	f = {
	// Day
	d: function () {
		// Day of month w/leading 0; 01..31
		return _pad(f.j(), 2);
	},
	D: function () {
		// Shorthand day name; Mon...Sun
		return f.l()
		.slice(0, 3);
	},
	j: function () {
		// Day of month; 1..31
		return jsdate.getDate();
	},
	l: function () {
		// Full day name; Monday...Sunday
		return txt_words[f.w()] + 'day';
	},
	N: function () {
		// ISO-8601 day of week; 1[Mon]..7[Sun]
		return f.w() || 7;
	},
	S: function () {
		// Ordinal suffix for day of month; st, nd, rd, th
		var j = f.j();
		var i = j % 10;
		if (i <= 3 && parseInt((j % 100) / 10, 10) == 1) {
		i = 0;
		}
		return ['st', 'nd', 'rd'][i - 1] || 'th';
	},
	w: function () {
		// Day of week; 0[Sun]..6[Sat]
		return jsdate.getDay();
	},
	z: function () {
		// Day of year; 0..365
		var a = new Date(f.Y(), f.n() - 1, f.j());
		var b = new Date(f.Y(), 0, 1);
		return Math.round((a - b) / 864e5);
	},

	// Week
	W: function () {
		// ISO-8601 week number
		var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3);
		var b = new Date(a.getFullYear(), 0, 4);
		return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
	},

	// Month
	F: function () {
		// Full month name; January...December
		return txt_words[6 + f.n()];
	},
	m: function () {
		// Month w/leading 0; 01...12
		return _pad(f.n(), 2);
	},
	M: function () {
		// Shorthand month name; Jan...Dec
		return f.F()
		.slice(0, 3);
	},
	n: function () {
		// Month; 1...12
		return jsdate.getMonth() + 1;
	},
	t: function () {
		// Days in month; 28...31
		return (new Date(f.Y(), f.n(), 0))
		.getDate();
	},

	// Year
	L: function () {
		// Is leap year?; 0 or 1
		var j = f.Y();
		return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
	},
	o: function () {
		// ISO-8601 year
		var n = f.n();
		var W = f.W();
		var Y = f.Y();
		return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
	},
	Y: function () {
		// Full year; e.g. 1980...2010
		return jsdate.getFullYear();
	},
	y: function () {
		// Last two digits of year; 00...99
		return f.Y()
		.toString()
		.slice(-2);
	},

	// Time
	a: function () {
		// am or pm
		return jsdate.getHours() > 11 ? 'pm' : 'am';
	},
	A: function () {
		// AM or PM
		return f.a()
		.toUpperCase();
	},
	B: function () {
		// Swatch Internet time; 000..999
		var H = jsdate.getUTCHours() * 36e2;
		// Hours
		var i = jsdate.getUTCMinutes() * 60;
		// Minutes
		// Seconds
		var s = jsdate.getUTCSeconds();
		return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
	},
	g: function () {
		// 12-Hours; 1..12
		return f.G() % 12 || 12;
	},
	G: function () {
		// 24-Hours; 0..23
		return jsdate.getHours();
	},
	h: function () {
		// 12-Hours w/leading 0; 01..12
		return _pad(f.g(), 2);
	},
	H: function () {
		// 24-Hours w/leading 0; 00..23
		return _pad(f.G(), 2);
	},
	i: function () {
		// Minutes w/leading 0; 00..59
		return _pad(jsdate.getMinutes(), 2);
	},
	s: function () {
		// Seconds w/leading 0; 00..59
		return _pad(jsdate.getSeconds(), 2);
	},
	u: function () {
		// Microseconds; 000000-999000
		return _pad(jsdate.getMilliseconds() * 1000, 6);
	},

	// Timezone
	e: function () {
		// Timezone identifier; e.g. Atlantic/Azores, ...
		// The following works, but requires inclusion of the very large
		// timezone_abbreviations_list() function.
		/*				return that.date_default_timezone_get();
		 */
		throw 'Not supported (see source code of date() for timezone on how to add support)';
	},
	I: function () {
		// DST observed?; 0 or 1
		// Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
		// If they are not equal, then DST is observed.
		var a = new Date(f.Y(), 0);
		// Jan 1
		var c = Date.UTC(f.Y(), 0);
		// Jan 1 UTC
		var b = new Date(f.Y(), 6);
		// Jul 1
		// Jul 1 UTC
		var d = Date.UTC(f.Y(), 6);
		return ((a - c) !== (b - d)) ? 1 : 0;
	},
	O: function () {
		// Difference to GMT in hour format; e.g. +0200
		var tzo = jsdate.getTimezoneOffset();
		var a = Math.abs(tzo);
		return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
	},
	P: function () {
		// Difference to GMT w/colon; e.g. +02:00
		var O = f.O();
		return (O.substr(0, 3) + ':' + O.substr(3, 2));
	},
	T: function () {
		// Timezone abbreviation; e.g. EST, MDT, ...
		// The following works, but requires inclusion of the very
		// large timezone_abbreviations_list() function.
		/*				var abbr, i, os, _default;
		if (!tal.length) {
		tal = that.timezone_abbreviations_list();
		}
		if (that.php_js && that.php_js.default_timezone) {
		_default = that.php_js.default_timezone;
		for (abbr in tal) {
			for (i = 0; i < tal[abbr].length; i++) {
			if (tal[abbr][i].timezone_id === _default) {
				return abbr.toUpperCase();
			}
			}
		}
		}
		for (abbr in tal) {
		for (i = 0; i < tal[abbr].length; i++) {
			os = -jsdate.getTimezoneOffset() * 60;
			if (tal[abbr][i].offset === os) {
			return abbr.toUpperCase();
			}
		}
		}
		*/
		return 'UTC';
	},
	Z: function () {
		// Timezone offset in seconds (-43200...50400)
		return -jsdate.getTimezoneOffset() * 60;
	},

	// Full Date/Time
	c: function () {
		// ISO-8601 date.
		return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
	},
	r: function () {
		// RFC 2822
		return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
	},
	U: function () {
		// Seconds since UNIX epoch
		return jsdate / 1000 | 0;
	}
	};

	this.date = function (format, timestamp) {
		that = this;
		jsdate = (timestamp === undefined ? new Date() : // Not provided
			(timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
			new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
		);
		return format.replace(formatChr, formatChrCb);
	};
	return this.date(format, timestamp);
}