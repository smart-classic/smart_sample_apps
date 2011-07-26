var years_apart = function(d1, d2) {
    return (1.0*
	    parse_date(d1).getTime()-
	    parse_date(d2).getTime())
	/ (1000 * 60 * 60 * 24 * 365);
};

var parse_date = function(d) {
    ret = [0,0,0,0,0,0];
    var arr = d.match(/\d+/g);
    for (var i = 0; i < arr.length; i++)
	ret[i] = arr[i];
    ret =  new Date(ret[0], ret[1]-1, ret[2], ret[3], ret[4], ret[5]);
    return ret;
};

	  
var get_demographics = function() {
    var dfd = $.Deferred();
    SMART.DEMOGRAPHICS_get(function(demos) {
	dfd.resolve(demos.prefix('foaf', 'http://xmlns.com/foaf/0.1/')
                    .prefix('sp', 'http://smartplatforms.org/terms#')
                    .where('?a foaf:givenName ?givenName')
                    .where('?a foaf:familyName ?familyName')
                    .where('?a foaf:gender ?gender')
                    .where('?a sp:birthday ?birthday')
                    .get(0));
    });
    return dfd.promise();
};
	  
var get_vitals = function() {
    var dfd = $.Deferred();
    var vitals = [];
    
    SMART.VITAL_SIGNS_get(function(vital_signs){	
        vital_signs.where('?v dc:date ?vital_date')
            .where('?v sp:height ?h_vu')
            .where('?h_vu sp:value ?height')
            .where('?v sp:bloodPressure ?bp')
            .where('?bp sp:systolic ?sys_vu')
            .where('?bp sp:diastolic ?dias_vu')
            .where('?sys_vu sp:value ?systolic')
            .where('?dias_vu sp:value ?diastolic')
            .each(function(){vitals.push(this)});
	dfd.resolve(vitals);
    });
    return dfd.promise();
};


