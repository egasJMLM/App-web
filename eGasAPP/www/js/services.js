angular.module('app.services', [])

.factory('Swap', function (AsyncSwap, $http, $ionicPopup, $q, $ionicLoading) {
    var Swap = {};
    Swap.user = ''; //json with type 0 (dealer: type, id_de, username, pass, name, surname, id_di), 1 (user: type, id_us, username, pass, main_ad (if <0 no main_ad)) and more 

    Swap.userOrders = []; // json array with orders (id_ad, id_or, quantity, kind, cost_u, date, deliver_time, 
                                  //state (-2 incorrect, -1 canceled, 0 pending, 1 realized user, 2 realized delivery, 3 full realized), id_co)
    Swap.order = ''; //json with only an order (id_ad, id_or, quantity, kind, cost_u, date, deliver_time, state, id_co)
    Swap.userAddresses = []; //json array with addresses (id_ad, h_c, street, cp, num, floor, flat, lift, tenants, id_bo)

    Swap.dealerOrders = []; //json array with orders (id_or, quantity, kind, cost_u, date, deliver_time, 
                                //state (-2 incorrect, -1 canceled, 0 pending, 1 realized user, 2 realized delivery, 3 full realized), id_co,
                                //id_ad, h_c, street, cp, num, floor, flat, lift)
    Swap.previousPage = '';

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
        Swap.userOrders.length = 0;

        AsyncSwap.getUserAddresses(Swap.user.id_us).then(function (data) {
            Swap.userAddresses = data;
            for (i = 0; i < Swap.userAddresses.length; i++)
            {
                AsyncSwap.getUserOrders_addressId(Swap.userAddresses[i].id_ad).then(function (data2) {
                    Swap.userOrders = data2;
                })
            }
        })  
    }

    Swap.getUserAddresses = function () {
        AsyncSwap.getUserAddresses(Swap.user.id_us).then(function(data) {
            Swap.userAddresses = data;
            $ionicLoading.hide();
        })
    }

    Swap.getDealerOrders = function () {
        Swap.dealerOrders.length = 0;

        AsyncSwap.getDealerOrders(Swap.user.id_de).then(function (data) {
            Swap.dealerOrders = data;
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
                Aqui llega si alguna dirección no tiene pedido, ¿sacar algo?
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
    AsyncSwap.dealerOrders = [];

    return {
        getUserAddresses: function (id_us) {
            var AsyncSwapDeferer = $q.defer();
            var iSuccess = 0;
            AsyncSwap.userAddresses.length = 0;

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
                                if (data2.dataDB[0].home_commerce == 'h')
                                {
                                    data2.dataDB[0].home_commerce = "Vivienda";
                                }
                                else
                                {
                                    data2.dataDB[0].home_commerce = "Local Comercial";
                                }
                                AsyncSwap.userAddresses.push({
                                    id_ad: data2.dataDB[0].id_ad, h_c: data2.dataDB[0].home_commerce, street: data2.dataDB[0].street,
                                    cp: data2.dataDB[0].cp, num: data2.dataDB[0].num, floor: data2.dataDB[0].floor, flat: data2.dataDB[0].flat,
                                    lift: data2.dataDB[0].lift, tenants: data2.dataDB[0].tenants, id_bo: "Tipo 1"
                                });
                                iSuccess++;
                                if (iSuccess == data.dataDB.length) {
                                    AsyncSwapDeferer.resolve(AsyncSwap.userAddresses);
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
                                AsyncSwap.userOrders.push({
                                    id_ad: id_ad, id_or: data2.dataDB[0].id_or, quantity: data2.dataDB[0].quantity, kind: data2.dataDB[0].kind,
                                    cost_u: data2.dataDB[0].cost_u, date: data2.dataDB[0].date, deliver_time: data2.dataDB[0].deliver_time,
                                    state: data2.dataDB[0].state, id_co: data2.dataDB[0].id_co
                                });
                                iSuccess++;

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

                                iSuccess++;
                                if (iSuccess == data.dataDB.length)
                                {
                                    AsyncSwapDeferer.reject(AsyncSwap.userOrders);
                                }
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
                    Aqui llega si alguna dirección no tiene pedido, ¿sacar algo?
                    $ionicPopup.alert({
                        title: 'No pedido',
                        template: 'No pedido'
                    });*/
                    
                    AsyncSwapDeferer.resolve(AsyncSwap.userOrders);
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
        },

        getDealerOrders: function (id_de) {
            var AsyncSwapDeferer = $q.defer();
            var iSuccess = 0;

            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
            { type: 'get', table: 'LINK_ORDER_DEALER', field: ['id_or'], where: ['id_de'], wherecond: [id_de] })
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
                                $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                {
                                    type: 'get', table: 'LINK_ADDRESS_ORDER', field: ['id_ad'], where: ['id_or'], wherecond: [id_or]
                                })
                                .success(function (data3) {
                                    if (data3.success) {
                                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                        {
                                            type: 'get', table: 'ADDRESS', field: ['id_ad','home_commerce','street','cp','num','floor','flat','lift'], 
                                            where: ['id_ad'], wherecond: [data3.dataDB[0].id_ad]
                                        })
                                        .success(function (data4) {
                                            if (data4.success) {
                                                if (data4.dataDB[0].home_commerce == 'h') {
                                                    data4.dataDB[0].home_commerce = "Vivienda";
                                                }
                                                else {
                                                    data4.dataDB[0].home_commerce = "Local Comercial";
                                                }

                                                if (data2.dataDB[0].deliver_time == 'm') {
                                                    data2.dataDB[0].deliver_time = "Mañana";
                                                }
                                                else {
                                                    data2.dataDB[0].deliver_time = "Tarde";
                                                }
                                                
                                                AsyncSwap.dealerOrders.push({
                                                    id_or: data2.dataDB[0].id_or, quantity: data2.dataDB[0].quantity, kind: data2.dataDB[0].kind,
                                                    cost_u: data2.dataDB[0].cost_u, date: data2.dataDB[0].date, deliver_time: data2.dataDB[0].deliver_time,
                                                    state: data2.dataDB[0].state, id_co: data2.dataDB[0].id_co, 
                                                    id_ad: data4.dataDB[0].id_ad, h_c: data4.dataDB[0].home_commerce, street: data4.dataDB[0].street, cp: data4.dataDB[0].cp,
                                                    num: data4.dataDB[0].num, floor: data4.dataDB[0].floor, flat: data4.dataDB[0].flat, lift: data4.dataDB[0].lift
                                                });

                                                iSuccess++;
                                                if (iSuccess == data.dataDB.length)
                                                {
                                                    AsyncSwapDeferer.resolve(AsyncSwap.dealerOrders);
                                                }
                                            }
                                            else{
                                                $ionicPopup.alert({
                                                    title: 'Error',
                                                    template: 'Alg&uacute;n pedido con direcci&oacute;n inexistente'
                                                });

                                                iSuccess++;
                                                if (iSuccess == data.dataDB.length)
                                                {
                                                    AsyncSwapDeferer.reject(AsyncSwap.dealerOrders);
                                                }

                                            }
                                        })
                                        .error(function(data3){
                                            $ionicPopup.alert({
                                                title: 'Error',
                                                template: 'Conexi&oacute;n err&oacute;nea'
                                            });
                                            AsyncSwapDeferer.reject(AsyncSwap.dealerOrders);
                                        })
                                    }
                                    else{
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: 'Alg&uacute;n pedido sin direcci&oacute;n vinculada'
                                        });

                                        iSuccess++;
                                        if (iSuccess == data.dataDB.length)
                                        {
                                            AsyncSwapDeferer.reject(AsyncSwap.dealerOrders);
                                        }
                                    }
                                })
                                .error(function(data3){
                                    $ionicPopup.alert({
                                        title: 'Error',
                                        template: 'Conexi&oacute;n err&oacute;nea'
                                    });
                                    AsyncSwapDeferer.reject(AsyncSwap.dealerOrders);
                                })
                                
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Al buscar alg&uacute;n pedido'
                                });
                                iSuccess++;
                                if (iSuccess == data.dataDB.length)
                                {
                                    AsyncSwapDeferer.reject(AsyncSwap.dealerOrders);
                                }
                            }
                        })
                        .error(function (data2) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                            AsyncSwapDeferer.reject(AsyncSwap.dealerOrders);
                        })
                    }
                }
                else {
                    $ionicPopup.alert({
                        title: 'Aviso',
                        template: 'No tiene ning&uacute;n pedido asociado'
                    });
                    
                    AsyncSwapDeferer.resolve(AsyncSwap.dealerOrders);
                }
            })
            .error(function (data) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                });
                AsyncSwapDeferer.reject(AsyncSwap.dealerOrders);
            });

            return AsyncSwapDeferer.promise
        }
        
    }
})

.service('BlankService', [function(){

}]);

