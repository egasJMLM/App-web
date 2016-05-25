angular.module('app.services', [])

.factory('Swap', function (AsyncSwap, $http, $ionicPopup, $q) {
    var Swap = {};
    Swap.user = ''; //json with type 0 (dealer: type, id_de, username, pass, name, surname, id_di), 1 (user: type, id_us, username, pass, main_ad) and more 
    Swap.userOrders = []; // json array with orders (id_ad, id_or, quantity, kind, cost_u, date, deliver_time, 
                                  //state (-2 incorrect, -1 canceled, 0 pending, 1 realized user, 2 realized delivery, 3 full realized), id_co)
    Swap.order = ''; //json with only an order (id_ad, id_or, quantity, kind, cost_u, date, deliver_time, state, id_co)
    Swap.userAddresses = []; //json array with addresses (id_ad, h_c, street, cp, num, floor, flat, lift, tenants, id_bo)

    /*Swap.getUserAddresses = function () {
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
    };*/

    Swap.getUserOrders = function () {
        Swap.userOrders = [];
        console.log("1");

        AsyncSwap.getUserAddresses(Swap.user.id_us).then(function (data) {
            console.log("AAAA "+data.length);
            Swap.userAddresses = data;
            console.log("BBBB " + data.length);
            for (i = 0; i < Swap.userAddresses.length; i++)
            {
                console.log("id_ad: " + Swap.userAddresses[i].id_ad);
                AsyncSwap.getUserOrders_addressId(Swap.userAddresses[i].id_ad).then(function (data2) {
                    Swap.userOrders = data2;
                    console.log("CCCC " + Swap.userOrders.length);
                })
            }
            console.log("3");
        })  
    }

    /*Swap.getUserOrders_addressId = function(id_ad)
    {
        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
        { type: 'get', table: 'LINK_ADDRESS_ORDER', field: ['id_or'], where: ['id_ad'], wherecond: [id_ad] })
        .success(function (data) {
            if (data.success) {
                for (i = 0; i < data.dataDB.length; ++i) {
                    id_or = data.dataDB[i].id_or;
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                    {
                        type: 'get', table: 'ORDERS', field: ['id_or', 'quantity', 'kind', 'cost_u', 'date', 'deliver_time', 'state', 'id_co'],
                        where: ['id_or'], wherecond: [id_or]
                    })
                    .success(function (data2) {
                        if (data2.success) {
                            Swap.userOrders.push({
                                id_ad: id_ad, id_or: data2.dataDB[0].id_or, quantity: data2.dataDB[0].quantity, kind: data2.dataDB[0].kind,
                                cost_u: data2.dataDB[0].cost_u, date: data2.dataDB[0].date, deliver_time: data2.dataDB[0].deliver_time,
                                state: data2.dataDB[0].state, id_co: data2.dataDB[0].id_co
                            });
                        }
                        else {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Al buscar alg&uacute;n pedido'
                            });
                        }
                    })
                    .error(function (data2) {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea'
                        });
                    })
                }
            }
            else {*/
                /*
                Aqui llega si alguna direcci�n no tiene pedido, �sacar algo?
                $ionicPopup.alert({
                    title: 'No pedido',
                    template: 'No pedido'
                });*/
           /* }
        })
        .error(function (data) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Conexi&oacute;n err&oacute;nea'
            });
        })
    };*/

    return Swap;

})

.factory('AsyncSwap', function ($http, $ionicPopup, $q) {

    var AsyncSwap = {};
    AsyncSwap.userOrders = [];
    AsyncSwap.userAddresses = [];

    return {
        getUserAddresses: function (id_us) {
            var AsyncSwapDeferer = $q.defer();
            var iSuccess = 0;
            console.log("AQUI");
            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
            { type: 'get', table: 'LINK_USER_ADDRESS', field: ['id_ad'], where: ['id_us'], wherecond: [id_us] })
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
                                AsyncSwap.userAddresses.push({
                                    id_ad: data2.dataDB[0].id_ad, h_c: data2.dataDB[0].home_commerce, street: data2.dataDB[0].street,
                                    cp: data2.dataDB[0].cp, num: data2.dataDB[0].num, floor: data2.dataDB[0].floor, flat: data2.dataDB[0].flat,
                                    lift: data2.dataDB[0].lift, tenants: data2.dataDB[0].tenants, id_bo: "Tipo 1"
                                });
                                iSuccess++;
                                if (iSuccess == data.dataDB.length) {
                                    AsyncSwapDeferer.resolve(AsyncSwap.userAddresses);
                                    console.log("resolve " + iSuccess);
                                }
                            }
                        })
                        .error(function (data2) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                            AsyncSwapDeferer.reject(AsyncSwap.userAddresses);
                        });
                    }
                }
            })
            .error(function (data) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                });
                AsyncSwapDeferer.reject(AsyncSwap.userAddresses);
            });
            return AsyncSwapDeferer.promise
        },

        getUserOrders_addressId: function (id_ad) {
            var AsyncSwapDeferer = $q.defer();
            var iSuccess = 0;
            console.log("AQUI2");
            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
            { type: 'get', table: 'LINK_ADDRESS_ORDER', field: ['id_or'], where: ['id_ad'], wherecond: [id_ad] })
            .success(function (data) {
                if (data.success) {
                    for (i = 0; i < data.dataDB.length; ++i) {
                        id_or = data.dataDB[i].id_or;
                        console.log("id_or "+id_or);
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                        {
                            type: 'get', table: 'ORDERS', field: ['id_or', 'quantity', 'kind', 'cost_u', 'date', 'deliver_time', 'state', 'id_co'],
                            where: ['id_or'], wherecond: [id_or]
                        })
                        .success(function (data2) {
                            if (data2.success) {
                                AsyncSwap.userOrders.push({
                                    id_ad: id_ad, id_or: data2.dataDB[0].id_or, quantity: data2.dataDB[0].quantity, kind: data2.dataDB[0].kind,
                                    cost_u: data2.dataDB[0].cost_u, date: data2.dataDB[0].date, deliver_time: data2.dataDB[0].deliver_time,
                                    state: data2.dataDB[0].state, id_co: data2.dataDB[0].id_co
                                });
                                iSuccess++;
                                console.log("getUserOrders_add: " + AsyncSwap.userOrders.length);
                                if (iSuccess == data.dataDB.length)
                                {
                                    AsyncSwapDeferer.resolve(AsyncSwap.userOrders);
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Al buscar alg&uacute;n pedido'
                                });
                                AsyncSwapDeferer.reject(AsyncSwap.userOrders);
                            }
                        })
                        .error(function (data2) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                            AsyncSwapDeferer.reject(AsyncSwap.userOrders);
                        })
                    }
                }
                else {
                    /*
                    Aqui llega si alguna direcci�n no tiene pedido, �sacar algo?
                    $ionicPopup.alert({
                        title: 'No pedido',
                        template: 'No pedido'
                    });*/
                    iSuccess++;
                    console.log("22getUserOrders_add: " + AsyncSwap.userOrders.length);
                    if (iSuccess == data.dataDB.length) {
                        AsyncSwapDeferer.resolve(AsyncSwap.userOrders);
                    }
                }
            })
            .error(function (data) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                });
                AsyncSwapDeferer.reject(AsyncSwap.userOrders);
            });

            return AsyncSwapDeferer.promise
        }
    }
})

.service('BlankService', [function(){

}]);

