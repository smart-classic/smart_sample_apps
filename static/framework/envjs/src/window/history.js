
/*
*	history.js
*
*/

History = function(owner){
	var $current = 0,
        $history = [null],
        $owner = owner;
	
    return {
		get length(){ 
            return $history.length;
        },
		back : function(count){
			if(count){
				go(-count);
			}else{
                go(-1);
            }
		},
        get current(){
            return this.item($current);
        },
        get previous(){
            return this.item($current-1);
        },
		forward : function(count){
			if(count){
				go(count);
			}else{go(1);}
		},
		go : function(target){
			if(typeof target == "number"){
				target = $current + target;
				if(target > -1 && target < $history.length){
					if($history[target].type == "hash"){
                        if($owner.location){
						    $owner.location.hash = $history[target].value;
                        }
					}else{
                        if($owner.location){
						    $owner.location = $history[target].value;
                        }
					}
					$current = target;
				}
			}else{
				//TODO: walk through the history and find the 'best match'?
			}
		},
        item: function(index){
            if(index < history.length)
                return $history[index];
            else
                return null;
        },
        
        add: function(newLocation, type){
            //not a standard interface, we expose it to simplify 
            //history state modifications
            if(newLocation !== $history[$current]){
                $history.slice(0, $current);
                $history.push({
                    type: type||"href",
                    value: value
                });
            }
        }
	};
};


	