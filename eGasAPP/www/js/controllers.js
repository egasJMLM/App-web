angular.module('app.controllers', [])
  
.controller('loginCtrl', function($scope) {

})
   
.controller('registrateCtrl', function ($scope, $ionicPopup, $state) {

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
            $ionicPopup.alert({
                title: 'Registro correcto',
                template: 'Se ha registrado en eGas satisfactoriamente. Gracias!'
            });
            $state.go('login');
            console.log('Valores a BD: ' + signup.user + ' ' + signup.pass + ' ' + signup.email + ' ' + signup.age + ' ' + signup.bottleType+ ' ' + signup.street + ' ' + signup.cp + ' ' + signup.number + ' ' + signup.floor + ' ' + signup.letter + ' ' + signup.type + ' ' + signup.lift + ' ' + signup.persons);
        }


    }

})
   
.controller('menuPrincipalCtrl', function($scope) {

})
   
.controller('misPedidosCtrl', function ($scope, $ionicPopup, $state, Swap) {
    $scope.orders = [
        { id: 0 },
        { id: 1 }
    ];

    Swap.orders = $scope.orders;

    $scope.goToOrder = function (order) {
        Swap.orderId = order.id;
        $state.go('verPedido');
    };

    $scope.doRefresh = function () {
        $scope.orders.push({id: Swap.orders.length+1});
        $scope.$broadcast('scroll.refreshComplete');
        Swap.orders = $scope.orders;
    }
})
   
.controller('nuevoPedidoCtrl', function($scope, $ionicPopup, $state, Swap) {
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

    $scope.goToOrder = function (order) {
        Swap.orderId = order.id;
        $state.go('verPedido');
        currentOrdersPopup.close();
    };

})
   
.controller('miCuentaCtrl', function ($scope, $ionicPopup) {

    $scope.showAlert = function () {
        $ionicPopup.alert({
            title: 'Datos de cuenta modificados correctemente'
        });
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
                    $ionicPopup.alert({
                        title: 'Contrase&ntilde;a modificada correctamente'
                    });
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

})
   
.controller('menuPrincipal2Ctrl', function($scope) {

})
   
.controller('datosPedidoCtrl', function($scope) {

})
    