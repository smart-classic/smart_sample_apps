'use strict';

/* Controllers */
angular.module("medrec") .controller("MedRecController",
  function($scope, MedLists) {
	$scope.reconciled = [];

	$scope.updateReconciled = function() {

		$scope.reconciled.length = 0;

		angular.forEach($scope.meds, function(med, meduri) {
			if (med.selected) {
				$scope.reconciled.push(med);
			}
		});

		$scope.reconciled.sort(function(a,b){
			var a = a.t.value.toLowerCase();
			var b = b.t.value.toLowerCase();
			if (a<b) return -1;
			if (a>b) return 1;
			return 0;
		});
	};

	MedLists.get.then(function(r){
		angular.extend($scope, r);
	});
  });
