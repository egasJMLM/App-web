angular.module('app.services', [])

.factory('Swap', [function () {
    Swap = {};
    Swap.user = ''; //json with type 0 (dealer: type, id_de, username, pass, name, surname, id_di), 1 (user: type, id_us, username, pass, main_ad) and more 
    Swap.orders     =   '';
    Swap.orderId = '';
    Swap.userAddresses = []; //json array with addresses (id_ad, h_c, street, cp, num, floor, flat, lift, tenants, id_bo)

    return Swap;

}])

.service('BlankService', [function(){

}]);

