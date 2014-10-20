'use strict';

// Main app module called by index.html
var $dmApp = angular.module('SMART_Disease_Monograph', ['DM.controllers']);

$dmApp.config([
    '$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/monograph.html',
            controller: '$dmController'
        });
        $routeProvider.otherwise({ redirectTo: '/' });
    }
]);

$dmApp.run(function ($rootScope) {
    $rootScope.sharedVars = {
        serviceBaseUrl: "//dm-service.smartplatforms.org",
        servicePort: "",
        version: 'V1.95',
        enableCart: false,
        verboseDisplay: false,
        prefsVisible: false
    }

    $rootScope.buttonLabel = function (arg) {
        return arg ? "On" : "Off";
    }
});

// Not sure where to put this so I will put it here
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

Array.prototype.sortByOrdinal = function () {
    var self = this;
    var sorted = _.sortBy(this, function (item) {
        return item.ordinal;
    });
    
    _.each(sorted, function (item, index) {
        self[index] = item;
    });
    return self;
};

Array.prototype.sortByOrder = function () {
    var self = this;
    var sorted = _.sortBy(this, function (item) {
        return item.order;
    });

    _.each(sorted, function (item, index) {
        self[index] = item;
    });
    return self;
};
