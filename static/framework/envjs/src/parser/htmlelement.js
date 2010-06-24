
__extend__(HTMLElement.prototype,{
    set innerHTML(html){
        HTMLParser.parseFragment(html, this);
    }
});
