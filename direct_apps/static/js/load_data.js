// SMART Direct Library with asynchronous Ajax call wrappers
//
// Author: Nikolai Schwertner
//
// Revision history:
//     2011-10-04 Initial release

// Direct App global object
var DIRECT = {
        patient: {firstname: "", lastname: "", gender: "", birthday: "", meds:[], problems: []},
        sender: {name: "", email: ""},
        recepients: [],
        apps: {}
    };

// Load the demographics into the global object
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
    ).error(function() { 
        console.error("loadDemographics failed");
        dfd.reject();
    });
    return dfd.promise();
};

// Load the user data into the global object
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
    ).error(function() { 
        console.error("loadUser failed");
        dfd.reject();
    });
    return dfd.promise();
};

// Load the recepients data into the global object
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
    ).error(function() { 
        console.error("loadRecepients failed");
        dfd.reject();
    });
    return dfd.promise();
};

// Load the available SMART apps data into the global object
// (secondary feature: display the apps in a table on the page)
DIRECT.loadApps = function () {   
    var dfd = $.Deferred();
    $.get(  
        "getapps",  
        {'oauth_header':SMART.credentials.oauth_header},  
        function(responseText){
            var out = "<table><tr>";
            DIRECT.apps = JSON.parse(responseText);
            
            
            for (var i = 0; i < DIRECT.apps.length; i++) {      
                if (i > 0 && i % 6 == 0) {
                    out += "</tr><tr>";
                }
                out += "<td><input type='checkbox' id='app-" + i + "'></td>";
                out += "<td valign='middle'><img src='" 
                         + DIRECT.apps[i]["icon"] +"'><br/>" 
                         + DIRECT.apps[i]["name"] + "</td>";
            }
            
            out += "</tr></table>";     

            $('#apps').html(out);
            dfd.resolve();
        },
        "html"  
    ).error(function() { 
        console.error("loadApps failed");
        dfd.reject();
    });
    return dfd.promise();
};

// Load the medications data into the global object
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
    ).error(function() { 
        console.error("loadMeds failed");
        dfd.reject();
    });
    return dfd.promise();
};

// Load the problems data into the global object
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
    ).error(function() { 
        console.error("loadProblems failed");
        dfd.reject();
    });
    return dfd.promise();
};