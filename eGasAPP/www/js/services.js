angular.module('app.services', [])

.factory('Swap', [function () {
    Swap = {};
    Swap.orders     =   '';
    Swap.orderId    =   '';

    return Swap;

}])

.service('BlankService', [function(){

}]);

