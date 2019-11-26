app.controller('MainCtrl', function($scope, $rootScope, $location, $layout, $layoutToggles, $pageLoadingBar, Fullscreen)
	{
	
	        $rootScope.isLoginPage        = false;
    		$rootScope.isLightLoginPage   = false;
    		$rootScope.isLockscreenPage   = false;
    		$rootScope.isMainPage         = true;
    
    		$rootScope.layoutOptions = {
    			horizontalMenu: {
    				isVisible		: true,
    				isFixed			: true,
    				minimal			: false,
    				clickToExpand	: false,
    
    				isMenuOpenMobile: false
    			},
    			sidebar: {
    				isVisible		: false,
    				isCollapsed		: false,
    				toggleOthers	: true,
    				isFixed			: true,
    				isRight			: false,
    
    				isMenuOpenMobile: false,
    
    				// Added in v1.3
    				userProfile		: true
    			},
    			chat: {
    				isOpen			: false,
    			},
    			settingsPane: {
    				isOpen			: false,
    				useAnimation	: true
    			},
    			container: {
    				isBoxed			: false
    			},
    			skins: {
    				sidebarMenu		: '',
    				horizontalMenu	: '',
    				userInfoNavbar	: ''
    			},
    			pageTitles: true,
    			userInfoNavVisible	: false
    		};
    
    		$layout.loadOptionsFromCookies(); // remove this line if you don't want to support cookies that remember layout changes
    
    
    		$scope.updatePsScrollbars = function()
    		{
    			var $scrollbars = jQuery(".ps-scrollbar:visible");
    
    			$scrollbars.each(function(i, el)
    			{
    				if(typeof jQuery(el).data('perfectScrollbar') == 'undefined')
    				{
    					jQuery(el).perfectScrollbar();
    				}
    				else
    				{
    					jQuery(el).perfectScrollbar('update');
    				}
    			})
    		};
    
    
    		// Define Public Vars
    		public_vars.$body = jQuery("body");
    
    
    		// Init Layout Toggles
    		$layoutToggles.initToggles();
    
    
    		// Other methods
    		$scope.setFocusOnSearchField = function()
    		{
    			public_vars.$body.find('.search-form input[name="s"]').focus();
    
    			setTimeout(function(){ public_vars.$body.find('.search-form input[name="s"]').focus() }, 100 );
    		};
    
    
    		// Watch changes to replace checkboxes
    		$scope.$watch(function()
    		{
    			cbr_replace();
    		});
    
    		// Watch sidebar status to remove the psScrollbar
    		$rootScope.$watch('layoutOptions.sidebar.isCollapsed', function(newValue, oldValue)
    		{
    			if(newValue != oldValue)
    			{
    				if(newValue == true)
    				{
    					public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar('destroy')
    				}
    				else
    				{
    					public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar({wheelPropagation: public_vars.wheelPropagation});
    				}
    			}
    		});
    
    
    		// Page Loading Progress (remove/comment this line to disable it)
    		$pageLoadingBar.init();
    
    		$scope.showLoadingBar = showLoadingBar;
    		$scope.hideLoadingBar = hideLoadingBar;
    
    
    		// Set Scroll to 0 When page is changed
    		$rootScope.$on('$stateChangeStart', function()
    		{
    			var obj = {pos: jQuery(window).scrollTop()};
    
    			TweenLite.to(obj, .25, {pos: 0, ease:Power4.easeOut, onUpdate: function()
    			{
    				$(window).scrollTop(obj.pos);
    			}});
    		});
    
    
    		// Full screen feature added in v1.3
    		$scope.isFullscreenSupported = Fullscreen.isSupported();
    		$scope.isFullscreen = Fullscreen.isEnabled() ? true : false;
    
    		$scope.goFullscreen = function()
    		{
    			if (Fullscreen.isEnabled())
    				Fullscreen.cancel();
    			else
    				Fullscreen.all();
    
    			$scope.isFullscreen = Fullscreen.isEnabled() ? true : false;
    		}
    
		

	});