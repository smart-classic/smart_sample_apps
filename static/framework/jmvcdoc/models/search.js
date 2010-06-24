$.Class.extend('Search',
{
    load : function(callback){
        
		$.ajax({
			url: DOCS_LOCATION + "searchData.json",
			success: this.callback(['setData', callback]),
			jsonpCallback: "C",
			dataType: "jsonp"
		})
		
		/**$.jsonp({
			url: DOCS_LOCATION + "searchData.json",
			success: this.callback(['setData', callback])
		});**/
    },
    setData : function(data){
		this._data = data;
        return arguments;
    },
    find: function(val){
        var valWasEmpty, level = 2;
        var val = val.toLowerCase();
        
        if (!val || val === "*") {
			val = "home"; // return the core stuff
			valWasEmpty = true;
		}
        
        if(val == "favorites")
			return Favorites.findAll()
        
        var current = this._data;
        for(var i =0; i < level; i++){
            if(val.length <= i || !current) break;
            var letter = val.substring(i, i+1);
            current = current[letter];
        }
        var list = [];
        if(current && val.length > level){
            //make sure everything in current is ok
            var lookedup = this.lookup(current.list);
            for(var i =0; i < lookedup.length; i++){
                if(this.matches(lookedup[i],val, valWasEmpty) ) 
                    list.push(lookedup[i])
            }
        }else if(current){
            list = this.lookup(current.list);
        }
		return list.sort(this.sortFn);
    },
    matches : function(who, val, valWasEmpty){
        if(!valWasEmpty && who.name.toLowerCase().indexOf(val) > -1) return true;
        if(who.tags){
            for(var t=0; t< who.tags.length; t++){
                 if(who.tags[t].toLowerCase().indexOf(val) > -1) return true;
            }
        }
        return false;
    },
    sortFn :  function(a, b){
		//if equal, then prototype, prototype properties go first
        var aname = (a.title? a.title : a.name).replace(".prototype",".000AAAprototype").replace(".static",".111BBBstatic");
		var bname = (b.title? b.title : b.name).replace(".prototype",".000AAAprototype").replace(".static",".111BBBstatic");
		 
		
		if(aname < bname) 
			return -1
		else aname > bname
			return 1
		return 0;
	},
    sortJustStrings : function(aname, bname){
        var aname = aname.replace(".prototype",".000AAAprototype").replace(".static",".111BBBstatic");
		var bname = bname.replace(".prototype",".000AAAprototype").replace(".static",".111BBBstatic");
		 
		
		if(aname < bname) 
			return -1
		else aname > bname
			return 1
		return 0;
    },
    lookup : function(names){
        var res = [];
        for(var i =0; i < names.length; i++){
            res.push( this._data.list[names[i]]  )
        }
        return res;
    }
},
{}
)