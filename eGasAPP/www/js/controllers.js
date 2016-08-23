angular.module('app.controllers', [])
  
.controller('loginCtrl', function ($scope, $ionicPopup, $state, $http, $ionicLoading, $timeout, Swap, OpenFB) {

    Swap.userOrders.length = 0;
    Swap.userAddresses.length = 0;
    Swap.dealerOrders.length = 0;

    $scope.fbLogin = function () {
        OpenFB.login('email').then(
            function () {
                console.log('Facebook login succeeded');
                $scope.closeLogin();
                $state.go('menuLateral.menuPrincipal');
            },
            function () {
                    alert('Facebook login failed');
            });
    };

    $scope.login = function (user) {
        if (!user || !user.name || !user.pass) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca usuario y contrase&ntilde;a'
            });
        }
        else {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            $http.post("http://www.e-gas.es/phpApp/middleDB.php", { type: 'get', table: 'USERS', field: ['id_us','main_ad'], where: ['user', 'pass'], wherecond: [user.name, user.pass] })
            .success(function (data) {
                if (data.success) {
                    Swap.user = { type: 1, id_us: data.dataDB[0].id_us, username: user.name, pass: user.pass, main_ad: data.dataDB[0].main_ad};
                    $state.go('menuLateral.menuPrincipal');
                    $ionicLoading.hide();
                }
                else {
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", { type: 'get', table: 'DEALER', field: ['id_de','name','surname','id_di'], where: ['user', 'pass'], wherecond: [user.name, user.pass] })
                    .success(function (data) {
                        if (data.success) {
                            Swap.user = { type: 0, id_de: data.dataDB[0].id_de, username: user.name, pass: user.pass, name: data.dataDB[0].name, surname: data.dataDB[0].surname, id_di: data.dataDB[0].id_di};
                            $state.go('menuPrincipal2');
                        }
                        else {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'No existe ning&uacute;n usuario con esos datos'
                            });
                        }
                        $ionicLoading.hide();
                    })
                    .error(function (data) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea'
                        });
                    });
                }
            })
            .error(function (data) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                });
            });
        }
    }

})
   
.controller('registrateCtrl', function ($scope, $ionicPopup, $state, $http, $ionicLoading) {

    $scope.signupValidation = function (signup) {
        if(signup.pass != signup.pass2)
        {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Las contrase&ntilde;as no coinciden'
            });
        }
        else if(signup.type == 'Vivienda' && (!signup.persons || signup.persons <= 0))
        {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca n&uacute;mero de inquilinos en la Vivienda'
            });
        }
        else
        {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                { type: 'get', table: 'USERS', field: ['id_us'], where: ['user'], wherecond: [signup.user] })
            .success(function (data) {
                if (data.success) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Ya existe un usuario con ese nombre de usuario. Por favor, seleccione otro'
                    });
                }
                else
                {
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                        type: 'new', table: 'USERS', field: ['user', 'pass', 'age', 'date', 'email', 'active', 'main_ad'],
                        value: [signup.user, signup.pass, signup.age, 'NOW()', signup.email, '1', '-1']
                    })
                    .success(function (data) {
                        if (data.success)
                        {
                            /*if (signup.type == 'Vivienda')
                            {
                                signup.type = 'h';
                            }
                            else
                            {
                                signup.type = 'c';
                            }
                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                type: 'get', table: 'ADDRESS', field: ['id_ad','floor','flat','lift','tenants','id_bo'], where: ['street','cp','num','home_commerce'],
                                wherecond: [signup.street.toUpperCase(), signup.cp.toUpperCase(), signup.number,signup.type]})
                            .success(function (data) {
                                if (data.success) {
                                    var selectedAddress = -1;
                                    for (i = 0; i < data.dataDB.length; i++)
                                    {
                                        console.log(data.dataDB[i].floor + " " + signup.floor + " " + data.dataDB[i].flat + " " + signup.letter.toUpperCase() + " " + data.dataDB[i].lift + " " + signup.lift);
                                        if(data.dataDB[i].floor == signup.floor && data.dataDB[i].flat == signup.letter.toUpperCase() && data.dataDB[i].lift == signup.lift)
                                        {
                                            console.log(data.dataDB[i].floor + " " + signup.floor + " " + data.dataDB[i].flat + " " + signup.letter.toUpperCase() + " " + data.dataDB[i].lift + " " + signup.lift);
                                            selectedAddress = i;
                                            break;
                                        }
                                    }
                                    if (selectedAddress > -1)
                                    {
                                        id_ad = data.dataDB[selectedAddress].id_ad;
                                        if(signup.persons != data.dataDB[selectedAddress].tenants) //Actualizo inquilinos si ha cambiado
                                        {
                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                type: 'upd', table: 'ADDRESS', field: ['tenants'], value: [signup.persons], where: ['id_ad'], wherecond: [id_ad]
                                            })
                                            .success(function (data) {
                                                if (data.success) {
                                                    console.log("Actualizacion correcta de inquilinos. " + data.dataDB);
                                                }
                                                else {
                                                    console.log("Actualizacion incorrecta. " + data.dataDB);
                                                }
                                            })
                                            .error(function (data) {
                                                console.log("Error de conexión al actualizar inquilinos");
                                            });
                                        }
                                        if ('1' != data.dataDB[selectedAddress].id_bo) //Actualizo tipo bombona si ha cambiado
                                        {
                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                type: 'upd', table: 'ADDRESS', field: ['id_bo'], value: ['1'], where: ['id_ad'], wherecond: [id_ad]
                                            })
                                            .success(function (data) {
                                                if (data.success) {
                                                    console.log("Actualizacion correcta de tipo de bombona. " + data.dataDB);
                                                }
                                                else {
                                                    console.log("Actualizacion incorrecta de tipo de bombona. " + data.dataDB);
                                                }
                                            })
                                            .error(function (data) {
                                                console.log("Error de conexión al actualizar tipo de bombona");
                                            });
                                        }
                                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                            { type: 'get', table: 'USERS', field: ['id_us'], where: ['user'], wherecond: [signup.user] })
                                        .success(function (data) {
                                            if (data.success)
                                            {
                                                $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                                    {
                                                        type: 'upd', table: 'USERS', field: ['main_ad'], value: [id_ad], where: ['id_us'],
                                                        wherecond: [data.dataDB[0].id_us]
                                                    })
                                                .success(function (data) {
                                                    if (data.success) {
                                                        console.log("Register. Added main address to user");
                                                    }
                                                    else {
                                                        console.log("Register. Invalid request adding main address to user");
                                                    }
                                                })
                                                .error(function (data) {
                                                    $ionicPopup.alert({
                                                        title: 'Error',
                                                        template: 'Conexi&oacute;n err&oacute;nea'
                                                    });
                                                });
                                                $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                                    {
                                                        type: 'new', table: 'LINK_USER_ADDRESS', field: ['id_us', 'id_ad'],
                                                        value: [data.dataDB[0].id_us, id_ad]
                                                    })
                                                .success(function (data) {
                                                    if (data.success) {
                                                        $ionicPopup.alert({
                                                            title: 'Registro correcto',
                                                            template: 'Se ha registrado en eGas satisfactoriamente. Gracias!'
                                                        });
                                                        $state.go('login');
                                                    }
                                                    else {
                                                        $ionicPopup.alert({
                                                            title: 'Registro de direcci&oacute;n incorrecto',
                                                            template: 'Error guardando datos de direcci&oacute;n. Puede acceder con su usuario'
                                                        });
                                                    }
                                                })
                                                .error(function (data) {
                                                    $ionicPopup.alert({
                                                        title: 'Error',
                                                        template: 'Conexi&oacute;n err&oacute;nea'
                                                    });
                                                });
                                            }
                                        })
                                        .error(function (data) {
                                            $ionicPopup.alert({
                                                title: 'Error',
                                                template: 'Conexi&oacute;n err&oacute;nea'
                                            });
                                        });
                                    }
                                }
                                if (data.success == false || selectedAddress == -1)
                                {
                                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                        type: 'new', table: 'ADDRESS',
                                        field: ['home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                                        value: [signup.type, signup.street.toUpperCase(), signup.cp.toUpperCase(), signup.number, signup.floor,
                                            signup.letter.toUpperCase(), signup.lift, signup.persons, '1']
                                    })
                                    .success(function (data) {
                                        if (data.success) {
                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                type: 'get', table: 'ADDRESS', field: ['id_ad'],
                                                where: ['home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants'],
                                                wherecond: [signup.type, signup.street.toUpperCase(), signup.cp.toUpperCase(), signup.number,
                                                    signup.floor, signup.letter.toUpperCase(), signup.lift, signup.persons]
                                            })
                                            .success(function (data) {
                                                if (data.success) {
                                                    id_ad = data.dataDB[0].id_ad;
                                                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                        type: 'get', table: 'USERS',
                                                        field: ['id_us'], where: ['user'], wherecond: [signup.user]
                                                    })
                                                    .success(function (data) {
                                                        if (data.success) {
                                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                                                {
                                                                    type: 'upd', table: 'USERS', field: ['main_ad'], value: [id_ad], where: ['id_us'],
                                                                    wherecond: [data.dataDB[0].id_us]
                                                                })
                                                            .success(function (data) {
                                                                if (data.success) {
                                                                    console.log("Register. Added main address to user");
                                                                }
                                                                else {
                                                                    console.log("Register. Invalid request adding main address to user");
                                                                }
                                                            })
                                                            .error(function (data) {
                                                                $ionicPopup.alert({
                                                                    title: 'Error',
                                                                    template: 'Conexi&oacute;n err&oacute;nea'
                                                                });
                                                            });
                                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                                type: 'new', table: 'LINK_USER_ADDRESS', field: ['id_us', 'id_ad'],
                                                                value: [data.dataDB[0].id_us, id_ad]
                                                            })
                                                            .success(function (data) {
                                                                if (data.success) {
                                                                    $ionicPopup.alert({
                                                                        title: 'Registro correcto',
                                                                        template: 'Se ha registrado en eGas satisfactoriamente. Gracias!'
                                                                    });
                                                                    $state.go('login');
                                                                }
                                                                else {
                                                                    $ionicPopup.alert({
                                                                        title: 'Registro de direcci&oacute;n incorrecto',
                                                                        template: 'Error guardando datos de direcci&oacute;n. Puede acceder con su usuario'
                                                                    });
                                                                }
                                                            })
                                                            .error(function (data) {
                                                                $ionicPopup.alert({
                                                                    title: 'Error',
                                                                    template: 'Conexi&oacute;n err&oacute;nea'
                                                                });
                                                            });
                                                        }
                                                        else {
                                                            $ionicPopup.alert({
                                                                title: 'Registro de direcci&oacute;n incorrecto',
                                                                template: 'Error guardando datos de direcci&oacute;n. Puede acceder con su usuario'
                                                            });
                                                        }
                                                    })
                                                    .error(function (data) {
                                                        $ionicPopup.alert({
                                                            title: 'Error',
                                                            template: 'Conexi&oacute;n err&oacute;nea'
                                                        });
                                                    });
                                                }
                                                else {
                                                    $ionicPopup.alert({
                                                        title: 'Registro de direcci&oacute;n incorrecto',
                                                        template: 'Error guardando datos de direcci&oacute;n. Puede acceder con su usuario'
                                                    });
                                                }
                                            })
                                            .error(function (data) {
                                                $ionicPopup.alert({
                                                    title: 'Error',
                                                    template: 'Conexi&oacute;n err&oacute;nea'
                                                });
                                            });
                                        }
                                        else {
                                            $ionicPopup.alert({
                                                title: 'Registro de direcci&oacute;n incorrecto',
                                                template: 'Error guardando datos de direcci&oacute;n. Puede acceder con su usuario'
                                            });
                                        }
                                    })
                                    .error(function (data) {
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: 'Conexi&oacute;n err&oacute;nea'
                                        });
                                    });
                                }
                                selectedAddress = -1;
                            })
                            .error(function (data) {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Conexi&oacute;n err&oacute;nea'
                                });
                            });*/
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Registro correcto',
                                template: 'Se ha registrado en eGas satisfactoriamente. Gracias!'
                             });
                             $state.go('login');
                        }
                        else
                        {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Registro incorrecto',
                                template: 'Error guardando datos de usuario'
                            });
                        }
                    })
                    .error(function (data) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea'
                        });
                    });
                }
            })
            .error(function (data) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                });
            });
            
        }
    }

})
   
.controller('menuPrincipalCtrl', function ($scope, Swap) {

    $scope.initUser = function () {
        $scope.welcome = "Bienvenido " + Swap.user.username;
    }

})

.controller('miConsumoCtrl', function ($scope, $ionicPopup, $ionicLoading, $state, $timeout, Swap) {
    
    $scope.value = 50;

    $scope.consChart = {
        "theme": "light",
        "type": "gauge",
        "arrows": [
          {
              "alpha": 1,
              "color": "#000000",
              "innerRadius": "20%",
              "nailRadius": 10,
              "radius": "100%",
              "value": $scope.value
          }
        ],
        "axes": [
          {
              "bottomText": $scope.value+" %",
              "bottomTextFontSize": 20,
              "endValue": 100,
              "valueInterval": 10,
              "unit": "%",
              "bands": [
                {
                    "color": "#ea3838",
                    "endValue": 25,
                    "startValue": 0,
                    "innerRadius": "85%"
                },
                {
                    "color": "#ffac29",
                    "endValue": 65,
                    "startValue": 25,
                    "innerRadius": "85%"
                },
                {
                    "color": "#00CC00",
                    "endValue": 100,
                    "startValue": 65,
                    "innerRadius": "85%"
                }
              ]
          }
        ]
    };

})


.controller('misPedidosCtrl', function ($scope, $ionicPopup, $ionicLoading, $state, $timeout, Swap, AsyncSwap) {
    $scope.userOrders_mainAd = [];
    $scope.userOrders_otherAd = [];
    $scope.main_ad = Swap.user.main_ad;

    $scope.getUserOrders = function () {
        $scope.userOrders_mainAd.length = 0;
        $scope.userOrders_otherAd.length = 0;
        for (i = 0; i < $scope.userOrders.length; ++i) {
            if ($scope.userOrders[i].id_ad == Swap.user.main_ad) {
                $scope.userOrders_mainAd.push($scope.userOrders[i]);
            }
            else {
                $scope.userOrders_otherAd.push($scope.userOrders[i]);
            }
        }
    }

    if (Swap.userOrders.length <= 0) {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        Swap.getUserOrders();

        $timeout(function () {
            $ionicLoading.hide();
            $scope.userOrders = Swap.userOrders;
            $scope.getUserOrders();
        }, 3000);
    }
    else {
        $scope.userOrders = Swap.userOrders;
        $scope.getUserOrders();
    }

    $scope.orders_otherAd = function () {
        $scope.userAddresses = Swap.userAddresses;
        $scope.otherAdPopup = $ionicPopup.show({
            title: 'Seleccione direcci&oacute;n',
            template: '<ion-list><ion-item ng-if="userAddresses.length <= 0">No tiene otras direcciones en nuestra app</ion-item><ion-item ng-repeat="address in userAddresses" item="item" ng-click="orders_otherAdShowOr(address.id_ad)" ng-if="address.id_ad != userOrders_mainAd[0].id_ad">{{address.street}}, {{address.num}} <span ng-if="address.floor > 0">{{address.floor}}&deg; {{address.flat}}. </span></ion-item></ion-list>',
            scope: $scope,
            buttons: [{
                text: 'Cancelar',
                type: 'button-outline button-positive'
            }]
        });
    }

    $scope.orders_otherAdShowOr = function (id_ad) {
        $scope.otherAdPopup.close();
        $scope.myId_ad = id_ad;
        $scope.otherAdOrPopup = $ionicPopup.show({
            title: 'Seleccione pedido',
            template: '<ion-list><ion-item ng-if="userOrders_otherAd.length <= 0">No tiene ning&uacute;n pedido en esta direcci&oacute;n</ion-item><ion-item ng-repeat="order in userOrders_otherAd" item="item" ng-click="goToOrder(order)" ng-if="order.id_ad == myId_ad && (order.state == 0 || order.state == 2)">{{order.quantity}} bombona(s) a {{order.cost_u}} &euro;/unid = {{order.quantity*order.cost_u}} &euro; <br />{{order.date}}</ion-item></ion-list>',
            scope: $scope,
            buttons: [{
                text: 'Cancelar',
                type: 'button-outline button-positive'
            }]
        });
        //$timeout(function () { otherAdOrPopup.close(); }, 5000);
    }

    $scope.ordersByState = function (state) {
        $scope.state = state;
        $scope.correctOrPopup = $ionicPopup.show({
            title: 'Seleccione pedido',
            template: '<ion-list><ion-item ng-repeat="order in userOrders_mainAd" item="item" ng-click="goToOrder(order)" ng-if="order.state == state">{{order.quantity}} bombona(s) a {{order.cost_u}} &euro;/unid = {{order.quantity*order.cost_u}} &euro; <br />{{order.date}}</ion-item><ion-item ng-repeat="order in userOrders_otherAd" item="item" ng-click="goToOrder(order)" ng-if="order.id_ad == order.state == state">{{order.quantity}} bombona(s) a {{order.cost_u}} &euro;/unid = {{order.quantity*order.cost_u}} &euro; <br />{{order.date}}</ion-item></ion-list>',
            scope: $scope,
            buttons: [{
                text: 'Cancelar',
                type: 'button-outline button-positive'
            }]
        });
    }

    $scope.goToOrder = function (order) {
        if ($scope.otherAdOrPopup != undefined)
        {
            $scope.otherAdOrPopup.close();
            $scope.otherAdOrPopup = undefined;
        }

        if ($scope.correctOrPopup != undefined)
        {
            $scope.correctOrPopup.close();
            $scope.correctOrPopup = undefined;
        }

        Swap.order = order;
        Swap.previousPage = 'menuLateral.misPedidos';
        $state.go('verPedido');
    };

    $scope.doRefresh = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        Swap.getUserOrders();
        $timeout(function () {
            $ionicLoading.hide();
            $scope.userOrders = Swap.userOrders;
            $scope.getUserOrders();
        }, 5000);
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.quickOrder = function () {

        $scope.mainAd = {};
        Swap.userAddresses.length = 0;

        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        AsyncSwap.getUserAddresses(Swap.user.id_us).then(function (data) {
            Swap.userAddresses = data;
            $ionicLoading.hide();

            for (i = 0; i < Swap.userAddresses.length; ++i) {
                if (Swap.userAddresses[i].id_ad == Swap.user.main_ad) {
                    $scope.mainAd.street = Swap.userAddresses[i].street;
                    $scope.mainAd.num = Swap.userAddresses[i].num;
                    $scope.mainAd.floor = Swap.userAddresses[i].floor;
                    $scope.mainAd.flat = Swap.userAddresses[i].flat;
                    $scope.mainAd.cp = Swap.userAddresses[i].cp;
                }
            }

            $ionicPopup.show({
                title: 'Pedido r&aacute;pido',
                subTitle: 'Indique si es correcto:',
                scope: $scope,
                template: '1 bombona a {{mainAd.street}}, {{mainAd.num}} <span ng-if="mainAd.floor > 0">{{mainAd.floor}}&deg; {{mainAd.flat}} </span><br>CP: {{mainAd.cp}}',
                buttons: [
                {
                    text: 'Cancelar'
                },
                {
                    text: 'Aceptar',
                    type: 'button-positive',
                    onTap: function (e) {
                    }
                }]
            });
        })
    }
})
   
.controller('nuevoPedidoCtrl', function ($scope, $ionicPopup, $state, $http, $ionicLoading, Swap) {

    if (Swap.user.main_ad < 0)
    {
        $scope.correctOrPopup = $ionicPopup.show({
            title: 'Indique direcci&oacute;n principal',
            template: 'No tiene ninguna direcci&oacute;n en el sistema o no ha indicado la principal. <br>Por favor vaya a Mi Cuenta antes de realizar un pedido.',
            scope: $scope,
            buttons: [{
                text: 'Cancelar',
                onTap: function (e) {
                    $state.go('menuLateral.misPedidos');
                }
            },
            {
                text: 'Mi Cuenta',
                type: 'button-positive',
                onTap: function (e) {
                    $state.go('menuLateral.miCuenta');
                }
            }]
        });
    }
    else if (Swap.userAddresses.length <= 0)
    {
        Swap.getUserAddresses();
    }
    $scope.userAddresses = Swap.userAddresses;
    $scope.main_ad = Swap.user.main_ad;
    $scope.selectedAd = $scope.main_ad;
    $scope.selectedDi = -1;
    $scope.kindBo_sel = "";
    $scope.costBo_sel = "";
    $scope.count = 0;

    $scope.newOrder = function (order) {

        if (!order)
        {
            $ionicPopup.alert({
                title: 'Error',
                template: 'No ha introducido alguno de los datos'
            });
        }
        else if (!order.numBottle || order.numBottle <= 0) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca n&uacute;mero de bombonas deseadas'
            });
        }
        else if(order.deliver_time[0] != 'M' && order.deliver_time[0] != 'T')
        {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca el horario en que desea recibir su bombona'
            });
        }
        else if ($scope.kindBo_sel == -1 || $scope.costBo_sel == -1) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Arrastre para indicar su direcci&ocute;n y distribuidora'
            });
        }
        else 
        {
            kindBo = $scope.kindBo_sel;
            costBo = $scope.costBo_sel;
            selDi = $scope.selectedDi;
            selAd = $scope.selectedAd;

            if (order.deliver_time[0] == 'M')
            {
                order.deliver_time = "m";
            }
            else
            {
                order.deliver_time = "t";
            }
            $http.post("http://www.e-gas.es/phpApp/middleDB.php", { type: 'get', table: 'ORDERS ORDER BY id_or DESC LIMIT 1', field: ['id_or'] })
            .success(function (data) {
                if (data.success) {
                    newOr_id = parseInt(data.dataDB[0].id_or,10) + 1;
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", { type: 'new', 
                        table: 'ORDERS', field: ['id_or', 'quantity', 'kind', 'cost_u', 'deliver_time', 'state'],
                        value: [newOr_id, order.numBottle, kindBo, costBo, order.deliver_time, '0']
                    })
                    .success(function (data2) {
                        if (data2.success)
                        {
                            console.log("selAd: "+selAd+" newOr_id: "+newOr_id);
                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", { type: 'new', table: 'LINK_ADDRESS_ORDER',
                                field: ['id_ad','id_or'], value: [selAd, newOr_id] })
                            .success(function (data3) {
                                if (data3.success) {
                                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                        type: 'new', table: 'LINK_ORDER_DISTRIBUTOR',
                                        field: ['id_or', 'id_di'], value: [newOr_id, selDi]
                                    })
                                    .success(function (data4) {
                                        if (data4.success) {
                                            $ionicPopup.alert({
                                                title: 'Pedido correcto',
                                                template: 'En breve recibir&aacute; su pedido. <br> Gracias por confiar en eGas!'
                                            });
                                            var d = new Date();
                                            Swap.userOrders.push({
                                                id_or: newOr_id, quantity: order.numBottle, kind: kindBo,
                                                cost_u: costBo, date: d.toLocaleString(), deliver_time: order.deliver_time,
                                                state: '0', id_co: 'NULL'
                                            });
                                            $scope.userOrders = Swap.userOrders;
                                            $state.go('menuLateral.misPedidos');
                                        }
                                        else {
                                            $ionicPopup.alert({
                                                title: 'Error',
                                                template: 'No fue posible ligar el pedido con la distribuidora. Por favor, vuelva a intentarlo.'
                                            });
                                        }
                                    })
                                    .error(function (data4) {
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: 'Conexi&oacute;n err&oacute;nea'
                                        });
                                    })
                                }
                                else {
                                    $ionicPopup.alert({
                                        title: 'Error',
                                        template: 'No fue posible ligar el pedido con su direcci&oacute;n. Por favor, vuelva a intentarlo'
                                    });
                                }
                            })
                            .error(function(data3){
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Conexi&oacute;n err&oacute;nea'
                                });
                            })
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Alg&uacute;n dato err&oacute;nea introducido'
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
                else
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Alg&uacute;n dato err&oacute;nea introducido'
                    });
                }
            })
            .error(function (data) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                });
            });
        }    
    };
    
    $scope.getDistrByUser = function (id_adSel) {
        var main_cp;
        var distrByUser = [];

        $scope.kindBo_sel = "";
        $scope.costBo_sel = "";
        $scope.selectedDi = -1;
        $scope.selectedAd = id_adSel;

        for(i=0;i<Swap.userAddresses.length;++i)
        {
            if(Swap.userAddresses[i].id_ad == id_adSel)
            {
                cpSel = Swap.userAddresses[i].cp;
                break;
            }
        }

        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
        { type: 'get', table: 'LINK_DISTRIBUTOR_REPARTO_CP', field: ['id_di'], where: ['cp'], wherecond: [cpSel] })
        .success(function (data) {
            if (data.success) {
                for(i=0;i<data.dataDB.length;++i)
                {
                    id_diI = data.dataDB[i].id_di;
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                    {type: 'get', table: 'DISTRIBUTOR', field: ['company', 'city', 'street', 'num', 'telephone'],
                        where: ['id_di'], wherecond: [data.dataDB[i].id_di]
                    })
                    .success(function (data2) {
                        if(data2.success)
                        {
                            for (j = 0; j < data2.dataDB.length; j++) {
                                dataDist = data2.dataDB[j];

                                $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                {type: 'get', table: 'LINK_DISTRIBUTOR_BOTTLE', field: ['id_bo', 'price'],
                                    where: ['id_di'], wherecond: [id_diI]})
                                .success(function (data3) {
                                    if (data3.success) {
                                        for(k=0; k < data3.dataDB.length; k++)
                                        {
                                            dataBot = data3.dataDB[k];
                                            
                                            $scope.end_getDist(id_diI, dataDist, dataBot, distrByUser, data3.dataDB.length);

                                        }
                                    }
                                    else {
                                        $ionicLoading.hide();
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: 'Es posible que alguna distribuidora no ha dado de alta sus bombonas en nuestra app a&uacute;n'
                                        });
                                    }
                                })
                                .error(function (data3) {
                                    $ionicLoading.hide();
                                    $ionicPopup.alert({
                                        title: 'Error',
                                        template: 'Conexi&oacute;n err&oacute;nea'
                                    });
                                })
                            }
                        }
                        else
                        {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Lo sentimos pero ninguna distribuidora reparte en su zona con nuestra app a&uacute;n'
                            });
                            distrByUser.length = 0;
                            $scope.distrByUser = distrByUser;
                        }
                    })
                    .error(function (data2) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea'
                        });
                    })
                }
            }
            else
            {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Lo sentimos pero ninguna distribuidora reparte en su zona con nuestra app a&uacute;n'
                });
                distrByUser.length = 0;
                $scope.distrByUser = distrByUser;
            }
        })
        .error(function (data) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error',
                template: 'Conexi&oacute;n err&oacute;nea'
            });
        })
    };

    $scope.end_getDist = function (id_diI, dataDist, dataBot, distrByUser, numTypesBot) {
        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
        {type: 'get', table: 'BOTTLE', field: ['weight','kind'], where: ['id_bo'], wherecond: [dataBot.id_bo]})
        .success(function(data4){
            if (data4.success) {
                distrByUser.push({
                    id_di: id_diI, company: dataDist.company, street: dataDist.street,
                    num: dataDist.num, telephone: dataDist.telephone, id_bo: dataBot.id_bo,
                    price: dataBot.price, weight: data4.dataDB[0].weight, kind: data4.dataDB[0].kind
                });
                $scope.distrByUser = distrByUser;
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Aviso',
                    template: 'Algunos datos de las bombonas pueden no ser correctos'
                });
            }
            $scope.count++;
            if ($scope.count == numTypesBot) {
                $ionicLoading.hide();
                $scope.count = 0;
            }
        })
        .error(function (data4) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error',
                template: 'Conexi&oacute;n err&oacute;nea'
            });
        })
    }

    $scope.selectDist = function (id_diSel, kindBo_sel, costBo_sel) {
        $scope.selectedDi = id_diSel;
        $scope.kindBo_sel = kindBo_sel;
        $scope.costBo_sel = costBo_sel;
        console.log("selectedDi: " + $scope.selectedDi + " kindBo_sel: " + $scope.kindBo_sel + " costBo_sel: " + $scope.costBo_sel);
    };
})
   
.controller('verPedidoCtrl', function ($scope, $state, $ionicPopup, $http, Swap) {
    $scope.order = Swap.order;

    $scope.correctOrder = function (order) {
        if(!order.deliverNumber || order.deliverNumber.length <= 0)
        {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca n&uacute;mero de repartidor para verificar pedido correctamente'
            });
        }
        else
        {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Pedido correcto',
                template: '&iquest;Est&aacute; seguro de que el pedido es correcto y lo ha recibido?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    //AQUI! Comprobar deliverNumber con el repartidor que debe entregarlo.

                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                        type: 'upd', table: 'ORDERS', field: ['state'], value: ['2'], where: ['id_or'], wherecond: [order.id_or]
                    })
                    .success(function (data) {
                        if (data.success) {
                            $scope.order.state = 2;
                            for (i < 0; i < Swap.userOrders.length; ++i) {
                                if (Swap.userOrders[i].id_or == $scope.order.id_or) {
                                    Swap.userOrders[i].state = 2;
                                    break;
                                }
                            }
                            $ionicPopup.alert({
                                title: 'Se ha confirmado la recepci&ocute;n del pedido'
                            });
                        }
                        else {
                            $ionicPopup.alert({
                                title: 'Pedido NO confirmado',
                                template: 'El pedido no ha podido ser confirmado como recibido. Por favor vuelva a intentarlo de nuevo'
                            });
                        }
                    })
                    .error(function (data) {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea. El pedido no pudo ser confirmado'
                        });
                    })
                    $state.go('menuLateral.menuPrincipal');
                }
            });
        }
    }

    $scope.incorrectOrder = function (order) {
        Swap.order = $scope.order;
        Swap.previousPage = 'verPedido';
        $state.go('reclamacion');
    }

    $scope.cancelOrder = function (order) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Cancelar pedido',
            template: '&iquest;Est&aacute; seguro de que desea cancelar el pedido?'
        });

        confirmPopup.then(function (res) {
            if (res) {
                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                    type: 'upd', table: 'ORDERS', field: ['state'], value: ['-1'], where: ['id_or'], wherecond: [order.id_or]
                })
                .success(function (data) {
                    if (data.success) {
                        $scope.order.state = -1;
                        for(i = 0; i < Swap.userOrders.length; ++i)
                        {
                            if(Swap.userOrders[i].id_or == $scope.order.id_or)
                            {
                                Swap.userOrders[i].state = -1;
                                break;
                            }
                        }
                        $ionicPopup.alert({
                            title: 'Pedido cancelado correctamente'
                        });
                    }
                    else{
                        $ionicPopup.alert({
                            title: 'Pedido NO cancelado',
                            template: 'El pedido no ha podido ser cancelado. Por favor vuelva a intentarlo de nuevo'
                        });
                    }
                })
                .error(function(data){
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Conexi&oacute;n err&oacute;nea. El pedido no pudo ser cancelado'
                    });
                })
                $state.go('menuLateral.misPedidos');
            }
        });
    }

    $scope.goBack = function () {
        if (Swap.previousPage && Swap.previousPage != '')
        {
            $state.go(Swap.previousPage);
            Swap.previousPage = '';
        }
        else
        {
            $ionicGoBack();
        }
        
    }

})
   
.controller('reclamacionCtrl', function ($scope, $ionicPopup, $ionicLoading, $timeout, $state, $http, Swap) {
    $scope.order = Swap.order;
    $scope.order_ad = {};

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
        type: 'get', table: 'ADDRESS', field: ['street','cp','num','floor','flat'], where: ['id_ad'], wherecond: [$scope.order.id_ad]
    })
    .success(function (data) {
        if (data.success) {
            $scope.order_ad = data.dataDB[0];
        }
        else {
            //¿Poner algo si no sale direccion?? Siempre debe haberla en este punto.
        }
    })
    .error(function (data) {
        $ionicPopup.alert({
            title: 'Error',
            template: 'Conexi&oacute;n err&oacute;nea'
        });
    })
    $timeout(function () {
        $ionicLoading.hide();
    }, 1000);

    $scope.sendClaim = function (subject) {
        if (!subject || subject.length <= 0)
        {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca motivo de reclamaci&oacute;n'
            });
        }
        else
        {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Enviar reclamaci&oacute;n',
                template: '&iquest;Est&aacute; seguro de que desea enviar esta reclamaci&oacute;n?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {type: 'get', table: 'COMPLAINTS ORDER BY id_co DESC LIMIT 1', field: ['id_co'] })
                    .success(function (data) {
                        if (data.success) {
                            newCo_id = parseInt(data.dataDB[0].id_co, 10) + 1;
                            console.log("Valor: "+newCo_id)
                        }
                        else
                        {
                            newCo_id = 1;
                        }
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                            type: 'new', table: 'COMPLAINTS', field: ['id_co','user_coment'], value: [newCo_id, subject]
                        })
                        .success(function (data) {
                            if (data.success) {
                                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                    type: 'upd', table: 'ORDERS', field: ['state','id_co'], value: ['-2', newCo_id], where: ['id_or'], wherecond: [$scope.order.id_or]
                                })
                                .success(function (data) { 
                                    if (data.success) {
                                        for (i = 0; i < Swap.userOrders.length; ++i) {
                                            if (Swap.userOrders[i].id_or == $scope.order.id_or) {
                                                Swap.userOrders[i].state = -2;
                                                Swap.userOrders[i].id_co = newCo_id;
                                                break;
                                            }
                                        }
                                        var alertPopup = $ionicPopup.alert({
                                            title: 'Reclamaci&oacute;n enviada a distribuidora',
                                            template: 'En breve enviaremos respuesta. <br> Gracias por confiar en eGas!'
                                        });
                                        alertPopup.then(function (res) {
                                            $state.go('menuLateral.menuPrincipal');
                                        })
                                    }
                                    else{
                                        $ionicPopup.alert({
                                            title: 'Error en reclamaci&oacute;n',
                                            template: 'Por favor vuelva a intentarlo'
                                        });
                                    }
                                })
                                .error(function (data) {
                                    $ionicPopup.alert({
                                        title: 'Error',
                                        template: 'Conexi&oacute;n err&oacute;nea'
                                    });
                                })
                            }
                            else{
                                $ionicPopup.alert({
                                    title: 'Error en reclamaci&oacute;n',
                                    template: 'Por favor vuelva a intentarlo'
                                });
                            }
                        })
                        .error(function (data) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                        })
                    })
                    .error(function (data) {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea'
                        });
                    })
                }
            })
        }
    }
})
   
.controller('misReclamacionesCtrl', function ($scope, $ionicPopup, $ionicLoading, $timeout, $state, Swap) {

    $scope.userOrders = [];
    $scope.complaintOrders = [];
    $scope.noComplaintOrders = [];
    $scope.currentOrdersPopup = '';

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    Swap.getUserOrders();
    $scope.userOrders = Swap.userOrders;
    $timeout(function () {
        $ionicLoading.hide();
        $scope.userOrders = Swap.userOrders;
        $scope.getComplaints();
    }, 2000);

    $scope.getComplaints = function () {
        $scope.complaintOrders.length = 0;
        $scope.noComplaintOrders.length = 0;

        for (i = 0; i < $scope.userOrders.length; ++i) {
            if ($scope.userOrders[i].state == -2 || $scope.userOrders[i].state == '-2') {
                $scope.complaintOrders.push($scope.userOrders[i]);
            }
            else if ($scope.userOrders[i].state == 0 || $scope.userOrders[i].state == '0') {
                $scope.noComplaintOrders.push($scope.userOrders[i]);
            }
        }
    }

    $scope.showCurrentOrders = function () {
        currentOrdersPopup = $ionicPopup.show({
            title: 'Seleccione el pedido activo que desea reclamar',
            scope: $scope,
            template: '<ion-list><ion-item ng-repeat="order in noComplaintOrders" item="item" ng-click="goToOrder(order)" ng-model="order">{{order.quantity}} bombona(s) a {{order.cost_u}} &euro;/unid = {{order.quantity*order.cost_u}} &euro; <br />{{order.date}}</ion-item></ion-list>',
            buttons: [
            {
                text: 'Cancelar'
            },
            {
                text: '<i class="icon ion-refresh"></i>',
                type: 'button-positive',
                onTap: function (e) {
                    Swap.getUserOrders();
                    for (i = 0; i < $scope.userOrders.length; ++i) {
                        if ($scope.userOrders[i].state == -2 || $scope.userOrders[i].state == '-2') {
                            $scope.complaintOrders.push($scope.userOrders[i]);
                        }
                        else if ($scope.userOrders[i].state == 0 || $scope.userOrders[i].state == '0') {
                            $scope.noComplaintOrders.push($scope.userOrders[i]);
                        }
                    }
                }
            }]
        });
    }

    $scope.goToOrder = function (order) {
        Swap.order = order;
        Swap.previousPage = 'menuLateral.misReclamaciones';
        $state.go('verPedido');
        currentOrdersPopup.close();
    };

})
   
.controller('miCuentaCtrl', function ($scope, $ionicPopup, $state, $http, $ionicLoading, $injector, $compile, Swap, AsyncSwap) {

    $scope.userAddresses = [];
    $scope.main_userad = Swap.user.main_ad;

    $scope.modifyAccount = function (account) {
        var fields = [];
        var values = [];
        var newUsername = 0, count = 0;
        var alertTitle = "";
        
        if (!account) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Por favor, introduzca alg&uacute;n valor a modificar'
            });
        }
        else {
            if (account.email) {
                count++;
                alertTitle += "Email: " + account.email + "<br>";
                fields.push('email');
                values.push(account.email);
            }
            if (account.age) {
                count++;
                alertTitle += "Edad: " + account.age + "<br>";
                fields.push('age');
                values.push(account.age);
            }

            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            if (account.user) {
                if (account.user != Swap.user.username) {
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                        type: 'get', table: 'USERS', field: ['id_us'], where: ['user'],
                        wherecond: [account.user]
                    })
                    .success(function (data) {
                        if (data.success) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Nuevo nombre de usuario introducido ya existente. Por favor, elija otro'
                            });
                        }
                        else {
                            newUsername = 1;
                            alertTitle += "Nombre de usuario: " + account.user + "<br>";
                            fields.push('user');
                            values.push(account.user);
                        }
                        $ionicLoading.hide();
                        $scope.changeValues(account, count, newUsername, fields, values, alertTitle);
                    })
                    .error(function (data) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea'
                        });
                    });
                }
                else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Ha introducido su mismo nombre de usuario como nuevo. Recuerde que no es obligatorio introducir ning&uacute;n campo'
                    });
                }
            }
            else {
                $ionicLoading.hide();
                $scope.changeValues(account, count, newUsername, fields, values, alertTitle);
            }
        }
        
    };

    //This function is called once the username is checked on the DB or if there is no change on username, when other account value is changed
    $scope.changeValues = function (account, count, newUsername, fields, values, alertTitle) {
        if ((count > 0 && !account.user) || (count > 0 && newUsername == 1) || newUsername == 1) {
            $scope.check = {};
            var checkPassPopup = $ionicPopup.show({
                title: 'Confirmaci&oacute;n de usuario',
                template: 'Introduzca su contrase&ntilde;a <input type="password" ng-model="check.pass">',
                scope: $scope,
                buttons: [{
                    text: 'Cancelar'
                }, {
                    text: 'Guardar',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.check.pass) {
                            //don't allow the user to close unless he enters password
                            e.preventDefault();
                        } else {
                            return $scope.check;
                        }
                    }
                }]
            });

            checkPassPopup.then(function (check) {
                if (check) {
                    if (check.pass == Swap.user.pass) {
                        $ionicLoading.show({
                            content: 'Loading',
                            animation: 'fade-in',
                            showBackdrop: true,
                            maxWidth: 200,
                            showDelay: 0
                        });
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                        { type: 'upd', table: 'USERS', field: fields, value: values, where: ['id_us'], wherecond: [Swap.user.id_us] })
                        .success(function (data) {
                            $ionicLoading.hide();
                            if (data.success) {
                                $ionicPopup.alert({
                                    title: "Modificaci&oacute;n correcta",
                                    template: alertTitle
                                });
                                if (account.user) {
                                    Swap.user.username = account.user;
                                }
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Invalid request'
                                });
                            }
                        })
                        .error(function (data) {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                        });
                        $state.go('menuLateral.menuPrincipal');
                    }
                    else {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Contras&ntilde;a incorrecta'
                        });
                        $state.go('menuLateral.miCuenta');
                    }
                }
            });
        }
    };

    $scope.showNewPass = function () {
        $scope.data = {};

        var newPassPopup = $ionicPopup.show({
            title: 'Cambio de contrase&ntilde;a',
            template: 'Introduzca contrase&ntilde;a anterior <input type="password" ng-model="data.oldPassword">   <br> Introduzca nueva contrase&ntilde;a  <input type="password" ng-model="data.newPassword"> <br> Confirme nueva contrase&ntilde;a  <input type="password" ng-model="data.confirmPassword">',
            scope: $scope,
            buttons: [{
                text: 'Cancelar'
            }, {
                text: 'Guardar',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.data.oldPassword) {
                        //don't allow the user to close unless he enters old password
                        e.preventDefault();
                    } else {
                        return $scope.data;
                    }
                }
            }]
        });

        newPassPopup.then(function (res) {
            if (res) {
                if (res.newPassword == res.confirmPassword) {
                    if (res.oldPassword == Swap.user.pass)
                    {
                        $ionicLoading.show({
                            content: 'Loading',
                            animation: 'fade-in',
                            showBackdrop: true,
                            maxWidth: 200,
                            showDelay: 0
                        });

                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                        { type: 'upd', table: 'USERS', field: ['pass'], value: [res.newPassword], where: ['id_us'], wherecond: [Swap.user.id_us] })
                        .success(function (data) {
                            $ionicLoading.hide();
                            if (data.success) {
                                Swap.user.pass = res.newPassword;
                                $ionicPopup.alert({
                                    title: 'Contrase&ntilde;a modificada correctamente'
                                });
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Invalid Request'
                                });
                            }
                        })
                        .error(function (data) {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                        });
                    }
                    else
                    {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Contrase&ntilde;a anterior incorrecta'
                        });
                    }
                } else
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'No coincide la nueva contrase&ntilde;a con su confirmac&oacute;n'
                    });
                }
            }
            else {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Conexi&oacute;n err&oacute;nea'
                });
            }
        });

    };

    $scope.getUserAddresses = function () {
        $scope.userAddresses.length = 0;
        Swap.userAddresses.length = 0;
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        AsyncSwap.getUserAddresses(Swap.user.id_us).then(function (data) {
            Swap.userAddresses = data;
            $scope.userAddresses = data;
            $ionicLoading.hide();
        })
    };

    $scope.newAddress = function () {
        $scope.newAdd = {};

        var newAddressPopup = $ionicPopup.show({
            title: 'Nueva direcci&oacute;n',
            template: 'Calle* <input type="text" ng-model="newAdd.street">' +
                '<span style="float:left;width:32%;">Num*  <input type="number" ng-model="newAdd.number"></span><span style="margin-left:1%;float:left;width:32%;">Planta <input type="number" ng-model="newAdd.floor"></span><span style="margin-left:1%;float:left;width:32%;">Letra <input type="text" ng-model="newAdd.letter"></span>' +
                '<span style="float:left;width:49%;">CP* <input type="text" ng-model="newAdd.cp" ng-required="true"></span><span style="margin-left:2%float:left;width:49%;">Tipo* <select ng-model="newAdd.type" style="width:50%"><option>Vivienda</option><option>Local comercial</option></select></span>' +
                '<ion-checkbox ng-show="newAdd.floor > 0" ng-model="newAdd.lift" style="clear:both;">Ascensor</ion-checkbox> <span ng-show="newAdd.type == \'Vivienda\'" > N&ordm; inquilinos* <input type="number" ng-model="newAdd.persons"></span>' +
                '<span style="float:left;">Bombona* <select ng-model="newAdd.bottleType"><option>Tipo 1</option><option>Tipo 2</option></select></span>',
            scope: $scope,
            buttons: [{
                text: '<i class="icon ion-arrow-left-c"></i>'
            }, {
                text: '<i class="icon ion-checkmark-round"></i>',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.newAdd.street || !$scope.newAdd.number || !$scope.newAdd.cp || !$scope.newAdd.type
                      || ($scope.newAdd.type == 'Vivienda' && !$scope.newAdd.persons) || !$scope.newAdd.bottleType) {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Es obligatorio introducir todos los campos marcados con *'
                        });
                        e.preventDefault();
                    } else {
                        if ($scope.newAdd.type == 'Vivienda')
                        {
                            $scope.newAdd.type = 'h';
                        }
                        else
                        {
                            $scope.newAdd.type = 'c';
                        }

                        if (!$scope.newAdd.letter) $scope.newAdd.letter = null;
                        if (!$scope.newAdd.floor) $scope.newAdd.floor = null;
                        if (!$scope.newAdd.persons) $scope.newAdd.persons = null;
                        if (!$scope.newAdd.lift) $scope.newAdd.lift = null;

                        return $scope.newAdd;
                    }
                }
            }]
        });

        newAddressPopup.then(function (res) {
            if (res) {
                if (res.lift) res.lift = 1;
                else res.lift = 0;

                $ionicLoading.show({
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                })

                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                    type: 'get', table: 'ADDRESS', field: ['id_ad'],
                    where: ['home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                    wherecond: [res.type, res.street.toUpperCase(), res.cp.toUpperCase(), res.number, res.floor,
                        res.letter, res.lift, res.persons, '1']
                })
                .success(function (data) {
                    if (data.success) { //Existe la dirección en la BD
                        linkAddress = data.dataDB[0].id_ad;
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                            type: 'new', table: 'LINK_USER_ADDRESS', field: ['id_us', 'id_ad'],
                            value: [Swap.user.id_us, linkAddress]
                        })
                        .success(function (data2) {
                            if (data2.success) {
                                if (res.type == 'h') res.type = "Vivienda";
                                else res.type = "Local comercial";
                                Swap.userAddresses.push({
                                    id_ad: linkAddress, h_c: res.type, street: res.street.toUpperCase(),
                                    cp: res.cp.toUpperCase(), num: res.number, floor: res.floor, flat: res.letter,
                                    lift: res.lift, tenants: res.persons, id_bo: "Tipo 1"
                                });
                                $scope.userAddresses = Swap.userAddresses;
                                $ionicLoading.hide();
                                $state.go($state.current, {}, { reload: true });
                            }
                            else {
                                $ionicLoading.hide();
                                $ionicPopup.alert({
                                    title: 'Invalid request'
                                });
                            }
                        })
                        .error(function (data2) {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                        })
                    }
                    else { //Nueva dirección
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                            type: 'new', table: 'ADDRESS',
                            field: ['home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                            value: [res.type, res.street.toUpperCase(), res.cp.toUpperCase(), res.number, res.floor,
                                res.letter, res.lift, res.persons, '1']
                        })
                        .success(function (data2) {
                            if (data2.success) {
                                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                    type: 'get', table: 'ADDRESS', field: ['id_ad'],
                                    where: ['home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                                    wherecond: [res.type, res.street.toUpperCase(), res.cp.toUpperCase(), res.number, res.floor,
                                        res.letter, res.lift, res.persons, '1']
                                })
                                .success(function (data3) {
                                    if (data3.success) {
                                        linkAddress = data3.dataDB[0].id_ad;
                                        $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                            type: 'new', table: 'LINK_USER_ADDRESS', field: ['id_us', 'id_ad'],
                                            value: [Swap.user.id_us, linkAddress]
                                        })
                                        .success(function (data4) {
                                            if (data3.success) {
                                                if (res.type == 'h') res.type = "Vivienda";
                                                else res.type = "Local comercial";
                                                Swap.userAddresses.push({
                                                    id_ad: linkAddress, h_c: res.type, street: res.street.toUpperCase(),
                                                    cp: res.cp.toUpperCase(), num: res.number, floor: res.floor, flat: res.letter,
                                                    lift: res.lift, tenants: res.persons, id_bo: "Tipo 1"
                                                });
                                                $scope.userAddresses = Swap.userAddresses;
                                                $ionicLoading.hide();
                                                $state.go($state.current, {}, { reload: true });
                                            }
                                            else {
                                                $ionicPopup.alert({
                                                    title: 'Invalid request'
                                                });
                                            }
                                        })
                                        .error(function (data4) {
                                            $ionicPopup.alert({
                                                title: 'Error',
                                                template: 'Conexi&oacute;n err&oacute;nea'
                                            });
                                        })
                                    }
                                    else {
                                        $ionicPopup.alert({
                                            title: 'Invalid request'
                                        });
                                    }
                                })
                                .error(function (data3) {
                                    $ionicPopup.alert({
                                        title: 'Error',
                                        template: 'Conexi&oacute;n err&oacute;nea'
                                    });
                                })
                            }
                        })
                        .error(function (data2) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Conexi&oacute;n err&oacute;nea'
                            });
                        })
                    }
                })
                .error(function (data) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Conexi&oacute;n err&oacute;nea'
                    });
                })
            }
            else {
                console.log('Caso de no poder modificar BD o antigua contraseña incorrecta');
            }
        });
    };

    $scope.setMainAd = function (id_ad) {
        $scope.editAddressPopup.close();
        
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        })
        $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
            type: 'upd', table: 'USERS', field: ['main_ad'], value: [id_ad], where: ['id_us'],
            wherecond: [Swap.user.id_us]
        })
        .success(function (data) {
            if (data.success) {
                $ionicLoading.hide();
                Swap.user.main_ad = id_ad;
                $scope.main_userad = id_ad;
                $state.go($state.current, null, { reload: true });
            }
            else {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Invalid Request'
                });
                $ionicLoading.hide();
            }
        })
        .error(function (data) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Conexi&oacute;n err&oacute;nea'
            });
            $ionicLoading.hide();
        })
    };

    $scope.editAddress = function (address) {
        address.num = parseInt(address.num);
        address.floor = parseInt(address.floor);
        address.tenants = parseInt(address.tenants);
        address.lift = parseInt(address.lift);
        if (address.lift) $scope.aux_lift = true;
        else $scope.aux_lift = false;
        $scope.edittedAdd = address;
        
        $scope.editAddressPopup = $ionicPopup.show({
            title: 'Nueva direcci&oacute;n',
            template: 'Calle* <input type="text" ng-model="edittedAdd.street">' +
                '<span style="float:left;width:32%;">Num*  <input type="number" ng-model="edittedAdd.num"></span><span style="margin-left:1%;float:left;width:32%;">Planta <input type="number" ng-model="edittedAdd.floor"></span><span style="margin-left:1%;float:left;width:32%;">Letra <input type="text" ng-model="edittedAdd.flat"></span>' +
                '<span style="float:left;width:49%;">CP* <input type="text" ng-model="edittedAdd.cp" ng-required="true"></span><span style="margin-left:2%float:left;width:49%;">Tipo* <select ng-model="edittedAdd.h_c" style="width:50%"><option>Vivienda</option><option>Local comercial</option></select></span>' +
                '<ion-checkbox ng-show="edittedAdd.floor > 0" ng-model="edittedAdd.lift" ng-checked="aux_lift" style="clear:both;">Ascensor</ion-checkbox> <span ng-show="edittedAdd.h_c == \'Vivienda\'" > N&ordm; inquilinos* <input type="number" ng-model="edittedAdd.tenants"></span>' +
                '<span style="float:left;">Bombona* <select ng-model="edittedAdd.id_bo"><option>Tipo 1</option><option>Tipo 2</option></select></span>'+
                '<a class="button button-balanced button-clear button-block" ng-show="edittedAdd.id_ad != main_userad" ng-click="setMainAd(edittedAdd.id_ad)">&iquest;Direcci&oacute;n principal?</a>',
            scope: $scope,
            buttons: [{
                text: 'Atr&aacute;s'
            }, {
                text: '<i class="icon ion-checkmark-round"></i>',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.edittedAdd.street || !$scope.edittedAdd.num || !$scope.edittedAdd.cp || !$scope.edittedAdd.h_c
                      || ($scope.edittedAdd.h_c == 'Vivienda' && !$scope.edittedAdd.tenants) || !$scope.edittedAdd.id_bo) { 
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Es obligatorio introducir todos los campos marcados con *'
                        });
                        e.preventDefault();
                    } else {
                        if ($scope.edittedAdd.h_c == 'Vivienda') {
                            $scope.edittedAdd.h_c = 'h';
                        }
                        else {
                            $scope.edittedAdd.h_c = 'c';
                        }

                        if (!$scope.edittedAdd.flat) $scope.edittedAdd.flat = null;
                        if (!$scope.edittedAdd.floor) $scope.edittedAdd.floor = null;
                        if (!$scope.edittedAdd.tenants) $scope.edittedAdd.tenants = null;
                        if (!$scope.edittedAdd.lift) $scope.edittedAdd.lift = null;

                        return $scope.edittedAdd;
                    }
                }
            }, {
                text: '<i class="icon ion-close-round"></i>',
                type: 'button-assertive',
                onTap: function (e) {
                    $ionicLoading.show({
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    })

                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                        type: 'del', table: 'LINK_USER_ADDRESS', where: ['id_us', 'id_ad'],
                        wherecond: [Swap.user.id_us, $scope.edittedAdd.id_ad]
                    })
                    .success(function (data) {
                        if(data.success)
                        {
                            for(i=0;i<Swap.userAddresses.length;++i){
                                if(Swap.userAddresses[i].id_ad == $scope.edittedAdd.id_ad){
                                    Swap.userAddresses.splice(i,1);
                                    break;
                                }
                            }
                            $scope.userAddresses = Swap.userAddresses;
                            $ionicLoading.hide();
                            $state.go($state.current, {}, { reload: true });
                        }
                        else
                        {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Invalid Request'
                            }); 
                        }
                    })
                    .error(function (data) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea'
                        });
                    })
                }
            }]
        });

        $scope.editAddressPopup.then(function (res) { // Only on edit
            if (res) {
                if (res.lift) res.lift = 1;
                else res.lift = 0;

                $ionicLoading.show({
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                })

                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                    type: 'upd', table: 'ADDRESS', field: ['home_commerce', 'street', 'cp', 'num', 'floor',
                        'flat', 'lift', 'tenants', 'id_bo'], value: [res.h_c, res.street.toUpperCase(), res.cp.toUpperCase(),
                        res.num, res.floor, res.flat, res.lift, res.tenants, '1'], where: ['id_ad'], wherecond: [res.id_ad]
                })
                .success(function (data) {
                    if (data.success) { 
                        if (res.h_c == 'h') res.h_c = "Vivienda";
                        else res.h_c = "Local comercial";

                        for(i=0;i<Swap.userAddresses.length;++i){
                            if(Swap.userAddresses[i].id_ad == res.id_ad){
                                Swap.userAddresses[i] = res;
                                break;
                            }
                        }
                        $scope.userAddresses = Swap.userAddresses;
                        $ionicLoading.hide();
                        $state.go($state.current, {}, { reload: true });
                    }
                    else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Invalid Request'
                        });
                    }
                })
                .error(function (data) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Conexi&oacute;n err&oacute;nea'
                    });
                })
            }
        });
    }
})
   
.controller('menuPrincipal2Ctrl', function ($scope, $ionicPopup, $ionicLoading, $state, $timeout, Swap) {

    $scope.dealerOrders = [];
    $scope.stateOrPopup = '';

    if (Swap.dealerOrders.length <= 0) {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        Swap.getDealerOrders();
        $timeout(function () {
            $ionicLoading.hide();
            $scope.dealerOrders = Swap.dealerOrders;
        }, 5000);
    }
    else {
        $scope.dealerOrders = Swap.dealerOrders;
    }

    $scope.initDealer = function () {
        $scope.welcome = "Bienvenido "+Swap.user.name+" "+Swap.user.surname+ "      ("+Swap.user.id_de+")";
    }

    $scope.ordersByState = function (state) {
        $scope.state = state;
        $scope.stateOrPopup = $ionicPopup.show({
            title: 'Seleccione pedido',
            template: '<ion-list><ion-item ng-repeat="order in dealerOrders" item="item" ng-click="goToOrder(order)" ng-if="order.state == state">{{order.date}}<br />{{order.h_c}} en {{order.street}}, {{order.num}}<span ng-if="order.floor > 0">{{order.floor}}º {{order.flat}} > <br /> <span ng-if="order.lift == 0">Sin ascensor</span><span ng-if="order.lift == 1">Con ascensor</span></span><br />{{order.quantity}} bombona(s) {{order.kind}}. Total = {{order.quantity*order.cost_u}}</ion-item><ion-item ng-repeat="order in userOrders_otherAd" item="item" ng-click="goToOrder(order)" ng-if="order.id_ad == order.state == state">{{order.quantity}} bombona(s) a {{order.cost_u}} &euro;/unid = {{order.quantity*order.cost_u}} &euro; <br />{{order.date}}</ion-item></ion-list>',
            scope: $scope,
            buttons: [{
                text: 'Cancelar',
                type: 'button-outline button-positive'
            }]
        });
    }

    $scope.goToOrder = function (order) {
        Swap.order = order;
        if ($scope.stateOrPopup != '')
        {
            $scope.stateOrPopup.close();
        }
        Swap.previousPage = 'menuPrincipal2';
        $state.go('datosPedido');
    };

    $scope.doRefresh = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        Swap.getDealerOrders();
        $timeout(function () {
            $ionicLoading.hide();
            $scope.dealerOrders = Swap.dealerOrders;
        }, 5000);
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.closeSession = function () {
        Swap = {};
        $state.go('login');
    }

})
   
.controller('datosPedidoCtrl', function($scope, $ionicPopup, $http, $ionicModal, $ionicLoading, $cordovaGeolocation, Swap) {
    $scope.order = Swap.order;

    $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modal = modal;
    });

    $scope.showModal_map = function (order) {
        destAddress = order.street + ", " + order.num + ", " + order.cp;

        $scope.modal.show();
        $scope.showMap(destAddress);
    }

    $scope.confOrder = function (numOrder, observation) {
        console.log(numOrder + " " + observation);
        if (!numOrder || numOrder.length <= 0) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca n&uacute;mero de pedido para confirmar entregar (p&iacute;dalo al cliente)'
            });
        }
        else {
            if (!observation || observation.length <= 0 || observation == " ") {
                console.log("AQUI");
            }
            else {
                //INSERTAR OBSERVACION QUE HAY
                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                    type: 'get', table: 'ORDERS', field: ['id_or','id_co'], where: ['id_or'], wherecond: [$scope.order.id_or]
                })
                .success(function (data) {
                    if (data.success) {
                        if(data.id_co == null)
                        {
                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                type: 'new', table: 'COMPLAINTS', field: ['id_co','dealer_coment'], 
                                value: ['(SELECT MAX(id_co) FROM COMPLAINTS C)+1', observation]
                            })
                            .success(function (data) {
                                if (data.success) {
                                    console.log("Insertada observacion con id_co = null");
                                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                        type: 'upd', table: 'ORDERS', field: ['id_co'], value: ['(SELECT MAX(id_co) FROM COMPLAINTS C)'],
                                        where: ['id_or'], wherecond: [$scope.order.id_or]
                                    })
                                    .success(function (data1) {
                                        if (data1.success) {
                                        }
                                        else {

                                        }
                                    })
                                    .error(function (data) {
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: 'Conexi&oacute;n err&oacute;nea'
                                        });
                                    })
                                }
                                else{
                                    console.log("No insertada observacion con id_co = null");
                                }
                            })
                            .error(function (data) {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Conexi&oacute;n err&oacute;nea'
                                });
                            })
                        }
                        else
                        {
                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                type: 'upd', table: 'COMPLAINTS', field: ['dealer_coment'], value: [observation],
                                where: ['id_co'], wherecond: [data.id_co]
                            })
                            .success(function (data1) {
                                if (data1.success) {
                                    console.log("Insertada observacion");
                                }
                                else {
                                    console.log("No insertada observacion");
                                }
                            })
                            .error(function (data1) {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Conexi&oacute;n err&oacute;nea'
                                });
                            })
                        }
                    }
                })
            }
        }
    }

    $scope.showMap = function (destAddress) {
        var directionService = new google.maps.DirectionsService();
        var directionDisplay = new google.maps.DirectionsRenderer();

        var latlng_current;

        $ionicLoading.show({
            content: 'Obteniendo localizaci&oacute;n...',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 30000
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            latlng_current = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            
            var mapOptions = {
                zoom: 7,
                center: latlng_current,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
            directionDisplay.setMap($scope.map);

            var request = {
                origin: latlng_current,
                destination: destAddress,
                travelMode: google.maps.TravelMode.DRIVING
            }
            directionService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionDisplay.setDirections(response);
                }
            });
            $ionicLoading.hide();
        }, function (err) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error',
                template: 'No se pudo obtener su posici&oacute;n actual'
            });
        });
    }

})
    