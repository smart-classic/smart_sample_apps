load('steal/rhino/steal.js')

if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1)
	runCommand("cmd", "/C", "cd envjs && ant")
else
	runCommand("sh", "-c", "cd envjs && ant")
var env = readFile("envjs/dist/env.rhino.js");
new steal.File("envjs/dist/env.rhino.js").copyTo("steal/rhino/env.js", [])
new steal.File("envjs/dist/env.rhino.js").copyTo("funcunit/dist/selenium/env.js", [])