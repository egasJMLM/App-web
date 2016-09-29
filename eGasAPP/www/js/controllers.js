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

    Swap.getBottles();

})

.controller('miConsumoCtrl', function ($scope, $ionicPopup, $http, $ionicLoading, $state, $timeout, Swap, AsyncSwap) {
    
    var fromPopUp_ad = 0;

    $scope.userAddresses = [];
    $scope.user_selAd = {};

    $scope.basculesByAddress = [];
    $scope.selectedBascule = {};
    
    $scope.selAdPopup = '';
    $scope.selBaPopup = '';

    $scope.value = 0;
    $scope.value_porcentaje = 0;
    $scope.value_maxGas = 0;

    $scope.loadChart = function()
    {
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
                  "value": $scope.value_porcentaje
              }
            ],
            "axes": [
              {
                  "bottomText": $scope.value_porcentaje + " %  (" + $scope.value_maxGas + " kg gas max)",
                  "bottomTextFontSize": 14,
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
    }

    $scope.getUser_selAd = function (selAd) {

        for (i = 0; i < $scope.userAddresses.length; ++i) {
            if ($scope.userAddresses[i].id_ad == selAd) {
                $scope.user_selAd = $scope.userAddresses[i];

                if (fromPopUp_ad == 1)
                {
                    $scope.selAdPopup.close();
                    fromPopUp_ad = 0;

                    $ionicLoading.show({
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    });
                    AsyncSwap.getBasculesByAddress(selAd).then(
                        function (data) {
                            $scope.basculesByAddress = data;
                            $ionicLoading.hide();
                            $scope.selBas();
                        },
                        function (data) {
                            $ionicLoading.hide();
                            $scope.basculesByAddress = 0;
                            $scope.selectedBascule = 0;
                            if (data == 0) {
                                $scope.value_porcentaje = 0;
                                $scope.loadChart();
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'No tiene b&aacute;scula en esta direcci&oacute;n'
                                });
                            }
                        }
                    )
                }
                break;
            }
        }
    }

    $scope.getUser_selBas = function(selBa)
    {
        for(i=0; i < $scope.basculesByAddress.bascules.length; i++)
        {
            if ($scope.basculesByAddress.bascules[i].id_ba == selBa)
            {
                $scope.selectedBascule = $scope.basculesByAddress.bascules[i];
                $scope.selBaPopup.close();
                AsyncSwap.getLastMeasureByBascule($scope.selectedBascule.id_ba).then(
                    function (data1) {
                        $scope.value = data1.value;
                        if (!data1.value)
                        {
                            $ionicPopup.alert({
                                title: 'B&aacute;scula con valores err&oacute;neos'
                            });
                            $scope.value = 0;
                        }
                        $scope.porcentajeBombona();
                        $scope.loadChart();
                    },
                    function (data1) {
                        $scope.value_porcentaje = 0;
                        $scope.loadChart();
                    }
                )
                break;
            }
        }
    }

    $scope.porcentajeBombona = function()
    {
        if($scope.value < $scope.user_selAd.bottle.empty_weight * 0.90)
        {
            $ionicPopup.alert({
                title: 'Aviso',
                template: 'Seg&uacute;n indica la &uacute;ltima medida, no hay ninguna bombona sobre la b&aacute;scula o no es del tipo indicado en la direcci&oacute;n'
            });
            $scope.value_porcentaje = 0;
        }
        else if ($scope.value > $scope.user_selAd.bottle.weight * 1.10) {
            $ionicPopup.alert({
                title: 'Aviso',
                template: 'Seg&uacute;n indica la &uacute;ltima medida, no hay ninguna bombona sobre la b&aacute;scula o no es del tipo indicado en la direcci&oacute;n'
            });
            $scope.value_porcentaje = 0;
        }
        else
        {
            $scope.value_maxGas = $scope.user_selAd.bottle.weight - $scope.user_selAd.bottle.empty_weight;
            $scope.value_porcentaje = Math.round((($scope.value - $scope.user_selAd.bottle.empty_weight) * 100) / ($scope.value_maxGas));

            if ($scope.value_porcentaje > 100) $scope.value_porcentaje = 100;
            if ($scope.value_porcentaje < 0) $scope.value_porcentaje = 0;
        }
    }

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    Swap.getUserAddresses();
    
    if (Swap.user.main_ad < 0)
    {
        $ionicPopup.alert({
            title: 'Error',
            template: 'Indique direcci&oacute;n'
        });
    }
    else
    {
        AsyncSwap.getBasculesByAddress(Swap.user.main_ad).then(
            function (data) {
                $scope.basculesByAddress = data;
                $scope.selectedBascule = $scope.basculesByAddress.bascules[0];

                AsyncSwap.getLastMeasureByBascule($scope.selectedBascule.id_ba).then(
                    function (data1) {
                        $scope.value = data1.value;
                    },
                    function(data1){
                        $scope.value_porcentaje = 0;
                    }
                )
            },
            function (data) {
                if(data == 0)
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'No tiene b&aacute;scula en esta direcci&oacute;n'
                    });
                }
            }
        )
    }
    

    $timeout(function () {
        $scope.userAddresses = Swap.userAddresses;
        $scope.getUser_selAd(Swap.user.main_ad);
    }, 3000);

    $timeout(function () {
        $ionicLoading.hide();
        $scope.userAddresses = Swap.userAddresses;
        $scope.getUser_selAd(Swap.user.main_ad);
        $scope.porcentajeBombona();
        $scope.loadChart();
    }, 7000);

    $scope.selAd = function ()
    {
        fromPopUp_ad = 1;
        $scope.selAdPopup = $ionicPopup.show({
            title: 'Seleccione direcci&oacute;n',
            template: '<ion-list><ion-item ng-if="userAddresses.length <= 0">No tiene otras direcciones en nuestra app</ion-item><ion-item ng-repeat="address in userAddresses" item="item" ng-click="getUser_selAd(address.id_ad)">{{address.street}}, {{address.num}} <span ng-if="address.floor > 0">{{address.floor}}&deg; {{address.flat}}. </span></ion-item></ion-list>',
            scope: $scope,
            buttons: [{
                text: 'Cancelar',
                type: 'button-outline button-positive'
            }]
        });
    }

    $scope.selBas = function()
    {
        $scope.selBaPopup = $ionicPopup.show({
            title: 'Seleccione b&aacute;scula',
            template: '<ion-list><ion-item ng-if="basculesByAddress.bascules.length <= 0">No tiene b&aacute;scula en esta direcci&oacute;n</ion-item><ion-item ng-repeat="bascule in basculesByAddress.bascules" item="item" ng-click="getUser_selBas(bascule.id_ba)">B&aacute;scula en {{bascule.nombre}}</ion-item></ion-list>',
            scope: $scope,
            buttons: [{
                text: 'Cancelar',
                type: 'button-outline button-positive'
            }]
        });
    }

    $scope.editBas = function()
    {
        $scope.data = {};

        var editBasPopup = $ionicPopup.show({
            title: 'Editar b&aacute;scula',
            template: 'Introduzca nuevo nombre para la b&aacute;scula <input ng-model="data.newName">',
            scope: $scope,
            buttons: [{
                text: 'Cancelar'
            }, {
                text: 'Guardar',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.data.newName) {
                        //don't allow the user to close unless he enters old password
                        e.preventDefault();
                    } else {
                        return $scope.data;
                    }
                }
            }]
        });

        editBasPopup.then(function (res) {
            if (res) {
                if (res.newName != " " && res.newName != "") {
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                    {
                        type: 'upd', table: 'BASCULE', field: ['nombre'], value: [res.newName],
                        where: ['id_ba'], wherecond: [$scope.selectedBascule.id_ba]
                    })
                    .success(function (data) {
                        if (data.success) {
                            $scope.selectedBascule.nombre = res.newName;
                            for (i = 0; i < $scope.basculesByAddress.bascules.length; i++) {
                                if ($scope.basculesByAddress.bascules[i].id_ba == $scope.selectedBascule.id_ba) {
                                    $scope.basculesByAddress.bascules[i].nombre = res.newName;
                                    break;
                                }
                            }
                            $ionicPopup.alert({
                                title: 'Nombre de b&aacute;scula modificado correctamente'
                            });
                        }
                        else {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Al enviar la modificaci&oacute;n'
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
                        title: 'Error',
                        template: 'El nombre introducido no es v&aacute;lido'
                    });
                }
            }
        });
    }

    $scope.delBas = function()
    {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Eliminar b&aacute;scula',
            template: '&iquest;Est&aacute; seguro? Tambi&eacute;n eliminar&aacute; las medidas anteriores'
        });

        confirmPopup.then(function (res) {
            if (res) {
                AsyncSwap.deleteBascule($scope.selectedBascule.id_ba).then(
                    function (data) {
                        for (i = 0; i < $scope.basculesByAddress.bascules.length; i++) {
                            if ($scope.basculesByAddress.bascules[i].id_ba == $scope.selectedBascule.id_ba) {
                                $scope.basculesByAddress.bascules.splice(i, 1);
                                $scope.selectedBascule = {};
                                break;
                            }
                        }
                        $ionicPopup.alert({
                            title: 'B&aacute;scula eliminada correctamente'
                        });
                    },
                    function(data){
                        if(data == 0)
                        {
                            for (i = 0; i < $scope.basculesByAddress.bascules.length; i++)
                            {
                                if ($scope.basculesByAddress.bascules[i].id_ba == $scope.selectedBascule.id_ba) {
                                    $scope.basculesByAddress.bascules.splice(i, 1);
                                    $scope.selectedBascule = {};
                                    break;
                                }
                            }
                            $ionicPopup.alert({
                                title: 'B&aacute;scula eliminada con errores',
                                template: 'Hubo alg&uacute;n error durante el proceso'
                            });
                        }
                    }
                )
            }
        });
    }

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
        }, 6000);
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
    $scope.idBo_sel = "";
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
            idBo = $scope.idBo_sel;
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
                        table: 'ORDERS', field: ['id_or', 'quantity', 'id_bo', 'cost_u', 'deliver_time', 'state'],
                        value: [newOr_id, order.numBottle, idBo, costBo, order.deliver_time, '0']
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
                                                id_or: newOr_id, quantity: order.numBottle, id_bo: idBo,
                                                cost_u: costBo, date: d.toLocaleString(), deliver_time: order.deliver_time,
                                                state: '0', id_co: 'NULL'
                                            });
                                            $scope.userOrders = Swap.userOrders;

                                            var bottleInfo = '';
                                            for (i = 0; i < Swap.bottles.length; i++)
                                            {
                                                if(Swap.bottles[i].id_bo == idBo)
                                                {
                                                    bottleInfo = Swap.bottles[i].kind + ' ' + Swap.bottles[i].gas + ' ' + Swap.bottles[i].empty_weight + ' kg';
                                                    break;
                                                }
                                            }
                                            var addressInfo = '';
                                            for (j = 0; j < $scope.userAddresses.length; j++) {
                                                if ($scope.userAddresses[j].id_ad == selAd) {
                                                    addressInfo = $scope.userAddresses[j].street + ' ' + $scope.userAddresses[j].num + ', ' + $scope.userAddresses[j].floor + 'º ' + $scope.userAddresses[j].flat+'. CP: '+$scope.userAddresses[j].cp;
                                                    break;
                                                }
                                            }

                                            var msgText = '' + order.numBottle + ' bombonas ' + bottleInfo + '. ' + addressInfo;
                                            var msgID = 0;

                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                type: 'new', table: 'MESSAGE', field: ['type', 'text'], value: ['order', msgText]
                                            })
                                            .success(function (data) {
                                                if (data.success) {
                                                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                        type: 'get', table: 'MESSAGE ORDER BY id_msg DESC LIMIT 1', field: ['id_msg']
                                                    })
                                                    .success(function (data1) {
                                                        if (data1.success) {
                                                            msgID = parseInt(data1.dataDB[0].id_msg) + 1;

                                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                                type: 'new', table: 'LINK_DISTRIBUTOR_MESSAGE', field: ['id_msg', 'id_di'],
                                                                value: [msgID, selDi]
                                                            })
                                                            .success(function (data2) {
                                                                if (data2.success) {
                                                                    console.log("Mensaje guardado correctamente");
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
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
        {type: 'get', table: 'BOTTLE', field: ['weight','empty_weight','kind','gas'], where: ['id_bo'], wherecond: [dataBot.id_bo]})
        .success(function(data4){
            if (data4.success) {
                distrByUser.push({
                    id_di: id_diI, company: dataDist.company, street: dataDist.street,
                    num: dataDist.num, telephone: dataDist.telephone, id_bo: dataBot.id_bo,
                    price: dataBot.price, weight: data4.dataDB[0].weight, empty_weight: data4.dataDB[0].empty_weight,
                    kind: data4.dataDB[0].kind, gas: data4.dataDB[0].gas
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

    $scope.selectDist = function (id_diSel, idBo_sel, costBo_sel) {
        $scope.selectedDi = id_diSel;
        $scope.idBo_sel = idBo_sel;
        $scope.costBo_sel = costBo_sel;
    };
})
   
.controller('verPedidoCtrl', function ($scope, $state, $ionicPopup, $http, Swap) {
    $scope.order = Swap.order;

    $scope.correctOrder = function (order) {
        var dealerID = 0;
        var auxState = 3;

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
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                        type: 'get', table: 'LINK_ORDER_DEALER', field: ['id_de'], where: ['id_or'], wherecond: [order.id_or]
                    })
                    .success(function (data) {
                        if (data.success) {
                            dealerID = data.dataDB[0].id_de;

                            if(dealerID == order.deliverNumber)
                            {
                                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                    type: 'get', table: 'ORDERS', field: ['state'], value: [auxState], where: ['id_or'], wherecond: [order.id_or]
                                })
                                .success(function (data) {
                                    if (data.success) {
                                        if (data.dataDB[0].state == 2 || data.dataDB[0].state == "2") {
                                            auxState = 3;
                                        }
                                        else {
                                            auxState = 1;
                                        }

                                        $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                            type: 'upd', table: 'ORDERS', field: ['state'], value: [auxState], where: ['id_or'], wherecond: [order.id_or]
                                        })
                                        .success(function (data) {
                                            if (data.success) {
                                                $scope.order.state = auxState;
                                                for (i < 0; i < Swap.userOrders.length; ++i) {
                                                    if (Swap.userOrders[i].id_or == $scope.order.id_or) {
                                                        Swap.userOrders[i].state = auxState;
                                                        break;
                                                    }
                                                }
                                                $ionicPopup.alert({
                                                    title: 'Se ha confirmado la recepci&oacute;n del pedido'
                                                });

                                                $state.go('menuLateral.menuPrincipal');
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
                                    }
                                    else
                                    {
                                        $ionicPopup.alert({
                                            title: 'Pedido NO confirmado',
                                            template: 'El pedido no ha podido ser confirmado como recibido. Por favor vuelva a intentarlo de nuevo'
                                        });
                                    }
                                })                             
                            }
                            else
                            {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'El identificador de repartidor introducido no es correcto'
                                });
                            }
                        }
                    })
                    .error(function (data) {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Conexi&oacute;n err&oacute;nea. El pedido no pudo ser confirmado'
                        });
                    })

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
    }, 6000);

    $scope.getComplaints = function () {
        $scope.complaintOrders.length = 0;
        $scope.noComplaintOrders.length = 0;

        for (i = 0; i < $scope.userOrders.length; ++i) {
            if ($scope.userOrders[i].state == -2 || $scope.userOrders[i].state == '-2') {
                $scope.complaintOrders.push($scope.userOrders[i]);
            }
            else if ($scope.userOrders[i].state == 0 || $scope.userOrders[i].state == '0'
                    || $scope.userOrders[i].state == 4 || $scope.userOrders[i].state == '4') {
                $scope.noComplaintOrders.push($scope.userOrders[i]);
            }
        }
    }

    $scope.showCurrentOrders = function () {
        $scope.currentOrdersPopup = $ionicPopup.show({
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
                    }, 6000);
                }
            }]
        });
    }

    $scope.goToOrder = function (order) {
        Swap.order = order;
        Swap.previousPage = 'menuLateral.misReclamaciones';
        $state.go('verPedido');
        $scope.currentOrdersPopup.close();
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
        AsyncSwap.getUserAddresses(Swap.user.id_us).then(
            function (data) {
                if (Swap.bottles.length <= 0)
                {
                    Swap.getBottles();
                }
                for (i = 0; i < data.length; ++i)
                {
                    for(j=0; j < Swap.bottles.length; ++j)
                    {
                        if(data[i].bottle == Swap.bottles[j].id_bo)
                        {
                            data[i].bottle = {
                                id_bo: Swap.bottles[j].id_bo, weight: Swap.bottles[j].weight, empty_weight: Swap.bottles[j].empty_weight,
                                kind: Swap.bottles[j].kind, gas: Swap.bottles[j].gas
                            }
                            j = Swap.bottles.length;
                        }
                    }
                
                }
                Swap.userAddresses = data;
                $scope.userAddresses = data;
                $ionicLoading.hide();
            },
            function (data) {
                if (Swap.bottles.length <= 0)
                {
                    Swap.getBottles();
                }
                $ionicLoading.hide();
            }
        )
    };

    $scope.newAddress = function () {
        $scope.newAdd = {};

        if (Swap.bottles <= 0)
        {
            Swap.getBottles();
        }
        $scope.bottles = Swap.bottles;

        var newAddressPopup = $ionicPopup.show({
            title: 'Nueva direcci&oacute;n',
            template: 'Calle* <input type="text" ng-model="newAdd.street">' +
                '<span style="float:left;width:32%;">Num*  <input type="number" ng-model="newAdd.number"></span><span style="margin-left:1%;float:left;width:32%;">Planta <input type="number" ng-model="newAdd.floor"></span><span style="margin-left:1%;float:left;width:32%;">Letra <input type="text" ng-model="newAdd.letter"></span>' +
                '<span style="float:left;width:49%;">CP* <input type="text" ng-model="newAdd.cp" ng-required="true"></span><span style="margin-left:2%float:left;width:49%;">Tipo* <select ng-model="newAdd.type" style="width:50%"><option>Vivienda</option><option>Local comercial</option></select></span>' +
                '<ion-checkbox ng-show="newAdd.floor > 0" ng-model="newAdd.lift" style="clear:both;">Ascensor</ion-checkbox> <span ng-show="newAdd.type == \'Vivienda\'" > N&ordm; inquilinos* <input type="number" ng-model="newAdd.persons"></span>' +
                '<span style="float:left;">Bombona* <select ng-model="newAdd.bottleType"><option ng-repeat="bottle in bottles">{{bottle.id_bo}} {{bottle.kind}} {{bottle.gas}} {{bottle.empty_weight}} kg</option></select></span>',
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

                res.bottleType = res.bottleType.split(" ")[0];

                for (i = 0; i < Swap.bottles.length; ++i)
                {
                    if(Swap.bottles[i].id_bo == res.bottleType)
                    {
                        bottle = Swap.bottles[i];
                        break;
                    }
                }

                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                    type: 'get', table: 'ADDRESS', field: ['id_ad'],
                    where: ['home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                    wherecond: [res.type, res.street.toUpperCase(), res.cp.toUpperCase(), res.number, res.floor,
                        res.letter, res.lift, res.persons, res.bottleType]
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
                                    lift: res.lift, tenants: res.persons, bottle: bottle
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
                                res.letter, res.lift, res.persons, res.bottleType]
                        })
                        .success(function (data2) {
                            if (data2.success) {
                                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                    type: 'get', table: 'ADDRESS', field: ['id_ad'],
                                    where: ['home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                                    wherecond: [res.type, res.street.toUpperCase(), res.cp.toUpperCase(), res.number, res.floor,
                                        res.letter, res.lift, res.persons, res.bottleType]
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
                                                    lift: res.lift, tenants: res.persons, bottle: bottle
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
        if (Swap.bottles <= 0) {
            Swap.getBottles();
        }
        $scope.bottles = Swap.bottles;

        address.num = parseInt(address.num);
        address.floor = parseInt(address.floor);
        address.tenants = parseInt(address.tenants);
        address.lift = parseInt(address.lift);
        if (address.lift) $scope.aux_lift = true;
        else $scope.aux_lift = false;
        address.bottle = address.bottle.id_bo + " " + address.bottle.kind + " " + address.bottle.gas + " " + address.bottle.empty_weight + " kg";
        $scope.edittedAdd = address;
        
        $scope.editAddressPopup = $ionicPopup.show({
            title: 'Nueva direcci&oacute;n',
            template: 'Calle* <input type="text" ng-model="edittedAdd.street">' +
                '<span style="float:left;width:32%;">Num*  <input type="number" ng-model="edittedAdd.num"></span><span style="margin-left:1%;float:left;width:32%;">Planta <input type="number" ng-model="edittedAdd.floor"></span><span style="margin-left:1%;float:left;width:32%;">Letra <input type="text" ng-model="edittedAdd.flat"></span>' +
                '<span style="float:left;width:49%;">CP* <input type="text" ng-model="edittedAdd.cp" ng-required="true"></span><span style="margin-left:2%float:left;width:49%;">Tipo* <select ng-init="edittedAdd.h_c" ng-model="edittedAdd.h_c" style="width:50%"><option>Vivienda</option><option>Local comercial</option></select></span>' +
                '<ion-checkbox ng-show="edittedAdd.floor > 0" ng-model="edittedAdd.lift" ng-checked="aux_lift" style="clear:both;">Ascensor</ion-checkbox> <span ng-show="edittedAdd.h_c == \'Vivienda\'" > N&ordm; inquilinos* <input type="number" ng-model="edittedAdd.tenants"></span>' +
                '<span style="float:left;">Bombona* <select ng-init="edittedAdd.bottle" ng-model="edittedAdd.bottle"><option ng-repeat="bottle in bottles">{{bottle.id_bo}} {{bottle.kind}} {{bottle.gas}} {{bottle.empty_weight}} kg</option></select></span>' +
                '<a class="button button-balanced button-clear button-block" ng-show="edittedAdd.id_ad != main_userad" ng-click="setMainAd(edittedAdd.id_ad)">&iquest;Direcci&oacute;n principal?</a>',
            scope: $scope,
            buttons: [{
                text: 'Atr&aacute;s'
            }, {
                text: '<i class="icon ion-checkmark-round"></i>',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.edittedAdd.street || !$scope.edittedAdd.num || !$scope.edittedAdd.cp || !$scope.edittedAdd.h_c
                      || ($scope.edittedAdd.h_c == 'Vivienda' && !$scope.edittedAdd.tenants) || !$scope.edittedAdd.bottle) { 
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

                res.bottle = res.bottle.split(" ")[0];

                for (i = 0; i < Swap.bottles.length; ++i) {
                    if (Swap.bottles[i].id_bo == res.bottleType) {
                        bottle = Swap.bottles[i];
                        break;
                    }
                }

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
                        res.num, res.floor, res.flat, res.lift, res.tenants, res.bottle], where: ['id_ad'], wherecond: [res.id_ad]
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
        Swap.getBottles();
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
            template: '<ion-list><ion-item ng-repeat="order in dealerOrders" item="item" ng-click="goToOrder(order)" ng-if="order.state == state">{{order.date}}<br />{{order.h_c}} en {{order.street}}, {{order.num}}<span ng-if="order.floor > 0">{{order.floor}}º {{order.flat}} > <br /> <span ng-if="order.lift == 0">Sin ascensor</span><span ng-if="order.lift == 1">Con ascensor</span></span><br />{{order.quantity}} bombona(s) {{order.kind}}. Total = {{order.quantity*order.cost_u}}<br>{{order.date}}</ion-item></ion-list>',
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
        }, 10000);
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.closeSession = function () {
        Swap = {};
        $state.go('login');
    }

})
   
.controller('datosPedidoCtrl', function($scope, $ionicPopup, $http, $ionicModal, $state, $ionicLoading, $cordovaGeolocation, Swap) {
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

    $scope.confOrder = function (order) {
        console.log(order.numOrder);
        console.log(order.observation);
        if ((!order.numOrder || order.numOrder == "" || order.numOrder == " ")
            && (!order.observation || order.observation == "" || order.observation == " ")) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca n&uacute;mero de pedido para confirmar entregar (p&iacute;dalo al cliente) u observaci&oacuten'
            });
        }
        else {
            if (order.numOrder && order.numOrder != "" && order.numOrder != " ") {
                if (order.numOrder != $scope.order.id_or)
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'N&uacute;mero de pedido introducido incorrecto'
                    });
                }
                else
                {
                    var currentState = 0;
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                        type: 'get', table: 'ORDERS', field: ['state'], where: ['id_or'], wherecond: [$scope.order.id_or]
                    })
                    .success(function (data1) {
                        if (data1.success) {
                            if (data1.dataDB[0].state == 1 || data1.dataDB[0].state == "1") {
                                currentState = 3;
                            }
                            else {
                                currentState = 2;
                            }
                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                type: 'upd', table: 'ORDERS', field: ['state'], value: [currentState],
                                where: ['id_or'], wherecond: [$scope.order.id_or]
                            })
                            .success(function (data1) {
                                if (data1.success) {
                                    $ionicPopup.alert({
                                        title: '&Eacute;xito',
                                        template: 'Estado de pedido actualizado. Confirmado por repartidor'
                                    });
                                    for(i=0;i < Swap.dealerOrders.length; i++)
                                    {
                                        if(Swap.dealerOrders[i].id_or == $scope.order.id_or)
                                        {
                                            Swap.dealerOrders.splice(i, 1);
                                            $scope.dealerOrders = Swap.dealerOrders;
                                            break;
                                        }
                                    }
                                    var total = $scope.order.quantity * $scope.order.cost_u;
                                    var msgText = '' + total + ' € pagado por ' + $scope.order.quantity + ' bombonas ' + $scope.order.bottle.kind + ' ' + $scope.order.bottle.gas + ' ' + $scope.order.bottle.empty_weight + ' kg en' +
                                        $scope.order.street + ' ' + $scope.order.num + ', ' + $scope.order.floor + 'º ' + $scope.order.flat + '. CP: ' + $scope.order.cp;
                                    var msgID = 0;

                                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                        type: 'new', table: 'MESSAGE', field: ['type','text'], value: ['payment',msgText]
                                    })
                                    .success(function (data) {
                                        if (data.success) {
                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                type: 'get', table: 'MESSAGE ORDER BY id_msg DESC LIMIT 1', field: ['id_msg']
                                            })
                                            .success(function (data1) {
                                                if (data1.success) {
                                                    msgID = parseInt(data1.dataDB[0].id_msg) + 1;

                                                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                                        type: 'new', table: 'LINK_DISTRIBUTOR_MESSAGE', field: ['id_msg','id_di'],
                                                        value: [msgID, Swap.user.id_di]
                                                    })
                                                    .success(function (data2) {
                                                        if (data2.success) {
                                                            console.log("Mensaje guardado correctamente");
                                                        }
                                                    })
                                                }
                                             })
                                        }
                                    })

                                    $state.go('menuPrincipal2');
                                }
                                else {
                                }

                            })
                            .error(function (data1) {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Conexi&oacute;n err&oacute;nea'
                                });
                            })
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
            }

            if (order.observation && order.observation != "" && order.observation != " ") {
                //INSERTAR OBSERVACION QUE HAY
                $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                    type: 'get', table: 'ORDERS', field: ['id_or','id_co'], where: ['id_or'], wherecond: [$scope.order.id_or]
                })
                .success(function (data) {
                    if (data.success) {
                        var compID = 0;
                        if(data.dataDB[0].id_co == null || data.dataDB[0].id_co == 0)
                        {
                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                type: 'get', table: 'COMPLAINTS ORDER BY id_co DESC LIMIT 1', field: ['id_co']
                            })
                            .success(function (data1) {
                                if (data1.success) {
                                    compID = parseInt(data1.dataDB[0].id_co) + 1;
                                }
                            })

                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                type: 'new', table: 'COMPLAINTS', field: ['id_co','dealer_coment'], 
                                value: [compID, order.observation]
                            })
                            .success(function (data1) {
                                if (data1.success) {
                                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                        type: 'upd', table: 'ORDERS', field: ['id_co'], value: [compID],
                                        where: ['id_or'], wherecond: [$scope.order.id_or]
                                    })
                                    .success(function (data2) {
                                        if (data2.success) {
                                            $ionicPopup.alert({
                                                title: '&Eacute;xito',
                                                template: 'Observaci&oacute;n de repartidor insertada'
                                            });
                                        }
                                        else {

                                        }
                                    })
                                    .error(function (data2) {
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
                            .error(function (data1) {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Conexi&oacute;n err&oacute;nea'
                                });
                            })
                        }
                        else
                        {
                            $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                                type: 'upd', table: 'COMPLAINTS', field: ['dealer_coment'], value: [order.observation],
                                where: ['id_co'], wherecond: [data.dataDB[0].id_co]
                            })
                            .success(function (data1) {
                                if (data1.success) {
                                    $ionicPopup.alert({
                                        title: '&Eacute;xito',
                                        template: 'Observaci&oacute;n de repartidor insertada'
                                    });
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
    