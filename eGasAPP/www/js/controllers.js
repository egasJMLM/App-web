angular.module('app.controllers', [])
  
.controller('loginCtrl', function ($scope, $ionicPopup, $state, $http, Swap) {

    $scope.login = function (user) {
        if (!user || !user.name || !user.pass) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca usuario y contrase&ntilde;a'
            });
        }
        else {
            $http.post("http://www.e-gas.es/phpApp/middleDB.php", { type: 'get', table: 'USERS', field: ['id_us','main_ad'], where: ['user', 'pass'], wherecond: [user.name, user.pass] })
            .success(function (data) {
                if (data.success) {
                    Swap.user = { type: 1, id_us: data.dataDB[0].id_us, username: user.name, pass: user.pass, main_ad: data.dataDB[0].main_ad};
                    $state.go('menuLateral.menuPrincipal');
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

})
   
.controller('registrateCtrl', function ($scope, $ionicPopup, $state, $http) {

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
            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                { type: 'get', table: 'USERS', field: ['id_us'], where: ['user'], wherecond: [signup.user] })
            .success(function (data) {
                if (data.success) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Ya existe un usuario con ese nombre de usuario. Por favor, seleccione otro'
                    });
                }
                else
                {
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php", {
                        type: 'new', table: 'USERS', field: ['user', 'pass', 'age', 'date', 'email', 'active', 'main_ad'],
                        value: [signup.user, signup.pass, signup.age, 'NOW()', signup.email, '1', '1']
                    })
                    .success(function (data) {
                        if (data.success)
                        {
                            if (signup.type == 'Vivienda')
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
                            });
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Registro incorrecto',
                                template: 'Error guardando datos de usuario'
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

})
   
.controller('menuPrincipalCtrl', function ($scope, Swap) {

    $scope.initUser = function () {
        $scope.welcome = "Bienvenido " + Swap.user.username;
    }

})
   
.controller('misPedidosCtrl', function ($scope, $ionicPopup, $state, $http, Swap) {

    $scope.getUserOrders = function () {
        Swap.userOrders = [];
        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
        { type: 'get', table: 'LINK_ADDRESS_ORDER', field: ['id_or'], where: ['id_ad'], wherecond: [Swap.user.main_ad] })
        .success(function (data) {
            if (data.success) {
                for(i=0;i<data.dataDB.length;++i){
                    id_or = data.dataDB[i].id_or;
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                    {
                        type: 'get', table: 'ORDERS', field: ['id_or','quantity', 'cost_u', 'date', 'state','id_co'],
                        where: ['id_or'], wherecond: [id_or]
                    })
                    .success(function (data2) {
                        if (data2.success) {
                            Swap.userOrders.push({
                                id_or: data2.dataDB[0].id_or, quantity: data2.dataDB[0].quantity, cost_u: data2.dataDB[0].cost_u,
                                date: data2.dataDB[0].date, state: data2.dataDB[0].state, id_co: data2.dataDB[0].id_co
                            });
                            $scope.userOrders = Swap.userOrders;
                        }
                        else
                        {
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
            else{
                $ionicPopup.alert({
                    title: 'No pedido',
                    template: 'No pedido'
                });
            }
        })
        .error(function (data) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Conexi&oacute;n err&oacute;nea'
            });
        })
    };

    $scope.goToOrder = function (order) {

        Swap.orderId = order.id;
        $state.go('verPedido');
    };

    $scope.doRefresh = function () {
        $scope.userOrders.push({id_or: Swap.orders.length+1, state: 0});
        $scope.$broadcast('scroll.refreshComplete');
        Swap.userOrders = $scope.userOrders;
    }
})
   
.controller('nuevoPedidoCtrl', function ($scope, $ionicPopup, $state, $http, Swap) {

    if (Swap.userAddresses.length <= 0)
    {
        Swap.getUserAddresses();
    }
    $scope.userAddresses = Swap.userAddresses;
    $scope.main_ad = Swap.user.main_ad;

    $scope.newOrder = function (numBottle) {
        if (!numBottle || numBottle.length <= 0) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Introduzca n&uacute;mero de bombonas deseadas'
            });
        }
        else {
            $ionicPopup.alert({
                title: 'Pedido correcto',
                template: 'En breve recibir&aacute; su pedido. <br> Gracias por confiar en eGas!'
            });

            Swap.orders.push({ id: Swap.orders.length+1 });
            $state.go('menuLateral.menuPrincipal');
        }
    };

    $scope.getDistrByUserMainAd = function (id_adSel) {
        var main_cp;
        var distrByUserMainAd = [];

        for(i=0;i<Swap.userAddresses.length;++i)
        {
            if(Swap.userAddresses[i].id_ad = id_adSel)
            {
                main_cp = Swap.userAddresses[i].cp;
                break;
            }
        }

        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
        { type: 'get', table: 'LINK_DISTRIBUTOR_REPARTO_CP', field: ['id_di'], where: ['cp'], wherecond: [main_cp] })
        .success(function (data) {
            if (data.success) {
                for(i=0;i<data.dataDB.length;++i)
                {
                    console.log(i + ": " + data.dataDB[i].id_di);
                    id_diI = data.dataDB[i].id_di;
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                    {type: 'get', table: 'DISTRIBUTOR', field: ['id_di', 'company', 'city', 'street', 'num', 'telephone'],
                    where: ['id_di'], wherecond: [data.dataDB[i].id_di]
                    })
                    .success(function (data2) {
                        if(data2.success)
                        {
                            for (j = 0; j < data2.dataDB.length; j++) {
                                console.log(j+": "+data2.dataDB[j].company);
                                $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                {type: 'get', table: 'LINK_DISTRIBUTOR_BOTTLE', field: ['id_bo', 'price'],
                                    where: ['id_di'], wherecond: [data2.dataDB[j].id_di]})
                                .success(function (data3) {
                                    if (data3.success) {
                                        for(k=0; k < data3.dataDB.length; k++)
                                        {
                                            $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                                            {type: 'get', table: 'BOTTLE', field: ['weight','kind'],
                                            where: ['id_bo'], wherecond: [data3.dataDB[k].id_bo]})
                                            .success(function(data4){
                                                if (data4.success) {
                                                    console.log("FULL SUCCESS");
                                                    console.log("A " + data2.dataDB.length);
                                                    console.log("b");
                                                    distrByUserMainAd.push({
                                                        id_di: data2.dataDB[j].id_di, company: data2.dataDB[j].company, street: data2.dataDB[j].street,
                                                        num: data2.dataDB[j].num, telephone: data2.dataDB[j].telephone, id_bo: data3.dataDB[k].id_bo,
                                                        price: data3.dataDB[k].price, weight: data4.dataDB[0].weight, kind: data4.dataDB[0].kind
                                                    });
                                                }
                                                else
                                                {
                                                    $ionicPopup.alert({
                                                        title: 'Aviso',
                                                        template: 'Algunos datos de las bombonas pueden no ser correctos'
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
                                    }
                                    else {
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: 'Lo sentimos pero alguna distribuidora no ha dado de alta sus bombonas en nuestra app a&uacute;n'
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
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Lo sentimos pero ninguna distribuidora reparte en su zona con nuestra app a&uacute;n'
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
            else
            {
                
            }
        })
        .error(function (data) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Conexi&oacute;n err&oacute;nea'
            });
        })
    };
})
   
.controller('verPedidoCtrl', function ($scope, $state, $ionicPopup, Swap) {
    $scope.orderId = Swap.orderId;

    $scope.correctOrder = function (deliverNumber) {
        if(!deliverNumber || deliverNumber.length <= 0)
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
                template: '&iquest;Est&aacute; seguro de que el pedido es correcto?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $state.go('menuLateral.menuPrincipal');
                }
            });
        }
    }

    $scope.incorrectOrder = function (orderId) {
        Swap.orderId = $scope.orderId;
        $state.go('reclamacion');
    }

})
   
.controller('reclamacionCtrl', function($scope, $ionicPopup, $state) {
    $scope.orderId = Swap.orderId;

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
                    var alertPopup = $ionicPopup.alert({
                        title: 'Reclamaci&oacute;n enviada a distribuidora',
                        template: 'En breve enviaremos respuesta. <br> Gracias por confiar en eGas!'
                    });

                    alertPopup.then(function (res) {
                        $state.go('menuLateral.menuPrincipal');
                    });
                }
            });
        }
    };

})
   
.controller('misReclamacionesCtrl', function ($scope, $ionicPopup, $state, Swap) {

    $scope.orders = Swap.orders;
    $scope.currentOrdersPopup = '';

    $scope.showCurrentOrders = function () {
        currentOrdersPopup = $ionicPopup.show({
            title: 'Seleccione el pedido activo que desea reclamar',
            scope: $scope,
            template: '<ion-list><ion-item ng-repeat="order in orders" item="item" ng-click="goToOrder(order)" ng-model="order.id">dd/MM/YYYY {{order.id}}</ion-item></ion-list>',
            buttons: [
            {
                text: 'Cancelar'
            },
            {
                text: '<i class="icon ion-refresh"></i>',
                type: 'button-positive',
                onTap: function (e) { console.log('Claim refresh..TODO') }
            }]
        });
    }

    $scope.goToOrder = function (order, $http) {
        Swap.orderId = order.id;
        $state.go('verPedido');
        currentOrdersPopup.close();
    };

})
   
.controller('miCuentaCtrl', function ($scope, $ionicPopup, $state, $http, $injector, $compile, Swap) {

    $scope.main_userad = Swap.user.main_ad;

    $scope.modifyAccount = function (account) {
        var fields = [];
        var values = [];
        var newUsername = 0, count = 0;
        var alertTitle = "";
        if (account.user)
        {
            if (account.user != Swap.user.username)
            {
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
                    $scope.changeValues(account, count, newUsername, fields, values, alertTitle);
                })
                .error(function (data) {
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
                    template: 'Ha introducido su mismo nombre de usuario como nuevo. Recuerde que no es obligatorio introducir ning&uacute;n campo'
                });
            }
        }
        if (account.email)
        {
            count++;
            alertTitle += "Email: "+account.email + "<br>";
            fields.push('email');
            values.push(account.email);
        }
        if (account.age)
        {
            count++;
            alertTitle += "Edad: "+account.age + "<br>";
            fields.push('age');
            values.push(account.age);
        }

        if(!account.user)
        {
            $scope.changeValues(account, count, newUsername, fields, values, alertTitle);
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
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                        { type: 'upd', table: 'USERS', field: fields, value: values, where: ['id_us'], wherecond: [Swap.user.id_us] })
                        .success(function (data) {
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
                        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                        { type: 'upd', table: 'USERS', field: ['pass'], value: [res.newPassword], where: ['id_us'], wherecond: [Swap.user.id_us] })
                        .success(function (data) {
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
                } else {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'No coincide la nueva contrase&ntilde;a con su confirmac&oacute;n'
                    });
                }
            }
            else {
                console.log('Caso de no poder modificar BD o antigua contraseña incorrecta');
            }
        });

    };

    $scope.getUserAddresses = function () {
        Swap.userAddresses = [];
        $http.post("http://www.e-gas.es/phpApp/middleDB.php",
        { type: 'get', table: 'LINK_USER_ADDRESS', field: ['id_ad'], where: ['id_us'], wherecond: [Swap.user.id_us] })
        .success(function (data) {
            if (data.success) {
                for(i=0; i< data.dataDB.length; i++)
                {
                    id_ad = data.dataDB[i].id_ad;
                    $http.post("http://www.e-gas.es/phpApp/middleDB.php",
                    {
                        type: 'get', table: 'ADDRESS', field: ['id_ad', 'home_commerce', 'street', 'cp', 'num', 'floor', 'flat', 'lift', 'tenants', 'id_bo'],
                        where: ['id_ad'], wherecond: [id_ad]
                    })
                    .success(function (data2) {
                        if (data2.success)
                        {
                            if(data2.dataDB[0].home_commerce == "h")
                            {
                                data2.dataDB[0].home_commerce = "Vivienda";
                            }
                            else
                            {
                                data2.dataDB[0].home_commerce = "Local comercial";
                            }
                            Swap.userAddresses.push({
                                id_ad: data2.dataDB[0].id_ad, h_c: data2.dataDB[0].home_commerce, street: data2.dataDB[0].street,
                                cp: data2.dataDB[0].cp, num: data2.dataDB[0].num, floor: data2.dataDB[0].floor, flat: data2.dataDB[0].flat,
                                lift: data2.dataDB[0].lift, tenants: data2.dataDB[0].tenants, id_bo: "Tipo 1"
                            });
                            $scope.userAddresses = Swap.userAddresses;
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
                            }
                            else {
                                $ionicPopup.alert({
                                    title: 'Invalid request'
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

    $scope.editAddress = function (address) {
        address.num = parseInt(address.num);
        address.floor = parseInt(address.floor);
        address.tenants = parseInt(address.tenants);
        address.lift = parseInt(address.lift);
        if (address.lift) $scope.aux_lift = true;
        else $scope.aux_lift = false;
        $scope.edittedAdd = address;

        var editAddressPopup = $ionicPopup.show({
            title: 'Nueva direcci&oacute;n',
            template: 'Calle* <input type="text" ng-model="edittedAdd.street">' +
                '<span style="float:left;width:32%;">Num*  <input type="number" ng-model="edittedAdd.num"></span><span style="margin-left:1%;float:left;width:32%;">Planta <input type="number" ng-model="edittedAdd.floor"></span><span style="margin-left:1%;float:left;width:32%;">Letra <input type="text" ng-model="edittedAdd.flat"></span>' +
                '<span style="float:left;width:49%;">CP* <input type="text" ng-model="edittedAdd.cp" ng-required="true"></span><span style="margin-left:2%float:left;width:49%;">Tipo* <select ng-model="edittedAdd.h_c" style="width:50%"><option>Vivienda</option><option>Local comercial</option></select></span>' +
                '<ion-checkbox ng-show="edittedAdd.floor > 0" ng-model="edittedAdd.lift" ng-checked="aux_lift" style="clear:both;">Ascensor</ion-checkbox> <span ng-show="edittedAdd.h_c == \'Vivienda\'" > N&ordm; inquilinos* <input type="number" ng-model="edittedAdd.tenants"></span>' +
                '<span style="float:left;">Bombona* <select ng-model="edittedAdd.id_bo"><option>Tipo 1</option><option>Tipo 2</option></select></span>',
            scope: $scope,
            buttons: [{
                text: '<i class="icon ion-arrow-left-c"></i>'
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
                        }
                        else
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Invalid Request'
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
            }]
        });

        editAddressPopup.then(function (res) { // Only on edit
            if (res) {
                if (res.lift) res.lift = 1;
                else res.lift = 0;

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
                    }
                    else {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'Invalid Request'
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
        });
    }
})
   
.controller('menuPrincipal2Ctrl', function ($scope, $state, Swap) {

    $scope.orders = [
        { id: 0 },
        { id: 1 },
        { id: 33}
    ];

    Swap.orders = $scope.orders;

    $scope.initDealer = function () {
        $scope.welcome = "Bienvenido "+Swap.user.name+" "+Swap.user.surname;
    }

    $scope.goToOrder = function (order) {
        $state.go('datosPedido');
    };

    $scope.doRefresh = function () {
        $scope.orders.push({ id: Swap.orders.length + 1 });
        $scope.$broadcast('scroll.refreshComplete');
        Swap.orders = $scope.orders;
    }

    $scope.closeSession = function () {
        Swap = {};
        $state.go('login');
    }

})
   
.controller('datosPedidoCtrl', function($scope) {

})
    