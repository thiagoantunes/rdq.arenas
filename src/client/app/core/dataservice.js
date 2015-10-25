var app = angular.module('app.core');

app.factory('FilteredArray', function($firebaseArray) {
  function FilteredArray(ref, filterFn) {
    this.filterFn = filterFn;
    return $firebaseArray.call(this, ref);
  }
  FilteredArray.prototype.$$added = function(snap) {
    var rec = $firebaseArray.prototype.$$added.call(this, snap);
    if( !this.filterFn || this.filterFn(rec) ) {
      return rec;
    }
  };
  return $firebaseArray.$extend(FilteredArray);
});


(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('credentials', credentials)
        .factory('quadraService' , quadraService)
        .factory('funcionamentoService' , funcionamentoService)
        .factory('reservasService', reservasService)
        .factory('repository', repository)
        .factory('peladaFactory', peladaFactory)
        .factory('quadraFactory', quadraFactory)
        .factory('arenaFactory', arenaFactory);

    function cache($cacheFactory){
        var cache = $cacheFactory('appCache');
        return cache;
    }

    function credentials(Auth , $cookies){
        var service = {
            userID : getUserID(),
            arenaID : getArenaID()
        }

        return service;


        function getUserID(){
            var userID = $cookies.get('userID');
            if(!userID)
                Auth.$unauth();
            return userID; 
        }

        function getArenaID(){
            var arenaID = $cookies.get('arenaID');
            if(!arenaID)
                Auth.$unauth();
            return arenaID;
        }
    }

    function quadraService(Ref, $firebaseArray, $firebaseObject, credentials) {
        var service = {
            getRef: getRef,
            //queryQuadra: queryQuadra,

            getQuadra: getQuadra,
            getQuadras: getQuadras,

            addQuadra: addQuadra,
        }

        return service;

        function getRef() {
            return Ref.child('quadras');
        }

        function getQuadra(id) {
            return $firebaseObject(getRef().child(credentials.arenaID + '/' + id));
        }

        function getQuadras() {
            return $firebaseArray(getRef().child(credentials.arenaID));
        }

        function addQuadra(quadra) {
            var quadraID = Ref.child("quadras").push().key();
            var quadraData = {};
            quadraData["arenas/" + credentials.arenaID + "/quadras/" + quadraID] = quadra.nome;
            quadraData["quadras/" + credentials.arenaID + "/" + quadraID] = quadra;

            return Ref.update(quadraData);
        }
    }

    function funcionamentoService(Ref,$firebaseArray, $firebaseObject, credentials){
        var service = {
            getPreco: getPreco,
            getPrecos: getPrecos,
        }

        return service;

        function getPreco(quadraId, id) {
            return $firebaseObject(Ref.child('quadras/' + credentials.arenaID + '/' + quadraId + '/funcionamento/' + id));
        }

        function getPrecos(quadraId) {
            return $firebaseArray(Ref.child('quadras/' + credentials.arenaID + '/' + quadraId + '/funcionamento/'));
        }
    }

    function reservasService(Ref, $firebaseArray, $firebaseObject, credentials, FilteredArray){
        var service = {
            getRef: getRef,

            getAll : getAll,
            getFilteredArray : getFilteredArray,
            getReserva: getReserva,
            getByQuadra : getByQuadra,
            getByType : getByType,
            
            getAvulsas : getAvulsas,
            getMensalistas : getMensalistas,
            getEscolinhas : getEscolinhas
        }

        return service;

        function getRef() {
            return Ref.child('reservas');
        }

        function getFilteredArray(fn){
            var ref = getRef().child(credentials.arenaID);
            return new FilteredArray(ref, fn);
        }

        function getAll(){
            return $firebaseArray(getRef().child(credentials.arenaID));
        }

        function getReserva(id){
            return $firebaseArray(getRef().child(credentials.arenaID+ '/' + id));
        }

        function getByQuadra(quadraId){
            var ref = getRef().child(credentials.arenaID).orderByChild("quadra").startAt(quadraId).endAt(quadraId);
            return $firebaseArray(ref);
        }

        function getByType(){
            var refAvulsas = new Firebase("https://pelapp.firebaseio.com/reservas/" + credentials.arenaID).orderByChild("tipo").equalTo(1);
            var refMensalistas = new Firebase("https://pelapp.firebaseio.com/reservas/" + credentials.arenaID).orderByChild("tipo").equalTo(2);
            var refEscolinha = new Firebase("https://pelapp.firebaseio.com/reservas/" + credentials.arenaID).orderByChild("tipo").equalTo(3);

            return {
                avulsas: $firebaseArray(refAvulsas),
                mensalistas: $firebaseArray(refMensalistas),
                escolinhas: $firebaseArray(refEscolinha)
            }
        }

        function getAvulsas(){
            var refAvulsas = getRef().child(credentials.arenaID).orderByChild("tipo").equalTo(1);
            return $firebaseArray(refAvulsas);
        }

        function getMensalistas(){
            var refMensalistas = getRef().child(credentials.arenaID).orderByChild("tipo").equalTo(2);
            return $firebaseArray(refMensalistas);
        }

        function getEscolinhas(){
            var refEscolinha = getRef().child(credentials.arenaID).orderByChild("tipo").equalTo(3);
            return $firebaseArray(refEscolinha);
        }

    }

    function repository(Ref, $firebaseArray, $firebaseObject, credentials) {
        var service = {
            getArena: getArena,

            getQuadra: getQuadra,
            getQuadras: getQuadras,

            getReserva: getReserva,
            getReservas: getReservas,

            getPreco: getPreco,
            getPrecos: getPrecos,
        };

        return service;

        function getArena() {
            return $firebaseObject(Ref.child('arenas/' + credentials.arenaID));
        }

        function getQuadra(id) {
            return $firebaseObject(Ref.child('quadras/' + credentials.arenaID + '/' + id));
        }

        function getQuadras() {
            return $firebaseArray(Ref.child('quadras/' + credentials.arenaID));
        }

        function getReserva(id) {
            return $firebaseObject(Ref.child('pelada/' + credentials.arenaID + '/' + id));
        }

        function getReservas() {
            return $firebaseArray(Ref.child('pelada/' + credentials.arenaID));
        }

        function getReservasAvulsas() {
            return $firebaseArray(Ref.child('pelada/' + credentials.arenaID).orderByChild("tipo").equalTo(1));
        }

        function getReservasMensais() {
            return $firebaseArray(Ref.child('pelada/' + credentials.arenaID).orderByChild("tipo").equalTo(2));
        }

        function getReservasEscola() {
            return $firebaseArray(Ref.child('pelada/' + credentials.arenaID).orderByChild("tipo").equalTo(3));
        }

        function getPreco(quadraId, id) {
            return $firebaseObject(Ref.child('quadras/' + credentials.arenaID + '/' + quadraId + '/funcionamento/' + id));
        }

        function getPrecos(quadraId) {
            return $firebaseArray(Ref.child('quadras/' + credentials.arenaID + '/' + quadraId + '/funcionamento/'));
        }

    }

    function peladaFactory($firebaseArray) {
        return function(arena) {
            var refAvulsas = new Firebase("https://pelapp.firebaseio.com/reservas/" + arena).orderByChild("tipo").equalTo(1);
            var refMensalistas = new Firebase("https://pelapp.firebaseio.com/reservas/" + arena).orderByChild("tipo").equalTo(2);
            var refEscolinha = new Firebase("https://pelapp.firebaseio.com/reservas/" + arena).orderByChild("tipo").equalTo(3);

            return {
                avulsas: $firebaseArray(refAvulsas),
                mensalistas: $firebaseArray(refMensalistas),
                escolinhas: $firebaseArray(refEscolinha)
            }
        }
    }

    function quadraFactory($firebaseArray) {
        return function(arena) {
            var ref = new Firebase("https://pelapp.firebaseio.com/quadras/" + arena);

            return $firebaseArray(ref);
        }
    }

    function arenaFactory($firebaseObject) {
        return function(arena) {
            var ref = new Firebase("https://pelapp.firebaseio.com/arenas/cesar");

            return $firebaseObject(ref);
        }
    }

})();