window.addEventListener("load",function(){
  print("\n\nTesting with " + whichInterpreter);
  print("Handling onload for test.js");
  print("Loading tests.");

  load(
      "test/unit/dom.js",
      "test/unit/window.js",
      "test/unit/elementmembers.js"
  );
  if (multiwindow)
    load(
      "test/unit/onload.js",
      "test/unit/scope.js",   // must come before iframe.js changes page content
      "test/unit/iframe.js",
      "test/unit/events.js",
      "test/unit/multi-window.js"
    );
  load(
      "test/unit/parser.js",
      "test/unit/timer.js"
  );
  print("Load complete. Running tests.");
});

window.location = "test/index.html";
