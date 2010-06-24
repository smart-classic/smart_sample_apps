/**
 * 
 * @param {Object} event
 */
__extend__(Envjs.defaultEventBehaviors,{

    'submit': function(event){
        var target = event.target;
        while(target.nodeName != 'FORM'){
            target = target.parentNode;
        }
        if(target.nodeName == 'FORM'){
            target.submit
        }   
    },
    'click': function(event){
        console.log('handling event target default behavior for click');
    }

});