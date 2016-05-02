angular.module('app.services', [])

.factory('Swap', function ($http) {
    var Swap = {};
    Swap.user = ''; //json with type 0 (dealer: type, id_de, username, pass, name, surname, id_di), 1 (user: type, id_us, username, pass, main_ad) and more 
    Swap.userOrders = []; // json array with orders (id_or, quantity, kind, cost_u, date, deliver_time, 
                                                    //state (-1 canceled, 0 pending, 1 realized user, 2 realized delivery, 3 full realized), id_co)
    Swap.order = ''; //json with only an order (id_or, quantity, kind, cost_u, date, deliver_time, state, id_co)
    Swap.userAddresses = []; //json array with addresses (id_ad, h_c, street, cp, num, floor, flat, lift, tenants, id_bo)

    Swap.getUserAddresses = function () {
        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
        { type: 'get', table: 'LINK_USER_ADDRESS', field: ['id_ad'], where: ['id_us'], wherecond: [Swap.user.id_us] })
        .success(function (data) {
            if (data.success) {
                for (i = 0; i < data.dataDB.length; i++) {
                    id_ad = data.dataDB[i].id_ad;
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                    {
                        type: 'get', table: 'ADDRESS', field: ['id_ad', 'home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                        where: ['id_ad'], wherecond: [id_ad]
                    })
                    .success(function (data2) {
                        if (data2.success) {
                            if (data2.dataDB[0].home_commerce == "h") {
                                data2.dataDB[0].home_commerce = "Vivienda";
                            }
                            else {
                                data2.dataDB[0].home_commerce = "Local comercial";
                            }
                            Swap.userAddresses.push({
                                id_ad: data2.dataDB[0].id_ad, h_c: data2.dataDB[0].home_commerce, street: data2.dataDB[0].street,
                                cp: data2.dataDB[0].cp, num: data2.dataDB[0].num, floor: data2.dataDB[0].floor, flat: data2.dataDB[0].flat,
                                lift: data2.dataDB[0].lift, tenants: data2.dataDB[0].tenants, id_bo: "Tipo 1"
                            });
                        }
                    })
                    .error(function (data2) {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea'
                        });
                    });
                }
            }
        })
        .error(function (data) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Conexi&oacute;n err&oacute;nea'
            });
        });
    };

    return Swap;

})

.service('BlankService', [function(){

}]);

