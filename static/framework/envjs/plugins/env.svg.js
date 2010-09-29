/**
 * @author thatcher
 */
load('dist/env.rhino.js');
load('plugins/jquery.js');
load('plugins/vendor/raphael.js');
load('plugins/vendor/g.raphael-min.js');
load('plugins/vendor/g.pie-min.js');

/*
// Creates canvas 320 × 200 at 10, 50
var paper = Raphael(10, 50, 320, 200);

// Creates circle at x = 50, y = 40, with radius 10
var circle = paper.circle(50, 40, 10);
// Sets the fill attribute of the circle to red (#f00)
circle.attr("fill", "#f00");

// Sets the stroke attribute of the circle to white
circle.attr("stroke", "#fff");
*/

// Creates canvas 640 × 480 at 10, 50
var r = Raphael(10, 50, 640, 480);

// Creates pie chart at with center at 320, 200,
// radius 100 and data: [55, 20, 13, 32, 5, 1, 2]
r.g.piechart(320, 240, 100, [55, 20, 13, 32, 5, 1, 2]);

Envjs.writeToFile(document.body.innerHTML, Envjs.uri('reports/svg.html'));


/** if you want to render the svg to an image file use:

 > java -cp rhino/js.jar:`ls -1 rhino/svg/*.jar|sed 's/\(.\)$/\1:/'|tr -d '\n'` \
		org.mozilla.javascript.tools.shell.Main -opt -1 plugins/env.svg.js
		
 */
//Envjs.renderSVG(document.body.innerHTML, Envjs.uri('reports/svg.jpg'));