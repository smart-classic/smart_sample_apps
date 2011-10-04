var DIRECT = {
        patient: {firstname: "", lastname: "", gender: "", birthday: "", meds:[], problems: []},
        sender: {name: "", email: ""},
        recepients: [],
        apps: {}
    };

DIRECT.loadDemographics = function () {
    var dfd = $.Deferred();
    $.get(  
        "getdemographics",  
        {'oauth_header':SMART.credentials.oauth_header},
        function(responseText){
            var data = JSON.parse(responseText);
            DIRECT.patient.firstname = data.firstname;
            DIRECT.patient.lastname = data.lastname;
            DIRECT.patient.gender = data.gender;
            DIRECT.patient.birthday = data.birthday;
            dfd.resolve();
        },
        "html"
    );
    return dfd.promise();
};
 
DIRECT.loadUser = function () {
    var dfd = $.Deferred();
    $.get(  
        "getuser",  
        {'oauth_header':SMART.credentials.oauth_header},
        function(responseText){
            var data = JSON.parse(responseText);
            DIRECT.sender.name = data.name;
            DIRECT.sender.email = data.email;
            dfd.resolve();
        },  
        "html"
    );
    return dfd.promise();
};

DIRECT.loadRecepients = function () {
    var dfd = $.Deferred(); 
    $.get(  
        "getrecepients",  
        {'oauth_header':SMART.credentials.oauth_header},  
        function(responseText){
            var data = JSON.parse(responseText);
            for (var i = 0; i < data.length; i++) {
                DIRECT.recepients.push(data[i].email);
            }
            $( "#address" ).autocomplete({
                source: DIRECT.recepients
            });
            dfd.resolve();
        },  
        "html"  
    );
    return dfd.promise();
};

DIRECT.loadApps = function () {   
    var dfd = $.Deferred();
    $.get(  
        "getapps",  
        {'oauth_header':SMART.credentials.oauth_header},  
        function(responseText){
            var out = "<table><tr>";
            DIRECT.apps = JSON.parse(responseText);
            
            
            for (var i = 0; i < DIRECT.apps["apps"].length; i++) {                
                out += "<td><input type='checkbox' id='app-" + i + "'></td>";
                out += "<td valign='middle'><img src='" 
                         + DIRECT.apps["apps"][i]["icon"] +"'> " 
                         + DIRECT.apps["apps"][i]["name"] + "</td>";
            }
            
            out += "</tr></table>";     

            $('#apps').html(out);
            dfd.resolve();
        },
        "html"  
    );
    return dfd.promise();
};

DIRECT.loadMeds = function () {
    var dfd = $.Deferred();
    $.get(  
        "getmeds",  
        {'oauth_header':SMART.credentials.oauth_header},  
        function(responseText){
            var data = JSON.parse(responseText);
            DIRECT.patient.meds = [];
            for (var i = 0; i < data.length; i++) {
                DIRECT.patient.meds.push(data[i].drug);
            }
            DIRECT.patient.meds.sort();
            dfd.resolve();
        },
        "html"  
    );
    return dfd.promise();
};

DIRECT.loadProblems = function () {
    var dfd = $.Deferred();  
    $.get(  
        "getproblems",  
        {'oauth_header':SMART.credentials.oauth_header},  
        function(responseText){
            var data = JSON.parse(responseText);
            DIRECT.patient.problems = [];
            for (var i = 0; i < data.length; i++) {
                DIRECT.patient.problems.push({problem:data[i].problem,date:data[i].date});
            }
            DIRECT.patient.problems.sort(function sortNumber(a,b) {return a.date < b.date;});
            dfd.resolve();
        },
        "html"  
    );
    return dfd.promise();
};