'use strict';

app.service('$menuItems', function($rootScope)
	{
		this.menuItems = [];

		var $menuItemsRef = this;

		var menuItemObj = {
			parent: null,

			title: '',
			link: '', // starting with "./" will refer to parent link concatenation
			state: '', // will be generated from link automatically where "/" (forward slashes) are replaced with "."
			icon: '',

			isActive: false,
			label: null,

			menuItems: [],

			setLabel: function(label, color, hideWhenCollapsed)
			{
				if(typeof hideWhenCollapsed == 'undefined')
					hideWhenCollapsed = true;

				this.label = {
					text: label,
					classname: color,
					collapsedHide: hideWhenCollapsed
				};

				return this;
			},

			addItem: function(title, link, icon)
			{
				var parent = this,
					item = angular.extend(angular.copy(menuItemObj), {
						parent: parent,

						title: title,
						link: link,
						icon: icon
					});

				if(item.link)
				{
					if(item.link.match(/^\./))
						item.link = parent.link + item.link.substring(1, link.length);

					if(item.link.match(/^-/))
						item.link = parent.link + '-' + item.link.substring(2, link.length);

					item.state = $menuItemsRef.toStatePath(item.link);
				}

				this.menuItems.push(item);

				return item;
			}
		};

		this.addItem = function(title, link, icon, visible)
		{
			visible = (typeof visible !== 'undefined') ? visible : true;
			var item = angular.extend(angular.copy(menuItemObj), {
				title: title,
				link: link,
				state: this.toStatePath(link),
				icon: icon,
				visible: visible
			});

			this.menuItems.push(item);

			return item;
		};

		this.getAll = function()
		{
			return this.menuItems;
		};

		this.prepareSidebarMenu = function(state)
		{
			this.menuItems = [];

			if (state ==='/public-space' || state === '/layers' || state === '/data-sources' || state === '/roles' || state === '/users' || state === '/companies/setup' || state === '/log') {
                this.addItem('Query editor', '/q');
                this.addItem('Query history', '/queries');
				this.addItem('Public space', '/public-space');
	    		this.addItem('Layers', '/layers');
	    		this.addItem('Data sources', '/data-sources');
	    		this.addItem('Roles', '/roles');
	    		this.addItem('Users', '/users');
	    		this.addItem('Setup', '/companies/setup');
	    		this.addItem('Log', '/log');
			}
			else {
				var home = this.addItem('Home', '/home', 'fa-home');
	    		var dashboards = this.addItem('My Dashboards', '/dashboardv2', 'fa fa-dashboard');
	    		var reports = this.addItem('My Reports', '/reports', 'fa-bar-chart');
	    		var explore = this.addItem('Explore', '/explore', 'fa-sun-o');

	    		if ($rootScope.isWSTADMIN) {
	    			var admin = this.addItem('Admin', '/admin', 'fa-superpowers');
                    admin.addItem('Query editor', '/q');
                    admin.addItem('Query history', '/queries');
	    			admin.addItem('Public space', '/public-space');
		    		admin.addItem('Layers', '/layers');
		    		admin.addItem('Data sources', '/data-sources');
		    		admin.addItem('Roles', '/roles');
		    		admin.addItem('Users', '/users');
		    		admin.addItem('Setup', '/companies/setup');
	    			admin.addItem('Log', '/log');
	    		}
			}
    		
    		return this;
		};

		this.prepareHorizontalMenu = function()
		{
			        //var home = this.addItem('Home', '/home', 'fa-home');
			        if ($rootScope.userObjects.length > 0)
            		{
                		var execute = this.addItem('Execute','/home', 'fa-bolt');
                		userObjectsMenu(execute,$rootScope.userObjects);
            		}
            		
            		var dashboards = this.addItem('My Dashboards', '/dashboardv2', 'fa fa-dashboard');
            		var reports = this.addItem('My Reports', '/reports', 'fa-bar-chart');
            		var explore = this.addItem('Explore', '/explore', 'fa-sun-o');
            		
            		
        
            		if ($rootScope.isWSTADMIN) {
            			var admin = this.addItem('Admin', '/admin', 'fa-cogs', $rootScope.isWSTADMIN);
                    	admin.addItem('Query editor', '/q');
                    	admin.addItem('Query history', '/queries');
            			admin.addItem('Public space', '/public-space');
        	    		admin.addItem('Layers', '/layers');
        	    		admin.addItem('Data sources', '/data-sources');
        	    		admin.addItem('Roles', '/roles');
        	    		admin.addItem('Users', '/users');
        	    		admin.addItem('Settings', '/companies/setup');
        	    		admin.addItem('Activity Log', '/log');
            		}
            		
            		return this;
			

		}
		
		function userObjectsMenu(parentMenu,items)
		{
		    for (var u in items)
    		{
    		    if (!items[u].nodeType && items[u].grants.execute) //is a folder
    		    {
    		       var newNode = parentMenu.addItem(items[u].title);
    		       
    		       if (items[u].nodes && items[u].grants.execute)
    		       {
    		           userObjectsMenu(newNode,items[u].nodes);
    		       }
    		    } else {
    		        if (items[u].nodeType === 'report')
    		            parentMenu.addItem(items[u].title,'/reports/'+items[u].id,'fa-bar-chart');
    		        if (items[u].nodeType === 'dashboard')
    		            parentMenu.addItem(items[u].title,'/dashboard/'+items[u].id,'fa fa-dashboard');
    		    }
    		    
    		}
		}

		this.instantiate = function()
		{
			return angular.copy( this );
		}

		this.toStatePath = function(path)
		{
			return path.replace(/\//g, '.').replace(/^\./, '');
		};

		this.setActive = function(path)
		{
			this.iterateCheck(this.menuItems, this.toStatePath(path));
		};

		this.setActiveParent = function(item)
		{
			item.isActive = true;
			item.isOpen = true;

			if(item.parent)
				this.setActiveParent(item.parent);
		};

		this.iterateCheck = function(menuItems, currentState)
		{
			angular.forEach(menuItems, function(item)
			{
				if(item.state == currentState)
				{
					item.isActive = true;

					if(item.parent != null)
						$menuItemsRef.setActiveParent(item.parent);
				}
				else
				{
					item.isActive = false;
					item.isOpen = false;

					if(item.menuItems.length)
					{
						$menuItemsRef.iterateCheck(item.menuItems, currentState);
					}
				}
			});
		}
	});
	
app.controller('SidebarMenuCtrl', function($scope, $rootScope, $menuItems, $timeout, $location, $layout, $state)
	{

		// Menu Items
		var $sidebarMenuItems = $menuItems.instantiate();

		//$scope.menuItems = $sidebarMenuItems.prepareSidebarMenu().getAll();

		// Set Active Menu Item
		//$sidebarMenuItems.setActive( $location.path() );

		$rootScope.$on('$stateChangeSuccess', function()
		{
			$scope.menuItems = $sidebarMenuItems.prepareSidebarMenu($state.current.name).getAll();

			$sidebarMenuItems.setActive($state.current.name);
		});

		// Trigger menu setup
		public_vars.$sidebarMenu = public_vars.$body.find('.sidebar-menu');
		$timeout(setup_sidebar_menu, 1);

		ps_init(); // perfect scrollbar for sidebar
	});
	
app.controller('HorizontalMenuCtrl', function($scope, $rootScope, $menuItems, $timeout, $location, $state)
	{
		var $horizontalMenuItems = $menuItems.instantiate();
		
        $rootScope.$on('$userDataHasArived', function()
        {
        		$scope.menuItems = $horizontalMenuItems.prepareHorizontalMenu().getAll();
        
        		// Set Active Menu Item
        		$horizontalMenuItems.setActive( $location.path() );
        		
        		$timeout(setup_horizontal_menu, 1);
        });
        
		$rootScope.$on('$stateChangeSuccess', function()
		{
			$horizontalMenuItems.setActive($state.current.name);

			$(".navbar.horizontal-menu .navbar-nav .hover").removeClass('hover'); // Close Submenus when item is selected
		});

		// Trigger menu setup
		
	});
	
app.directive('horizontalMenu', function(){
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'themes/xwst/js/layout/horizontal-menu.html',
			controller: 'HorizontalMenuCtrl'
		}
	});
app.directive('sidebarMenu', function(){
		return {
			restrict: 'E',
			templateUrl: 'themes/xwst/js/layout/sidebar-menu.html',
			controller: 'SidebarMenuCtrl'
		};
	});
