var get_demographics = function() {
    var dfd = $.Deferred();
        
    SMART.get_demographics().success(function(demos) {
      $.extend(p, demos.graph
                       .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
                       .prefix('v', 'http://www.w3.org/2006/vcard/ns#')
                       .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
                       .where('?r v:n ?n')
                       .where('?n rdf:type v:Name')
                       .where('?n v:given-name ?givenName')
                       .where('?n v:family-name ?familyName')
                       .where('?r foaf:gender ?gender')
                       .where('?r v:bday ?birthday')
                       .get(0))

      var get_age = function(dob_string){
        var dob = new Date(dob_string);
        var today = new Date();
        var db = new Date(dob_string);
        
        if (isNaN(dob)) { // IE Date constructor doesn't parse ISO-8601 -JCM
           dob_string = dob_string.split("-");
           var dob = new Date();
           dob.setFullYear(dob_string[0], dob_string[1]-1, dob_string[2]);
           var db = new Date();
           db.setFullYear(dob_string[0], dob_string[1]-1, dob_string[2]);
        }

        var cy = today.getFullYear();
        var by = dob.getFullYear();
        db.setFullYear(cy);
        var adj = (today-db<0) ? 1 : 0;
        return cy - by - adj;
      }

      p.age.value = get_age(p.birthday.value);
      
      if (p.age.value > 80) {
        alert('The risk score is only valid for ages less than 80 years old.\n\nShowing results based on age of 80 years;');
        p.age.value = 80;
      }
      else if (p.age.value < 45) {
        alert('The risk score is only valid for ages above 44 years old.\n\nShowing results based on age of 45 years;');
        p.age.value = 45;
      }
      
      dfd.resolve();
    });
    
    return dfd.promise();
};

var get_labs = function() {
    var dfd = $.Deferred();
    
    SMART.get_lab_results().success(function(labs){
        labs.graph
            .where("?l rdf:type sp:LabResult")
            .where("?l sp:labName ?ln")
            .where("?ln sp:code <http://purl.bioontology.org/ontology/LNC/30522-7>")
            .where("?l sp:quantitativeResult ?qr") // predicate
            .where("?qr rdf:type sp:QuantitativeResult") // type
            .where("?qr sp:valueAndUnit ?vu")
            .where("?vu sp:value ?v")
            .each(function(){ p.hsCRP.value = Number(this.v.value); })

        labs.graph
            .where("?l rdf:type sp:LabResult")
            .where("?l sp:labName ?ln")
            .where("?ln sp:code <http://purl.bioontology.org/ontology/LNC/2093-3>")
            .where("?l sp:quantitativeResult ?qr")
            .where("?qr rdf:type sp:QuantitativeResult")
            .where("?qr sp:valueAndUnit ?vu")
            .where("?vu sp:value ?v")
            .each(function(){ p.cholesterol.value = Number(this.v.value); })

        labs.graph
            .where("?l rdf:type sp:LabResult")
            .where("?l sp:labName ?ln")
            .where("?ln sp:code <http://purl.bioontology.org/ontology/LNC/2085-9>")
            .where("?l sp:quantitativeResult ?qr")
            .where("?qr rdf:type sp:QuantitativeResult")
            .where("?qr sp:valueAndUnit ?vu")
            .where("?vu sp:value ?v")
            .each(function(){ p.HDL.value = Number(this.v.value); })
        
        // defaults for user-submitted values
        p.LDL = {'value': p.cholesterol.value - p.HDL.value}
        p.sbp = {'value': 120}
        p.smoker_p = {'value': false}
        p.fx_of_mi_p = {'value': false}
        
        dfd.resolve();
    });
    
    return dfd.promise();
};
