app.directive('chatWidget', function($rootScope,$location,socketFactory) {
    return {
        transclude: true,
        scope: {
            server: '='
        },

        templateUrl: "socket/views/chatWidget.html",

        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function ($scope, element, attrs) {
                
                $scope.array = [];
                $scope.message = {};
                
                //if ($scope.server == undefined)
                    //$scope.server = $location.host();
                    
                var theSocketService = SocketService();
                    
                theSocketService.emit('room', { roomId: "temp" });
            
                $scope.add = function() {
                    theSocketService.emit('toBackEnd', {roomId:'temp', data: $scope.message, date: new Date() })
                    $scope.array.push({ data: $scope.message, date: new Date() })
                }
            
                theSocketService.on('message', function(msg) {
                    $scope.array.push(msg)
                });   
            
        function SocketService()
        {
            return socketFactory({
                
                ioSocket: io.connect('www.tdiscoverer.net')
            });    
        }   
        }
    }
});