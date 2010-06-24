
/*
* HTMLCollection - DOM Level 2
* Implementation Provided by Steven Wood
*/
HTMLCollection = function(nodelist, type){

    __setArray__(this, []);
    for (var i=0; i<nodelist.length; i++) {
        this[i] = nodelist[i];
        if('name' in nodelist[i]){
            this[nodelist[i].name] = nodelist[i];
        }
    }
    
    this.length = nodelist.length;

}

HTMLCollection.prototype = {
        
    item : function (idx) {
        var ret = null;
        if ((idx >= 0) && (idx < this.length)) { 
            ret = this[idx];                    
        }
    
        return ret;   
    },
    
    namedItem : function (name) {
        if(name in this){
            return this[name];
        }
        return null;
    }
};




	