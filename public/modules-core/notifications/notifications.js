angular.module('wice').controller('notificationsCtrl', function ($scope, connection, $stateParams, $q, $rootScope, webNotification, $window ,$i18next) {
    var notificationDays = [];

    $scope.data = null;

    $scope.getNotificationsDropdown = function() {
        loadNotificationsDropdown();
        setInterval(loadNotificationsDropdown, 60000);
    };

    $scope.getNotifications = function() {
        connection.get('/api/notifications/get-notifications', {}, function(data) {
            if (data.notifications.length == 0) {
                $('#no-notifications-info').show();
            }

            for (var i in data.notifications) {
                var date = new Date(data.notifications[i].created);
                var notificationDay = getDay(date), day = false;

                day = (notificationDays.indexOf(notificationDay) > -1);

                if (!day) {
                    var dayLabel = $('<span class="timeline-label"><b>'+notificationDay+'</b></span>');

                    $('#timeline-container').append(dayLabel);

                    var notificationsContainer = $('<div class="timeline-centered" id="'+notificationDay.replace(" ","-")+'"></div>');

                    $('#timeline-container').append(notificationsContainer);

                    notificationDays.push(notificationDay);
                }

                var timelineItem = $('#timeline-item').clone();

                timelineItem.attr('id', '');

                timelineItem.find('.timeline-time').children('span').html( moment(date).fromNow()); //. getTime(date));


                var text = (data.notifications[i].url) ? '<a href="'+data.notifications[i].url+'">'+data.notifications[i].text+'</a>' : data.notifications[i].text;
                timelineItem.find('.timeline-label').children('h2').html(text);

                $('#'+notificationDay.replace(" ","-")).append(timelineItem);

                timelineItem.show();
            }
        }, {showMsg: false});
    };

    $scope.acceptNotification = function(notification) {
        connection.post('/api/notifications/accept-notification', notification, function(result) {
            if (result.result == 1) {
                notification.accepted = true;
                window.location.hash = notification.accept_url;
            }
        }, {showMsg: false});
    };

    $scope.markAsViewed = function() {
        $('.notifications-counter').removeClass('badgeImportant');

        connection.post('/api/notifications/mark-as-viewed', {}, function(result) {
            showLoader: false

        });
    };

    $rootScope.sendNotification = function(userId, text, type, communicationId, acceptURL) {
        communicationId = (typeof communicationId == 'undefined') ? null : communicationId;
        acceptURL = (typeof acceptURL == 'undefined') ? null : acceptURL;

        connection.post('/api/notifications/send-notification', {user_id: userId, text: text, type: type, communication_id: communicationId, accept_url: acceptURL}, function(data) {
            return true;
        });
    };

    function loadNotificationsDropdown() {
        var lastUnviewedNotifications = $scope.unviewedNotifications;
        connection.get('/api/notifications/get-dropdown', {}, function(data) {
            $scope.unviewedNotifications = data.unviewed;
            $scope.notifications = data.notifications;
            for (var n in $scope.notifications)
            {
                var notification = $scope.notifications[n];
                notification.createdFrom = moment(notification.created).fromNow();
            }

            if (lastUnviewedNotifications < $scope.unviewedNotifications)
            {
                //there are new notifications
                fireWebNotification('title', 'There are new notifications','favicon.ico');
            }
        }, {showLoader: false});
    }

    function getNotificationIcon(type) {
        var notificationsIcons = [
            {icon: 'fa fa-info', value: 1},
            {icon: 'fa fa-warning', value: 2}
        ];

        return notificationsIcons[type-1].icon;
    }

    function getTime(date) {
        return date.getHours()+":"+date.getMinutes();
    }

    function getDay(date) {
        var today = new Date();
        var months = [
            $scope.getTranslation("Jan"),
            $scope.getTranslation("Feb"),
            $scope.getTranslation("Mar"),
            $scope.getTranslation("Apr"),
            $scope.getTranslation("May"),
            $scope.getTranslation("Jun"),
            $scope.getTranslation("Jul"),
            $scope.getTranslation("Aug"),
            $scope.getTranslation("Sep"),
            $scope.getTranslation("Oct"),
            $scope.getTranslation("Nov"),
            $scope.getTranslation("Dec")
        ];

        if (date.getYear() == today.getYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate())
            return $scope.getTranslation("Today");
        else if (date.getYear() == today.getYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate()-1)
            return $scope.getTranslation("Yesterday");
        else
            return months[date.getMonth()]+" "+date.getDate();
    }

    function fireWebNotification(title,body,icon)
    {
            webNotification.showNotification(title, {
                body: body,
                icon: icon,
                onClick: function onNotificationClicked() {

                    $window.location.href = '#/notifications';
                },
                autoClose: 10000 //auto close the notification after 4 seconds (you can manually close it via hide function)
            }, function onShow(error, hide) {
                var audio = new Audio('notification.mp3');
                    audio.play();
                if (error) {
                    window.alert('Unable to show notification: ' + error.message);
                } else {
                    setTimeout(function hideNotification() {
                        hide(); //manually close the notification (you can skip this if you use the autoClose option)
                    }, 10000);
                }
            });
        }

});

app.config(function($stateProvider) {

    $stateProvider.state('notifications',{
        url:'/notifications',
        templateUrl: '/notifications/views/notifications.html',
        controller: 'notificationsCtrl'
        /*resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load('modules/core/controllers/notifications.js');
            }]
        }*/
    });

});
