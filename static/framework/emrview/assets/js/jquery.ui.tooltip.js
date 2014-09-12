/*
 * jQuery UI Tooltip @VERSION
 *
 * Copyright (c) 2011 Marcus Ekwall (http://writeless.se/projects/jquery-ui-tooltip)
 * Copyright (c) 2011 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://writeless.se/projects/jquery-ui-tooltip
 * http://docs.jquery.com/UI/Tooltip
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.position.js
 */
(function($) {

// role=application on body required for screenreaders to correctly interpret aria attributes
if( !$(document.body).is('[role]') ){
    $(document.body).attr('role','application');
} 

var increments = 0;

$.widget("ui.tooltip", {
    options: {
        tooltipClass: "ui-widget-content",
        content: function() {
            return $(this).attr("title");
        },
        duration: 0,
        position: "right",
        offset: 10,
        show: {
            effect: 'fade',
            options: {},
            speed: 500,
            callback: function(){}
        },
        hide: {
            effect: 'fade',
            options: {},
            speed: 500,
            callback: function(){}
        },
        sticky: false,
        trackMouse: false
    },
    trackMouse: false,
    _init: function() {
        var self = this;
        
        // check and parse inline options
        $.each(this.element[0].attributes, function(i,a){
            if (a.name == "tooltip") {
                var inlineOptions = a.value.split(',');
                $.each(inlineOptions, function(i,o){
                    var option = o.split(':'),
                        key = option[0].trim();
                        value = option[1].trim();
                    if (value == "true" || value == "false") {
                        value = (value === "true");
                    } else if (value.match(/\n+/)) {
                        value = parseFloat(value);
                    }
                    self.options[key] = value;
                });
            }
        });
        
        this.tooltip = $("<div></div>")
            .attr("id", "ui-tooltip-" + increments++)
            .attr("role", "tooltip")
            .attr("aria-hidden", "true")
            .addClass("ui-tooltip ui-widget ui-corner-all")
            .addClass(this.options.tooltipClass)
            .appendTo(document.body)
            .hide();
        this.tooltipContainer = $("<div></div>")
            .addClass("ui-tooltip-container")
            .appendTo(this.tooltip);
        this.tooltipContent = $("<div></div>")
            .addClass("ui-tooltip-content")
            .appendTo(this.tooltipContainer);
        this.opacity = this.tooltip.css("opacity");
        
        if (this.options.sticky) {
            this.element
                .bind("click.tooltip", function(event) {
                    self.open( event );
                });
                
            this.tooltipClose = $("<a/>")
                .attr("href", "#")
                .attr("role", "button")
                .addClass("ui-tooltip-close ui-corner-all")
                .hover(function(){
                    $(this).addClass("ui-state-hover");
                }, function(){
                    $(this).removeClass("ui-state-hover");
                })
                .click(function(event){
                    self.close( event );
                    return false;
                })
                .append(
                    $("<span></span>")
                        .addClass("ui-icon ui-icon-closethick")
                        .text("close")
                ).prependTo(this.tooltipContainer);
        } else {
            this.element
                .bind("focus.tooltip mouseenter.tooltip", function(event) {
                    self.open( event );
                })
                .bind("blur.tooltip mouseleave.tooltip", function(event) {
                    var e = event;
                    if (self.options.duration > 0) {
                        if (this.timeout) {
                            clearTimeout(self.timeout);
                        }
                        self.timeout = setTimeout(function(){
                                self.close( e );
                                self.timeout = null;
                            }, self.options.duration);
                    } else {
                        self.close( event );
                    }
                });
        }
    },
    
    enable: function() {
        this.options.disabled = false;
    },
    
    disable: function() {
        this.options.disabled = true;
    },
    
    destroy: function() {
        this.tooltip.remove();
        $.Widget.prototype.destroy.apply(this, arguments);
    },
    
    widget: function() {
        return this.tooltip;
    },
    
    open: function(event) {
        var target = this.element;
        // already visible? possible when both focus and mouseover events occur
        if (this.current && this.current[0] == target[0])
            return;
        var self = this;
        this.current = target;
        this.currentTitle = target.attr("title");
        
        if (typeof this.options.content == "function") {
            var content = this.options.content.call(target[0], function(response) {
                // ignore async responses that come in after the tooltip is already hidden
                if (self.current == target)
                    self._show(event, target, response);
            });
        } else {
            var content = this.options.content;
        }
        if (content) {
            self._show(event, target, content);
        }
    },
    
    _show: function(event, target, content) {
        if (!content)
            return;
        
        if (this.options.disabled)
            return;
            
        target.attr("title", "");
            
        this.tooltipContent.html(content);
        
        // adjust the z-index so we place new tooltips on top of the other
        var zIndex = this.tooltip.css("z-index")+$(".ui-tooltip").length;
        this.tooltip.css({
            top: 0,
            left: 0,
            zIndex: zIndex
        });

        // beware ugly positioning hack. has to be shown,
        // positioned and hidden again for animated showing or
        // else it will be positioned wrong
        switch (this.options.position) {
            case "right":
                this.tooltip.show().position({
                    my: "left center",
                    at: "right center",
                    of: target,
                    offset: this.options.offset+" 0"
                }).hide();
                
            break;
            case "left":
                this.tooltip.show().position({
                    my: "right center",
                    at: "left center",
                    of: target,
                    offset: -(this.options.offset)+" 0"
                }).hide();
            break;
            case "top":
                this.tooltip.show().position({
                    my: "center bottom",
                    at: "center top",
                    of: target,
                    offset: "0 "+(-this.options.offset)
                }).hide();
            break;
            case "bottom":
                this.tooltip.show().position({
                    my: "center top",
                    at: "center bottom",
                    of: target,
                    offset: "0 "+this.options.offset
                }).hide();
            break;
        }            
        target.attr("aria-describedby", this.tooltip.attr("id"));
        this.tooltip.attr("aria-hidden", "false");
        
        var self = this;
        
        // setup position and events to track mouse
        if (event.type != "focus" && this.options.trackMouse) {
            this.trackMouse = function(event){
                self.tooltip.position({
                    my: "left center",
                    at: "right center",
                    of: event,
                    offset: "10 10",
                    collision: "fit"
                });
            };
            $(document).mousemove(this.trackMouse).mousemove();
        };
        
        // bind keydown event to document to listen for esc key
        this.escPress = function(event) {
            if (event.which == 27) {
                self.close(event);
            }
        };
        $(document).bind("keydown", this.escPress);

        if (this.tooltip.is(":animated")) {
            this.tooltip.stop().show().fadeTo("normal", this.opacity);
        } else {
            if (!this.tooltip.is(":visible")) {
                this.tooltip.show(this.options.show.effect, this.options.show.options, this.options.show.speed, this.options.show.callback);
            }
        }
        
        this._trigger( "open", event );
    },
    
    close: function(event) {
        if (!this.current || this.options.disable) {
            return;
        }
        
        // restore title attribute to element
        var current = this.current.attr("title", this.currentTitle);
        this.current = null;
        
        // unbind mousemove event
        if (this.options.trackMouse) {
            $(document).unbind('mousemove', this.trackMouse);
        }
        
        // unbind keydown event
        if (this.options.escPress) {
            $(document).unbind("keydown", this.escPress);
        }
        
        // remove aria attributes
        current.removeAttr("aria-describedby");
        this.tooltip.attr("aria-hidden", "true");
        
        if (this.tooltip.is(":animated")) {
            this.tooltip.stop().fadeTo("normal", 0, function() {
                $(this).hide().css("opacity", "");
            });
        } else {
            if (this.tooltip.is(":visible")) {
                this.tooltip.hide(this.options.hide.effect, this.options.hide.options, this.options.hide.speed, this.options.hide.callback);
            }
        }
        
        this._trigger( "close", event );
    }
    
});

})(jQuery);