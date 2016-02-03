(function() {
    'use strict';

    angular
    .module('app.reservas')
    .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStatesAuthenticated(getStates());
    }

    function getStates() {
        return [
            {
                state: 'admin.reservas',
                config: {
                    url: '/reservas',
                    templateUrl: 'app/reservas/reservas.html',
                    redirectTo: 'admin.reservas.mensalistas',
                }
            },
        ];
    }
})();
