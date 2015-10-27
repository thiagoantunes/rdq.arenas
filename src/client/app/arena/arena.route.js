(function() {
    'use strict';

    angular
        .module('app.arena')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'arenas.arena',
                config: {
                    url: '/arena',
                    templateUrl: 'app/arena/arena.html',
                    controller:'ArenaCtr',
                    controllerAs:'vm',
                    resolve: {
                        maps: ['uiGmapGoogleMapApi', function(uiGmapGoogleMapApi){
                            return uiGmapGoogleMapApi;
                        }],
                        currentPosition: ['$q', function($q){
                            var deferred = $q.defer();
                            navigator.geolocation.getCurrentPosition(function(position){
                                deferred.resolve(position);
                            });
                            return deferred.promise;
                        }]
                    }
                }
            },
            {
                state: 'arenas.arena.arena-profile',
                config: {
                    url: '/arena-profile',
                    templateUrl: 'app/arena/arena-profile.html'
                }
            },
            {
                state: 'arenas.arena.arena-quadras',
                config: {
                    url: '/arena-quadras',
                    templateUrl: 'app/arena/arena-quadras.html',
                    controller:'QuadraCtrl',
                    controllerAs:'vm',
                    resolve: {
                        loadPlugin: function($ocLazyLoad) {
                            return $ocLazyLoad.load ([
                                {
                                    name: 'css',
                                    insertBefore: '#app-level',
                                    files: [
                                        'bower_components/chosen/chosen.min.css'
                                    ]
                                  },
                            ])
                        }   
                    }
                }
            },
            {
                state: 'arenas.arena.arena-funcionamento',
                config:{
                    url: '/arena-funcionamento',
                    templateUrl: 'app/arena/arena-funcionamento.html',
                    controller:'FuncionamentoCtrl',
                    controllerAs:'vm',
                }
            }
        ];
    }
})();
