'use strict';

/* Services */
angular.module("medrec").  factory("MedLists", function($q, $rootScope) {
	var d = $q.defer();
	var ret = {};

	SMART.ready(function() {
		SMART.MEDICATION_LISTS_get(function(lists) {
			var by_list = lists.graph.where("?l rdf:type sp:MedicationList")
			.where("?l sp:medListSource ?s")
			.where("?s dcterms:title ?sname")
			.optional("?l dcterms:date ?d")
			.optional("?l sp:startDate ?sd")
			.optional("?l sp:endDate ?ed");

			var by_med = lists.graph.where('?m rdf:type sp:Medication')
			.where('?m sp:drugName ?n')
			.where('?n dcterms:title ?t');

			var list_dict = {};
			var med_dict = {};

			for (var i = 0; i < by_med.length; i++) {
				var med = by_med[i];
				med_dict[med.m.toString()] = med;
			}

			for (var i = 0; i < by_list.length; i++) {
				var list = by_list[i], 
				uri = list.l.toString();

				list.d.value = new Date(list.d.value);
				list_dict[uri] = list;
				list.meds = [];

				lists.graph.where(uri + ' sp:medication ?m')
				.each(function(){
					list.meds.push(med_dict[this.m.toString()]);
				});
			}

			ret.meds = med_dict;
			ret.medlists = list_dict;
			d.resolve(ret);
			$rootScope.$apply();
		});
	});

	return {
		get: d.promise 
	};

});
