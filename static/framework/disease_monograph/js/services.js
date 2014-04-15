'use strict';

/* Semantic CORS services */
var DMSemanticServices = angular.module('DM.SemanticServices',[]);

DMSemanticServices.factory('$dmSemantics', function ($rootScope, $http, $q, $timeout) {
    
    this.serviceUrl = function () {
        return $rootScope.sharedVars.serviceBaseUrl + ':' + $rootScope.sharedVars.servicePort;
    }
    var self = this;
    return {
        MedicineProblems: function (meds) {
            
            var deferred = $q.defer();
            var post = { 'meds': JSON.stringify(meds), 'sources': JSON.stringify([1,2]) };
            $http.post(self.serviceUrl() + '/problems_meds/with_sources',post).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            });
            return deferred.promise;
        },
        MedicineRxTerms: function (meds) {
            
            var deferred = $q.defer();
            
            $http.post(self.serviceUrl() + '/problems_meds/meds', meds).
            success(function (data, status, headers, config) {
                deferred.resolve(data.result);
            });
            return deferred.promise;
        },
        DeIdentify: function (patientDemographics, mode) {
           
            var deferred = $q.defer();
            $http.post(self.serviceUrl() + '/de_ident/' + mode, patientDemographics).
            success(function (data, status, headers, config) {
                deferred.resolve(data.result);
            });
            return deferred.promise;
        },
        LabPanels: function (patientDemographics, CID) {
          
            var deferred = $q.defer();
            var payload = { "gender": patientDemographics.gender[0].toUpperCase(), "age": patientDemographics.age };
            var data = { 'restrict': JSON.stringify(payload) };
            $http.post(self.serviceUrl() + '/test/1234/6/' + CID, data).
               success(function (data, status, headers, config) {
                   deferred.resolve(data);
               }).
                error(function (data, status, headers, config) {
               
               });
            return deferred.promise;
        },
        DecisionSupport: function (labPanels) {
         
            var deferred = $q.defer();
            var data = {'dsData': JSON.stringify(labPanels)};
            $http.post(self.serviceUrl() + '/test/check/', data).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            });
            return deferred.promise;
        },
        OrderSets: function () {
           
            var deferred = $q.defer();
            
            $http({ url: self.serviceUrl() + '/section/orderset/3737/1?rnd='+Math.random(), method: 'GET',  cache: false}).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            });
            return deferred.promise;
        },
        OrderSetsSave: function (columns) {
            var deferred = $q.defer();
            var sections = [];

            var i = 0;
            _.each(columns.column1, function (item) {
                var section = { id: item.secId, column: 1, order: i++, hide: item.hide };
                sections.push(section);
                
            });
            i = 0;
            _.each(columns.column2, function (item) {
                var section = { id: item.secId, column: 2, order: i++, hide: item.hide };
                sections.push(section);
                
            });
            i = 0;
            _.each(columns.column3, function (item) {
                var section = { id: item.secId, column: 3, order: i++, hide: item.hide };
                sections.push(section);
                
            });


            var payload = {
                sections: JSON.stringify(sections),
                numCols: 3,
                entityType: 'user',
                entityId: 3737,
                specId: 1
            };
            $http.post(self.serviceUrl() + '/section/orderset/create', payload).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            });
            return deferred.promise;
        }
    }
});