/**
 * @tag home
 * 
 * Runs the documentation
 */
jQuery.Controller.extend('DocumentationController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
     /**
      * Keeps track of who is selected
      */
     init : function(){
        this.selected = [];
     },
     /**
      * Searches with the current value in #search or searches for 'home'
      */
     searchCurrent : function(){
         this.search( $('#search').val() || "" );
     },
     /**
      * Searches for a value and puts results on the left hand side
      * @param {Object} val
      */
     search : function(val){
        var list = Search.find(val);
        this.selected = [];
        $("#left").html("//jmvcdoc/views/results.ejs", 
                         {list: list, selected: this.selected, hide: false},
                         DocumentationController.Helpers)
     },
     showDoc : function(docData){
         $("#doc").html("//jmvcdoc/views/"+docData.shortName.toLowerCase()+".ejs",
                             docData,
                           DocumentationController.Helpers
                        ).find("h1.addFavorite").
                            append('&nbsp;<span class="favorite favorite'+ (docData.isFavorite? 'on' : 'off')+'">&nbsp;&nbsp;&nbsp;</span>') ;
         //setTimeout(function(){
             $("#doc_container").scrollTop(0)
         //},100);
         $("#doc code").highlight();
         //check for api
         if($("#api").length){
             var names = [];
             for(var name in Search._data.list){
                 names.push(name)
             }
             $("#api").html(  
                 DocumentationController.Helpers.link("["+names.sort(Search.sortJustStrings).join("]<br/>[")+"]" , true )   
             )
         }
         
		 
	 	 // cleanup iframe menu when navigating to another page
	 	 if($(".iframe_menu_wrapper").length) $(".iframe_menu_wrapper").remove();
		 
		 // hookup iframe ui
		 var $iframe_wrapper = $(".iframe_wrapper");
         if ($iframe_wrapper.length) $iframe_wrapper.iframe();		 
		 
		 // hookup demo ui
		 var $demo_wrapper = $(".demo_wrapper");
         if ($demo_wrapper.length) $demo_wrapper.demo();
     },
          
     showResultsAndDoc : function(searchResultsData, docData){
         $("#left").html("//jmvcdoc/views/results.ejs",
                                     searchResultsData,
                                      DocumentationController.Helpers)
         $("#results").slideDown("fast",function(){$('#results a:first')[0].focus()});
         this.showDoc(docData)
     },
     show : function(who, data){
        this.who = {name: data.name, shortName: data.shortName, tag: data.name};
        data.isFavorite = Favorites.isFavorite(data);
        if(data.children && data.children.length){ //we have a class or constructor
            this.selected.push(data);
            var list = $.makeArray(data.children).sort(Search.sortFn)
            var self = this;
            var results = $("#results");
            if(results.length){
                $("#results").slideUp("fast",
                    this.callback(  "showResultsAndDoc",
                                    {list: list, selected: this.selected, hide: true}, 
                                    data));
            }else{
                this.showResultsAndDoc({list: list, selected: this.selected, hide: true}, data)
            }
        }else{ //we have a function or attribute
            //see if we can pick it
            if($("#results a").length == 0){
                //we should probably try to get first parent as result, but whatever ...
                $("#left").html("//jmvcdoc/views/results.ejs",
                                     {list: Search.find(""), selected: this.selected, hide: false},
                                     DocumentationController.Helpers)
            }
            $(".result").removeClass("picked")
            $(".result[href=#&who="+who+"]").addClass("picked").focus()
            this.showDoc(data)

        }
            
    },
    //event handlers
    "#search focus" : function(el, ev){
        $('#results a:first').addClass("highlight");
    },
    "#search blur" : function(el, ev){
        $('#results a:first').removeClass("highlight");
    },
    "#search keyup" : function(el, ev){
        if(ev.keyCode == 40){ //down
            $('#results a:first').removeClass("highlight")
            $('#results a:nth-child(2)')[0].focus();
        }
        else if(ev.keyCode == 13){
            window.location.hash = $('#results a:first').attr("href")
        }
        else{
            if(this.skipSet){
                this.skipSet = false;
                return 
            }
            window.location.hash = "#"
            this.search(el.val());
            $('#results a:first').addClass("highlight");
        }
            
    },
    "#results a focus" : function(el){ 
        el.addClass("highlight")//css("backgroundColor","#4B4C3F")
    },
    "#results a blur" : function(el){ 
        el.removeClass("highlight")//el.css("backgroundColor","")
    },
    "#results a mouseover" : function(el){ 
        el.addClass("highlight")//css("backgroundColor","#4B4C3F")
    },
    "#results a mouseout" : function(el){ 
        el.removeClass("highlight")//el.css("backgroundColor","")
    },
    "#results a keyup" : function(el,ev){ 
        if(ev.keyCode == 40){ //down
            var n = el.next();
            if(n.length) n[0].focus();
            ev.preventDefault();
        }  
        else if(ev.keyCode == 38){ //up
            var p = el.prev(), p2 = p.prev()
            if(p2.length)
                p[0].focus()
            else{
                this.skipSet = true;
                $("#search")[0].focus();
                //this.highlightFirst();
            }  
            ev.preventDefault();
        }
    },
    ".remove click" : function(el, ev){
        ev.stopImmediatePropagation();
        this.selected.pop();
        //fire to history
        if(this.selected.length){
            var who = this.selected.pop().name;
            $("#results").slideUp("fast", function(){
                window.location.hash = "#&who="+who;
            })
            
            ///$.get("docs/classes/"+who+".json", {},this.callback('show', who),'json');
        }else{
            var self = this;
            $("#results").slideUp("fast", function(){
                window.location.hash = "#"
            })
        }
    },
    ".favorite click" : function(el){
        var isFavorite = Favorites.toggle(this.who)
        if(isFavorite){
            el.removeClass("favoriteoff")
            el.addClass("favoriteon")
        }else{
            el.removeClass("favoriteon")
            el.addClass("favoriteoff")
        }
    },
    "history.favorites.index subscribe" : function(called, data){
        this.selected = [];
        $("#search").val("favorites")
        var list = Favorites.findAll();
        $("#left").html("//jmvcdoc/views/results.ejs",
                                     {list: list, selected: this.selected, hide: false},
                                     DocumentationController.Helpers)
        if(!list.length)
            $('#doc').html("//jmvcdoc/views/favorite.ejs",{})
    },

    ready : function(){
        /*$("#menu").phui_menuable().find("ul").phui_menuable().hide()
            .bind("show", function(){
                $(this).show(function(){
                    $(this).trigger("show:after")
                });
            })
            .bind("hide", function(){
                $(this).hide(function(){
                    $(this).trigger("hide:after")
                });
            });
        $("#menu").find("a").click(function(){
            $(this).closest("li").trigger("activate")
        });
        
        $("#menu").find("a").focus(function(){
            $(this).closest("li").trigger("select")
        });
        $("#menu").find("a").keypress(function(ev){
            if(ev.keyCode == 13 || ev.keyCode == 10)
                $(this).closest("li").trigger("activate")
        });*/        

        var self = this;
        this.find("#documentation").phui_filler({parent: $(window)});
        this.find("#bottom").phui_filler();
        this.find("#bottom").bind("resize", function(){
            var h = $(this).height();
            self.find("#left").height(h);
            self.find("#doc_container").height(h);    
        });    
        
        this.loaded = true;
        hljs.start();
        this.loadText = $("#search").val();
        
        $("#search").val("Loading ...")
		Search.load(this.callback('setSearchReady'));
    },
    setSearchReady : function(){
        this.searchReady = true;
        //do what you would normally do
        $("#search").attr('disabled', false)

        $("#search").val(this.loadText).focus();
		if(this.loadHistoryData){
			//need a timeout to allow reset of C function
			//by jQuery
			var self= this;
			setTimeout(function(){
				self.handleHistoryChange(self.loadHistoryData);
			},1)
		}        

    },
    
    handleHistoryChange : function(data){

		if(data.search){
            $("#search").val(data.search);
            this.searchCurrent();
            if(!data.who) return;
        }
        if(!data.who){
            this.searchCurrent();
            
            if(this.who) return;
            
            data.who = "index"
        }
        var who = data.who;
        //might need to remove everyone under you from selected
        for(var i =0; i < this.selected.length; i++){
            if(this.selected[i].name == who){
                this.selected.splice(i,this.selected.length - i)
                break;
            }
        }

        $.ajax({
            url: DOCS_LOCATION + who.replace(/ /g, "_").replace(/&#46;/g, ".") + ".json",
            success: this.callback('show', who),
            error: this.callback('whoNotFound', who),
            jsonpCallback: "C",
            dataType: "jsonp"
        });
    },

	/**
	 * A history event.  Only want to act if search data is available.
	 */
	"history.index subscribe" : function(called, data){
		
		if(!this.searchReady){ //if search is not ready .. wait until it is
			this.loadHistoryData = data;
            return;
        }
        this.handleHistoryChange(data)
    },
    whoNotFound : function(who) {
        var parts = who.split(".");
        parts.pop();
        if(parts.length) {
            who = parts.join(".");
            $.ajax({
                url: DOCS_LOCATION + who.replace(/ /g, "_").replace(/&#46;/g, ".") + ".json",
                success: this.callback('show', who),
                error: this.callback('whoNotFound', who),
                jsonpCallback: "C",
                dataType: "jsonp"
            });            
        }
    } 
    
}
);
var orderedParams = function(params){
    var ordered = [];
    for(var name in params){
        ordered[params[name].order] = params[name]
    }
    return ordered;
}

DocumentationController.Helpers = {
    previousIndent: 0,
    calculateDisplay : function(previous, current){

        var t = current.split(/\./)
        var p = previous.split(/\./);
        var left_res = [], right_res = []
        for(var j = 0; j < t.length; j++){
            if(p[j] && p[j] ==  t[j])
                left_res.push(t[j])
            else{
                //put everything else in right res
                right_res = t.slice(j);
                break;
            }
        }
        if(left_res.length == 1 && (left_res[0] == "jQuery" || left_res[0] == "steal"))
            return {
                length : 1 , name: current
            }
        
        if(this.indentAdjust === undefined) this.indentAdjust =  !!(left_res.length) ? 0 : 1;
        var newIndent = left_res.length < 2 ? left_res.length + this.indentAdjust : left_res.length;
        
        return  {
            length: newIndent, name: right_res.join(".")
        }
    },
    linkTags : function(tags){
        var res = [];
        for(var i =0; i < tags.length; i++)
            res.push( "<a href='#&search="+tags[i]+"'>"+tags[i]+"</a>"   )
        return res.join(" ");
    },
    linkOpen : function(addr){
        return "<a href='#&who="+addr+"'>"+addr+"</a>"  
    },
    signiture : function(){
        var res = [], name = this._data.name;
        //we should check if prototype or static is available
        
        name = name.replace("jQuery.","$.")
        
        var stat = name.lastIndexOf('.static.')
        var prto = name.lastIndexOf('.prototype.')
        if(stat != -1){
            name = name.substring(0,stat)+"."+name.substring(stat+8);
        }else if(prto != -1){
            name = jQuery.String.underscore(name.substring(0,prto).replace("$.",""))
                    +"."+name.substring(prto+11);
        }
        
       if(this._data.shortName == "constructor") name = "new "+name;
        
        var ordered = orderedParams(this._data.params);
        for(var n = 0; n < ordered.length; n++){
            res.push(ordered[n].name)
        }
        
        
        return name+"("+res.join(", ")+") -> "+this._data.ret.type;
    },
    link : function(content, dontReplace){
        return content.replace(/\[\s*((?:['"][^"']*["'])|[^\|\]\s]*)\s*\|?\s*([^\]]*)\s*\]/g, function(match, first, n){
            //need to get last
            //need to remove trailing whitespace
            if(/^["']/.test(first)){
                first = first.substr(1, first.length-2)
            }
            var url = Search._data.list[first] ? first : null;
            if(url){
                if(!n){
                    n = dontReplace ? first : first.replace(/\.prototype|\.static/,"")
                }
                return "<a href='#&who="+url+"'>"+n+"</a>"
            }else if(typeof first == 'string' && first.match(/^https?|www\.|#/)){
                return "<a href='"+first+"'>"+(n || first)+"</a>"
            }
            return  match;
        })
    },
	
	shortenUrl : function(url) {
		url = url.href ? url.href : url;
        var parts = url.match(/(https?:\/\/|file:\/\/)[^\/]*\/(.*)/);
		return url = parts[2] ? parts[2] : url;
	}
}

$.fn.highlight = function(){
    this.each(function(){
        hljs.highlightBlock(this)
    })
    return this;
}
