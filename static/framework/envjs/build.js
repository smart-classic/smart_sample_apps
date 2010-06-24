load('steal/file/file.js');

if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1)
	runCommand("cmd", "/C", "cd envjs && ant")
else
	runCommand("sh", "-c", "cd envjs && ant")
var env = readFile("envjs/dist/env.rhino.js");
new steal.File("steal/rhino/env.js").save(env);  