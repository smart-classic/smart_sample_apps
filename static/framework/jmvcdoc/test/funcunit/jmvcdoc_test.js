module("jmvcdoc")


test("jmvcdoc testing works", function(){

        S.open("file:/C:/Users/Jupiter/development/framework/jmvcdoc/jmvcdoc.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})