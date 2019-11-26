app.run(['$rootScope', '$sessionStorage','connection','$i18next','$sce', function($rootScope, $sessionStorage, connection,$i18next,$sce) {

    /* PUT HERE ALL YOUR CUSTOM CODE THAT YOU NEED TO INIT AT APPLICATION RUN (for not to modify the main webapp.js*/

    //Get the user position
    $rootScope.getMyPosition = function(done)
    {
    	if ($rootScope.user.position)
    	{
    		done($rootScope.user.position);
    	} else {
    		connection.get('/api/v3/positions/get-my-position', {}, function(data) {
                        $rootScope.user.position = data.item;
                        done($rootScope.user.position);
    		});
    	}
    }
}]);