// JS by: Josh Mandel

var years_apart = function(d1, d2) {
 //console.log("NEWD");
 //console.log(parse_date(d1));
 //console.log(parse_date(d2).getTime());
    var res = (parse_date(d1).getTime()-parse_date(d2).getTime())/ (1000 * 60 * 60 * 24 * 365); 
    //console.log (d1 + " : " + d2 + " -> " +  res);
    return res;
};
        
    var parse_date = function(d) {
            var dp = new Date(d);
            if (isNaN(dp)) { // IE Date constructor doesn't parse ISO-8601 -JCM
               d = d.split("-");
               d[2] = (d[2].split("T"))[0];
               dp = new Date();
               // The month is indexed from 0 based on the Java Script specifications 
               // for the setFullYear method while the day is indexed from 1
               // (Does not make sense, but it is what it is!). So we substract 1
               // from the month to confirm to this spec.
               dp.setFullYear(d[0], d[1]-1, d[2]);
            }
        return dp;
    };