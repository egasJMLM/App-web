angular.module('app.services', [])

.factory('Swap', [function () {
    Swap = {};
    Swap.user = ''; //json with type 0 (dealer: type, id_de, username, pass, name, surname, id_di), 1 (user: type, id_us, username, pass, main_ad) and more 
    Swap.orders     =   '';
    Swap.orderId = '';
    Swap.userAddresses = []; //json array with addresses (id_ad, h_c, street, cp, num, floor, flat, lift, tenants, id_bo)

    return Swap;

}])

.factory('globalFunctions', function ($http) {
    var ret = [];

    return {
        checkAddress: function (address) {
            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                type: 'get', table: 'ADDRESS', field: ['id_ad'],
                where: ['home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                wherecond: [address.type, address.street.toUpperCase(), address.cp.toUpperCase(), address.number, address.floor,
                    address.letter.toUpperCase(), address.lift, address.persons, '1']
            })
            .success(function (data) {
                if (data.success) {
                }
            })
            .error(function (data) {
                              
            })
        }
    }
})

.service('BlankService', [function(){

}]);

