angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
      
        
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })
        
      
    
      
        
    .state('registrate', {
      url: '/signup',
      templateUrl: 'templates/registrate.html',
      controller: 'registrateCtrl'
    })
        
      
    
      
        
    .state('menuLateral.menuPrincipal', {
      url: '/mainClient',
      views: {
        'side-menu21': {
          templateUrl: 'templates/menuPrincipal.html',
          controller: 'menuPrincipalCtrl'
        }
      }
    })
        
      
    
      
        
    .state('menuLateral.misPedidos', {
      url: '/orders',
      views: {
        'side-menu21': {
          templateUrl: 'templates/misPedidos.html',
          controller: 'misPedidosCtrl'
        }
      }
    })
        
      
    
      
        
    .state('nuevoPedido', {
      url: '/newOrder',
      templateUrl: 'templates/nuevoPedido.html',
      controller: 'nuevoPedidoCtrl'
    })
        
      
    
      
        
    .state('verPedido', {
      url: '/seeOrder',
      templateUrl: 'templates/verPedido.html',
      controller: 'verPedidoCtrl'
    })
        
      
    
      
        
    .state('reclamacion', {
      url: '/claim',
      templateUrl: 'templates/reclamacion.html',
      controller: 'reclamacionCtrl'
    })
        
      
    
      
        
    .state('menuLateral.misReclamaciones', {
      url: '/claims',
      views: {
        'side-menu21': {
          templateUrl: 'templates/misReclamaciones.html',
          controller: 'misReclamacionesCtrl'
        }
      }
    })
        
      
    
      
        
    .state('menuLateral.miCuenta', {
      url: '/account',
      views: {
        'side-menu21': {
          templateUrl: 'templates/miCuenta.html',
          controller: 'miCuentaCtrl'
        }
      }
    })
        
    .state('menuLateral.cerrarSesion', {
         url: '/login',
         views: {
             'side-menu21': {
                 templateUrl: 'templates/login.html',
                 controller: 'loginCtrl'
             }
         }
     })
    
      
        
    .state('menuPrincipal2', {
      url: '/mainDelivery',
      templateUrl: 'templates/menuPrincipal2.html',
      controller: 'menuPrincipal2Ctrl'
    })
        
      
    
      
        
    .state('datosPedido', {
      url: '/orderData',
      templateUrl: 'templates/datosPedido.html',
      controller: 'datosPedidoCtrl'
    })
        
      
    
      
    .state('menuLateral', {
      url: '/side-menu21',
      abstract:true,
      templateUrl: 'templates/menuLateral.html'
    })
      
    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});