angular.module('app.directives', [])

.directive('clickForOptions', ['$ionicGesture', function($ionicGesture) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $ionicGesture.on('tap', function(e){
                // Grab the content
                var content = element[0].querySelector('.item-content');
                // Grab the buttons and their width
                var buttons = element[0].querySelector('.item-options');

                if (!buttons) {
                    return;
                }
                var buttonsWidth = buttons.offsetWidth;

                ionic.requestAnimationFrame(function() {
                    content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';
                  
                    if (!buttons.classList.contains('invisible')) {
                        content.style[ionic.CSS.TRANSFORM] = '';
                        setTimeout(function() {
                            buttons.classList.add('invisible');
                        }, 250);				
                    } else {
                        buttons.classList.remove('invisible');
                        content.style[ionic.CSS.TRANSFORM] = 'translate3d(-' + buttonsWidth + 'px, 0, 0)';
                    }
                });		

            }, element);
        }
    };
}]);

