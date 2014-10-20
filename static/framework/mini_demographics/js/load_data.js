var get_demographics = function() {
    var dfd = $.Deferred();
    var patient_name = document.getElementById("pat_name");
    var patient_id = document.getElementById("pat-id");
    var patient_gender = document.getElementById("pat-gender");
    var patient_bday = document.getElementById("pat-bday");
    var patient_race = document.getElementById("pat-race");
    var patient_ages = document.getElementById("pat-age");
	var patient_age;    
    SMART.get_demographics().success(function(demos) {
     
		 var person = demos.graph
		 .where("?d rdf:type sp:Demographics")
		 .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
		 .prefix('v', 'http://www.w3.org/2006/vcard/ns#')
		 .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
		 .prefix('sp', 'http://smartplatforms.org/terms#')
		 .prefix('dcterms', 'http://purl.org/dc/terms/')
		 .where("?d v:n ?n")
		 .where("?n v:given-name ?givenname")
		 .where("?n v:family-name ?familyname")
		 .where("?d foaf:gender ?gender")
		 .where("?d v:bday ?bday")
		 .where("?d sp:medicalRecordNumber ?mrn")
		 .where("?mrn dcterms:identifier ?mrntitle")
		 .optional("?d sp:race ?race").each(function() {
	
			 //alert(this.bday.value.substring(0,4)+ " " +this.bday.value.substring(5,7)+ " " +this.bday.value.substring(8,10));
			 patient_age = calculate_age(this.bday.value.substring(0,4),this.bday.value.substring(5,7),this.bday.value.substring(8,10));
		
		     patient_name.innerHTML = capitalize(this.givenname.value) + ' ' + capitalize(this.familyname.value);
		     patient_id.innerHTML = 'Num: ' + this.mrntitle.value;
			 patient_gender.innerHTML = 'Sex: ' + capitalize(this.gender.value);
			 patient_bday.innerHTML = 'Birth Date: ' + this.bday.value;
			 patient_ages.innerHTML = 'Age: ' + patient_age + ' years (current)';
		
			 if(this.race !== undefined){
			    patient_race.innerHTML = 'Race: ' + capitalize(this.race.value);
			 }
		
		});
      
    	dfd.resolve();
    });
    
    return dfd.promise();
};

var get_photograph = function() {
    var dfd = $.Deferred();
    
	SMART.get_photograph().success(function(photo){
	
		console.log(photo);
		var photograph = photo.graph.where("?p rdf:type sp:Document")
		.prefix('foaf', 'http://xmlns.com/foaf/0.1/')
		.prefix('v', 'http://www.w3.org/2006/vcard/ns#')
		.prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
		.prefix('sp', 'http://smartplatforms.org/terms#')
		.prefix('dcterms', 'http://purl.org/dc/terms/')
		.where("?p dcterms:title ?titles")
		.where("?p dcterms:format ?format")
		//.where("?f rdfs:label ?labels")
		.where("?p sp:resource ?r")
		.where("?r sp:content ?c")
		.where("?c sp:encoding ?encode")
		.where("?c sp:value ?content")
		.each(function(){
			if ($("#pat-id").text() != null) {
				document.getElementById("pat-photo").alt = this.titles.value;
				var get_pat_photo = "data:"+ this.format.value+ ";"+ this.encode.value+ "," + this.content.value;
				alert(get_pat_photo);
				if (this.content.value != null) {
					document.getElementById("pat-photo").src = get_pat_photo;
					document.getElementById("pat-photo-url").href = get_pat_photo;
				}			
				
			}
			//document.getElementById("pat-photo").style.display = "block";
		});
        
        dfd.resolve();
    });
    
    return dfd.promise();
};