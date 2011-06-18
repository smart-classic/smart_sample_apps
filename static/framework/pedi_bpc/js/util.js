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
               var dp = new Date(); 
               dp.setFullYear(d[0], d[1], d[2]);
            }
	    return dp;
	};