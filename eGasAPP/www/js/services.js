angular.module('app.services', [])

.factory('Swap', function (AsyncSwap, $http, $ionicPopup, $q, $ionicLoading) {
    var Swap = {};
    Swap.user = ''; //json with type 0 (dealer: type, id_de, username, pass, name, surname, id_di), 1 (user: type, id_us, username, pass, main_ad (if <0 no main_ad)) and more 

    Swap.userOrders = []; // json array with orders (id_ad, id_or, quantity, kind, bottle, cost_u, date, deliver_time, 
                                  //state (-2 incorrect, -1 canceled, 0 pending, 1 realized user, 2 realized delivery, 3 full realized, 4 shipping), id_co)
    Swap.order = ''; //json with only an order (id_ad, id_or, quantity, kind, bottle, cost_u, date, deliver_time, state, id_co)
    Swap.userAddresses = []; //json array with addresses (id_ad, h_c, street, cp, num, floor, flat, lift, tenants, bottle)

    Swap.dealerOrders = []; //json array with orders (id_or, quantity, kind, bottle, cost_u, date, deliver_time, 
                                //state (-2 incorrect, -1 cancelled, 0 pending, 1 realized user, 2 realized delivery, 3 full realized, 4 shipping), id_co,
                                //id_ad, h_c, street, cp, num, floor, flat, lift)
    Swap.bottles = []; //json array with bottles types in DB (id_bo, weight, empty_weight, kind, gas)

    Swap.previousPage = '';

    Swap.getUserOrders = function () {
        Swap.userOrders.length = 0;

        AsyncSwap.getUserAddresses(Swap.user.id_us).then(function (data) {
            for (i = 0; i < data.length; ++i) {
                for (j = 0; j < Swap.bottles.length; ++j) {
                    if (data[i].bottle == Swap.bottles[j].id_bo) {
                        data[i].bottle = {
                            id_bo: Swap.bottles[j].id_bo, weight: Swap.bottles[j].weight, empty_weight: Swap.bottles[j].empty_weight,
                            kind: Swap.bottles[j].kind, gas: Swap.bottles[j].gas
                        }
                        j = Swap.bottles.length;
                    }
                }
            }
            Swap.userAddresses = data;

            for (i = 0; i < Swap.userAddresses.length; i++)
            {
                AsyncSwap.getUserOrders_addressId(Swap.userAddresses[i].id_ad).then(function (data2) {
                    for (i = 0; i < data2.length; ++i)
                    {
                        for(j=0; j < Swap.bottles.length; ++j)
                        {
                            if(data2[i].bottle == Swap.bottles[j].id_bo)
                            {
                                data2[i].bottle = {
                                    id_bo: Swap.bottles[j].id_bo, weight: Swap.bottles[j].weight, empty_weight: Swap.bottles[j].empty_weight,
                                    kind: Swap.bottles[j].kind, gas: Swap.bottles[j].gas
                                }
                                j = Swap.bottles.length;
                            }
                        }
                    }
                    Swap.userOrders = data2;
                })
            }
        })  
    }

    Swap.getBottles = function () {
        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
        {
            type: 'get', table: 'BOTTLE', field: ['id_bo', 'weight', 'empty_weight', 'kind', 'gas']
        })
        .success(function (data) {
            if (data.success)
            {
                Swap.bottles = (data.dataDB).slice(0);
            }
        })
        .error(function (data) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Conexi&oacute;n err&oacute;nea'
                });
        });
    }

    Swap.getUserAddresses = function () {
        AsyncSwap.getUserAddresses(Swap.user.id_us).then(function (data) {
            for (i = 0; i < data.length; ++i) {
                for (j = 0; j < Swap.bottles.length; ++j) {
                    if (data[i].bottle == Swap.bottles[j].id_bo) {
                        data[i].bottle = {
                            id_bo: Swap.bottles[j].id_bo, weight: Swap.bottles[j].weight, empty_weight: Swap.bottles[j].empty_weight,
                            kind: Swap.bottles[j].kind, gas: Swap.bottles[j].gas
                        }
                        j = Swap.bottles.length;
                    }
                }
            }
            Swap.userAddresses = data;
        })
    }

    Swap.getDealerOrders = function () {
        Swap.dealerOrders.length = 0;

        AsyncSwap.getDealerOrders(Swap.user.id_de).then(function (data) {
            for (i = 0; i < data.length; ++i) {
                for (j = 0; j < Swap.bottles.length; ++j) {
                    if (data[i].bottle == Swap.bottles[j].id_bo) {
                        data[i].bottle = {
                            id_bo: Swap.bottles[j].id_bo, weight: Swap.bottles[j].weight, empty_weight: Swap.bottles[j].empty_weight,
                            kind: Swap.bottles[j].kind, gas: Swap.bottles[j].gas
                        }
                        j = Swap.bottles.length;
                    }
                }
            }
            Swap.dealerOrders = data;
        })
    }

    return Swap;

})

.factory('AsyncSwap', function ($http, $ionicPopup, $q) {

    var AsyncSwap = {};
    AsyncSwap.userOrders = [];
    AsyncSwap.userAddresses = [];
    AsyncSwap.dealerOrders = [];
    AsyncSwap.basculesByAddress = [] //json array with bascules by address ( id_ad: idAd, bascules: {id_ba, nombre} )

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
                                    lift: data2.dataDB[0].lift, tenants: data2.dataDB[0].tenants, bottle: data2.dataDB[0].id_bo
                                });
                                iSuccess++;
                                if (iSuccess == data.dataDB.length) {
                                    AsyncSwapDeferer.resolve(AsyncSwap.userAddresses);
                                }
                            }
                            else
                            {
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
                            type: 'get', table: 'ORDERS', field: ['id_or', 'quantity', 'kind', 'id_bo','cost_u', 'date', 'deliver_time', 'state', 'id_co'],
                            where: ['id_or'], wherecond: [id_or]
                        })
                        .success(function (data2) {
                            if (data2.success) {
                                AsyncSwap.userOrders.push({
                                    id_ad: id_ad, id_or: data2.dataDB[0].id_or, quantity: data2.dataDB[0].quantity, kind: data2.dataDB[0].kind,
                                    bottle: data2.dataDB[0].id_bo, cost_u: data2.dataDB[0].cost_u, date: data2.dataDB[0].date,
                                    deliver_time: data2.dataDB[0].deliver_time, state: data2.dataDB[0].state, id_co: data2.dataDB[0].id_co
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
                                    AsyncSwapDeferer.resolve(AsyncSwap.userOrders);
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
                            type: 'get', table: 'ORDERS', field: ['id_or', 'quantity', 'kind', 'id_bo','cost_u', 'date', 'deliver_time', 'state', 'id_co'],
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
                                                    bottle: data2.dataDB[0].id_bo, cost_u: data2.dataDB[0].cost_u, date: data2.dataDB[0].date,
                                                    deliver_time: data2.dataDB[0].deliver_time, state: data2.dataDB[0].state, id_co: data2.dataDB[0].id_co, 
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
                                                    AsyncSwapDeferer.resolve(AsyncSwap.dealerOrders);
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
                                            AsyncSwapDeferer.resolve(AsyncSwap.dealerOrders);
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
        },
     
        getBasculesByAddress: function(idAd) //success returns bascules, error 0 if no bascule or -1 if connection error
        {
            var AsyncSwapDeferer = $q.defer();         
            var iSuccess = 0;

            AsyncSwap.basculesByAddress.length = 0;
            if (AsyncSwap.basculesByAddress.bascules)
            {
                AsyncSwap.basculesByAddress.bascules.length = 0;
            }

            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
            {
                type: 'get', table: 'LINK_ADDRESS_BASCULE', field: ['id_ba'], where: ['id_ad'], wherecond: [idAd]
            })
            .success(function (data) {
                if (data.success) {
                    AsyncSwap.basculesByAddress = { id_ad: idAd, bascules: [] };
                    for (i = 0; i < data.dataDB.length; ++i)
                    {
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                        {
                            type: 'get', table: 'BASCULE', field: ['id_ba', 'nombre'],
                            where: ['id_ba'], wherecond: [data.dataDB[i].id_ba]
                        })
                        .success(function (data1) {
                            if (data1.success)
                            {
                                AsyncSwap.basculesByAddress.bascules.push({ id_ba: data1.dataDB[0].id_ba, nombre: data1.dataDB[0].nombre });

                                iSuccess++;
                                if(iSuccess == data.dataDB.length)
                                {
                                    AsyncSwapDeferer.resolve(AsyncSwap.basculesByAddress);
                                }
                            }
                            else
                            {
                                iSuccess++;
                                if (iSuccess == data.dataDB.length) {
                                    AsyncSwapDeferer.resolve(AsyncSwap.basculesByAddress);
                                }
                            }
                        })
                        .error(function (data1) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                            AsyncSwapDeferer.reject(-1);
                        });
                    }
                }
                else
                {
                    AsyncSwapDeferer.reject(0);
                }
            })
            .error(function (data) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                });
                AsyncSwapDeferer.reject(-1);
            });
            return AsyncSwapDeferer.promise
        },

        getLastMeasureByBascule: function(idBa)
        {
            var AsyncSwapDeferer = $q.defer();
            var iSuccess = 0;
            measures = [];
            measures.length = 0;
            sortedMeasures = [];
            sortedMeasures.length = 0;

            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
            {
                type: 'get', table: 'LINK_BASCULE_MEASURE', field: ['id_me'],
                where: ['id_ba'], wherecond: [idBa]
            })
            .success(function (data) {
                if (data.success) {
                    for (i = 0; i < data.dataDB.length; i++)
                    {
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                        {
                            type: 'get', table: 'MEASURE', field: ['value','date'],
                            where: ['id_me'], wherecond: [data.dataDB[i].id_me]
                        })
                        .success(function (data1) {
                            if (data1.success) {
                                measures.push({ value: data1.dataDB[0].value, date: data1.dataDB[0].date });

                                iSuccess++;
                                if (iSuccess == data.dataDB.length) {
                                    sortedMeasures = measures.sort(function (a, b) {var c = new Date(a.date);
                                                                                    var d = new Date(b.date);
                                                                                    return d - c;});

                                    AsyncSwapDeferer.resolve(sortedMeasures[0]);
                                }
                            }
                            else
                            {
                                iSuccess++;
                                if (iSuccess == data.dataDB.length) {
                                    sortedMeasures = measures.sort(function (a, b) {var c = new Date(a.date);
                                                                                    var d = new Date(b.date);
                                                                                    return d - c;});

                                    AsyncSwapDeferer.resolve(sortedMeasures[0]);
                                }

                            }
                        })
                    }
                }
                else {
                    iSuccess++;
                    if (iSuccess == data.dataDB.length) {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'No existen medidas para esta b&aacute;scula'
                        });
                        AsyncSwapDeferer.reject(0);
                    }
                }
            })
            .error(function (data) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                    });
                AsyncSwapDeferer.reject(-1);
            });

            return AsyncSwapDeferer.promise
        }
    }
})

.service('BlankService', [function(){

}]);

