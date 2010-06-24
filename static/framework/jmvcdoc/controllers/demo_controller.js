/**
 * @tag home
 * 
 * Handles @demo logic
 */
jQuery.Controller.extend('DemoController',
/* @Static */
{ 
},
/* @Prototype */
{
    init : function() {
        var self = this;
        var height = 320, html = "", source = "", standbySource;

        hljs.start();
        
        this.element.html( this.view("//jmvcdoc/views/demo/init.ejs"));

        var demoSrc = this.element.attr("data-demo-src");
        var $iframe = this.find("iframe");
		$iframe.attr("src", demoSrc);
		
        $iframe.bind("load", function(){
            var $body = $( this.contentWindow.document.body );

            self.find(".demo_content").css({"padding":"5px"});
            
            html = this.contentWindow.DEMO_HTML || $body.find("#demo-html").html();
            self.find(".html_content")
              .html( "<pre><code class=\"html\"></code></pre>" )
              .find("code").text( $.trim(html) ).highlight();
              
            source = $body.find("#demo-source").html();
            self.find(".source_content")
              .html( "<pre><code class=\"javascript\"></code></pre>" )
              .find("code").text( $.trim(source) ).highlight();
			  
            // save second script(to show when we can't find #demo-source
			if(!source) {
				$('script', $iframe[0].contentWindow.document).each(function(i, script){
                    if (!script.text.match(/steal.end()/)) {
						standbySource = script.text;
						// break if it's not steal.js
						if( !script.src.match(/steal.js/) ) return false;
					}
                });
				
	            self.find(".source_content")
	              .html( "<pre><code class=\"javascript\"></code></pre>" )
	              .find("code").text( $.trim(standbySource) ).highlight();				 
			}

            height = $body.outerHeight();
            $iframe.height( height + 50 );
            self.find(".demo_content").height( height + 55 );
        })
    },
        
    ".header click" : function(el, ev) {
        el.next().toggle("slow")
        el.find("span").toggleClass("ui-icon-triangle-1-s").toggleClass("ui-icon-triangle-1-e");
    }});