/*global $:false */
(function() {
    'use strict';
    angular
    .module('app.arena')
    .controller('PrecosCtrl', PrecosCtrl);
    PrecosCtrl.$inject = [
        'idQuadra' ,
        '$scope',
        'quadraService',
        'funcionamentoService',
        'uiCalendarConfig'  ,
        '$popover' ,
        'blockUI',
        '$window',
        'logger',
        '$modal'
    ];

    /* @ngInject */
    function PrecosCtrl(
        idQuadra,
        $scope,
        quadraService,
        funcionamentoService,
        uiCalendarConfig,
        $popover ,
        blockUI,
        $window,
        logger,
        $modal) {
        var vm = this;

        vm.quadras = quadraService.getQuadras();
        vm.quadraSelecionada = {};
        vm.precos = [];
        vm.eventSources = [[]];
        vm.precoMaximo = 0;
        vm.precoMinimo = 0;
        vm.precoMedio = 0;
        vm.salvarNovoPreco = salvarNovoPreco;
        vm.salvarNovoPrecoModal = salvarNovoPrecoModal;
        vm.selecionaQuadra = selecionaQuadra;
        vm.showNovoPrecoModal = showNovoPrecoModal;
        vm.hideNovoPrecoModal = hideNovoPrecoModal;
        vm.uiConfig = {};

        activate();

        function activate() {

            vm.novoPrecoModal = $modal({
                scope: $scope,
                templateUrl: 'app/arena/precos/modal-novo-preco.html',
                animation:'am-fade-and-slide-top' ,
                show: false
            });

            vm.quadras.$loaded()
            .then(function(q) {
                if (q.length > 0) {
                    if (idQuadra) {
                        vm.quadraSelecionada = _.find(q , {$id : idQuadra});
                    }
                    else {
                        vm.quadraSelecionada = q[0];
                        getPrecos();
                    }
                }
            })
            .catch(function(error) {
                logger.error('Error:', error);
            });

            vm.uiConfig = {
                calendar: {
                    lang:'pt-br',
                    // minTime: '10:00', //TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    // maxTime: '24:00', //TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    // businessHours: {
                    //     start: '10:00',
                    //     end: '24:00',
                    //     dow: [0, 1, 2, 3, 4, 5, 6]
                    // },
                    //height: $window.innerHeight - 160,
                    height: 'auto',
                    timeFormat: 'H(:mm)',
                    header: false,
                    defaultView: 'agendaWeek',
                    scrollTime :  '09:00:00',
                    allDaySlot: false,
                    timezone: 'local',
                    axisFormat: 'H:mm',
                    columnFormat: {
                        week: 'dddd'
                    },
                    editable: true,
                    eventOverlap: false,
                    selectable: true,
                    selectOverlap: false,
                    selectHelper: true,
                    viewRender : viewRender,
                    eventResize: eventResize,
                    eventDrop: eventDrop,
                    select: eventSelect,
                    eventClick: eventClick,
                    eventRender: eventRender,
                    unselectCancel: '.precoForm',
                }
            };

            initDiasSemana();
        }

        function showNovoPrecoModal() {
            vm.novoPrecoModal.$promise.then(vm.novoPrecoModal.show);
        }

        function hideNovoPrecoModal() {
            vm.novoPrecoModal.$promise.then(vm.novoPrecoModal.hide);
        }

        function selecionaQuadra(id) {
            vm.quadraSelecionada = _.find(vm.quadras, {$id : id});
            getPrecos();
        }

        function getPrecos() {
            if (uiCalendarConfig.calendars.precoCalendar) {
                uiCalendarConfig.calendars.precoCalendar.fullCalendar('removeEventSource', vm.precos);

                vm.precos = funcionamentoService.getPrecos(vm.quadraSelecionada.$id);

                vm.precos.$watch(function(event) {
                    vm.precoMaximo = _.max(vm.precos, 'precoAvulso').precoAvulso;
                    vm.precoMinino = _.min(vm.precos, 'precoAvulso').precoAvulso;
                    vm.precoMedio = (vm.precoMaximo + vm.precoMinino) / 2;

                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('removeEvents');
                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('removeEventSource',$('.Source').val());
                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('addEventSource', vm.precos);
                });
            }
        }

        function viewRender(view, element) {
            getPrecos();
        }

        function eventResize(event, delta, revertFunc) {
            blockUI.start();
            var preco = _.find(vm.precos, {
                $id: event.$id
            });
            preco.end = moment(preco.end, 'HH:mm').add(delta._milliseconds, 'milliseconds').format('HH:mm');
            vm.precos.$save(preco).then(function(ref) {
                logger.success('Preço editado com sucesso.');
                blockUI.stop();
            });
        }

        function eventDrop(event, delta, revertFunc) {
            blockUI.start();
            var preco = _.find(vm.precos, {
                $id: event.$id
            });
            preco.start = moment(preco.start, 'HH:mm').add(delta._milliseconds, 'milliseconds').format('HH:mm');
            preco.end = moment(preco.end, 'HH:mm').add(delta._milliseconds, 'milliseconds').format('HH:mm');
            preco.dow = moment(preco.dow[0], 'd').add(delta._days, 'days').format('d');
            vm.precos.$save(preco).then(function(ref) {
                logger.success('Preço editado com sucesso.');
                blockUI.stop();
            });
        }

        function eventSelect(start, end, jsEvent, view) {
            if (end._d.getDay() !== start._d.getDay()) {
                uiCalendarConfig.calendars.precoCalendar.fullCalendar('unselect');
            }
            else {
                var element = $(jsEvent.target).closest('.fc-event');
                var placement = (jsEvent.clientY < 320) ? 'bottom' : 'top';

                if (element.length > 0) {
                    var popover = $popover(element, {
                        placement: placement,
                        title:'',
                        templateUrl: 'app/arena/precos/novo-preco.html',
                        container: '#precos',
                        autoClose: 1,
                        scope: $scope
                    });

                    vm.novoPreco = {
                        start : moment(start._d).format('HH:mm'),
                        end : moment(end._d).format('HH:mm'),
                        dow: start._d.getDay().toString(),
                        precoAvulso : '',
                        precoMensalista : ''
                    };
                    vm.dataLabel = moment(start).format('ddd') + ' de ' +
                    moment(start._d).format('HH:mm') + ' às ' + moment(end._d).format('HH:mm');

                    popover.$promise.then(popover.show);
                }
            }
        }

        function eventClick(calEvent, jsEvent, view) {
            var preco = _.find(vm.precos , {'$id' : calEvent.$id});
            vm.novoPreco = preco;

            var left =  jsEvent.pageX - ($('.popover').width() / 2) ;
            var top = (jsEvent.pageY);
            $('.popover').attr('style' , 'top: ' +
                top + 'px; left: ' +
                left + 'px; display: block; visibility: visible; background:#fff');
        }

        function eventRender(event, element) {
            var quadraColor = vm.quadraSelecionada.color;
            var barato = Math.abs(event.precoAvulso - vm.precoMinino);
            var medio = Math.abs(event.precoAvulso - vm.precoMedio);
            var caro = Math.abs(event.precoAvulso - vm.precoMaximo);
            event.id = event.$id;

            element.css('color', '#fff');
            element.css('border-radius', '4px');
            element.css('font-weight', 'bold');
            element.css('margin-top', '2px');

            if (barato < medio && barato < caro) {
                element.context.classList.add(quadraColor + '-l');
            } else if (medio < barato && medio < caro) {
                element.context.classList.add(quadraColor);
            } else {
                element.context.classList.add(quadraColor + '-d');
            }

            $popover(element, {
                placement: 'bottom',
                title:'',
                templateUrl: 'app/arena/precos/novo-preco.html',
                container: 'body',
                autoClose: 1,
                scope: $scope
            });
        }

        function salvarNovoPreco() {
            vm.novoPreco.title = 'A:  R$ ' +
            vm.novoPreco.precoAvulso +
            '  |  ' + 'M: R$ ' + vm.novoPreco.precoMensalista;

            if (vm.novoPreco.$id) {
                vm.precos.$save(vm.novoPreco);
                logger.success('Preço editado com sucesso.');
            }
            else {

                uiCalendarConfig.calendars.precoCalendar.fullCalendar('removeEventSource', vm.precos);
                vm.precos.$add(vm.novoPreco).then(function(ref) {
                    logger.success('Preço criado com sucesso.');
                    uiCalendarConfig.calendars.precoCalendar.fullCalendar('unselect');
                });
            }
        }

        function salvarNovoPrecoModal() {
            var dow = _.pluck(_.filter(vm.diasSemana, {
                'ativo': true
            }), 'dia');

            funcionamentoService.salvarNovoPreco(vm.novoPrecoModal, dow, vm.precos)
            .then(function() {
                uiCalendarConfig.calendars.precoCalendar.fullCalendar('unselect');
                logger.success('Preço criado com sucesso.');
                hideNovoPrecoModal();
                vm.novoPrecoModal = {};
            },
            function(err) {
                logger.error(err);
            });
        }

        function initDiasSemana() {
            vm.diasSemana = [
                {dia: 0, ativo: false},
                {dia: 1, ativo: false},
                {dia: 2, ativo: false},
                {dia: 3, ativo: false},
                {dia: 4, ativo: false},
                {dia: 5, ativo: false},
                {dia: 6, ativo: false}
            ];
        }

    }
})();
