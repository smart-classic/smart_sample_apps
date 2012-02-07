/*
jQuery mouseyDialog Plugin
  * Version 1.0
  * 04-30-2010
  * URL: http://github.com/mdbiscan/mouseyDialog
  * Author: M.Biscan
  * requires jQuery1.4.2
  
  Copyright (c) 2010 M.Biscan

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function($){
  $.fn.mouseyDialog = function(options) { 
    var settings = $.extend({}, $.fn.mouseyDialog.defaults, options); 
    
    return this.each(function() {
      var $anchor = $(this),
	      //$dialog = $($anchor.attr('href'));
          $dialog = $("#" + $anchor.attr('id').substring(7,$anchor.attr('id').length));

		//alert ("#" + $anchor.attr('id').substring(4,$anchor.attr('id').length));
		//alert ($anchor.attr('href'));
		  
      if(settings.eventType == 'click') {
        var $closeButton = $('<a href="#" class="mouseyDialog_close">close</a>').appendTo($dialog);
      }

      ///////////
      // Setup //
      ///////////
      $dialog
        .hide()
        .css({position:'absolute', zIndex:settings.zIndex})
        .addClass('mouseyDialog')
        .appendTo('body');
      
      ////////////
      // Events //
      ////////////
      // Custom event
      $anchor.bind('toggleDialog', function(event, x, y) {
        if($dialog.hasClass('visible')) {
          closeDialog($dialog);
        } else {
          openDialog($dialog, x, y);
        }
      });
      
      var eventType = (settings.eventType == 'hover' ? 'mouseenter' : 'click');
      
      $anchor[eventType](function(event) {
            // Window
        var windowWidth = $(window).width(),
            windowHeight = $(window).height();
            // Screen
        var clientX = event.clientX, 
            clientY = event.clientY;
            // Dialog
        var dialogWidth = getDialogDimensions().width,
            dialogHeight = getDialogDimensions().height;
            // Mouse 
        var mouseX = event.pageX, 
            mouseY = event.pageY;
            // X, Y
        var x = mouseX+settings.addOffset,
            y = mouseY+settings.addOffset;
            
        if((dialogWidth + clientX) > windowWidth) {
          x = mouseX-settings.addOffset-((dialogWidth + clientX)-windowWidth);
        } 
        if((dialogHeight + clientY) > windowHeight) {
          y = mouseY-settings.addOffset-((dialogHeight + clientY)-windowHeight);
        }
        
        $(this).trigger('toggleDialog', [x, y]);
        
        var openDialog = $('.mouseyDialog.visible');
        if(openDialog.length == 1 && openDialog != $dialog) {
          closeDialog(openDialog);
        }
        return false;
      });
      
      if(settings.eventType == 'hover') {
        $anchor.click(function() {
		  //alert ('clicked');
          //return false;
        });
        $anchor.mouseleave(function() {
          setTimeout(function() {
            if(!$dialog.hasClass('hover')) {
              closeDialog($dialog);
            }
          }, 150);
        });
        $dialog.hover(
          function() {
            $(this).addClass('hover');
          }, 
          function() {
            $(this).removeClass('hover');
            closeDialog(this);
          }
        );
      } else {
        $closeButton.click(function() {
          $anchor.trigger('toggleDialog');
          return false; 
        });

        // Prevents the dialog from being closed when clicking inside it
        $dialog.click(function(event) {
          event.stopPropagation();
        });
        // Closes the dialog when clicking outside of it
        $(document).click(function(event) {
          if(event.target != this) {
            if($dialog.hasClass('visible')) {
              closeDialog($dialog);
            }
          } 
        });
      }
      
      ///////////////////////
      // Private functions //
      ///////////////////////
      function getDialogDimensions() {
        $dialog.show();
        
        var height = $dialog.innerHeight(),
            width = $dialog.innerWidth();
        
        $dialog.hide();
        
        return {height:height, width:width};
      };
      
      function openDialog(dialog, x, y) {
        var animation = (settings.animation == 'slide' ? 'slideDown' : 'fadeIn');

        $(dialog).css({top:y, left:x})[animation](settings.animationSpeed, function() {
          $(this).addClass('visible');
        });
      };

      function closeDialog(dialog) {
        var animation = (settings.animation == 'slide' ? 'slideUp' : 'fadeOut');

        $(dialog)[animation](settings.animationSpeed, function() {
          $(this).removeClass('visible');
        });
      };
    });
  };

  ////////////////////
  // Default optons //
  ////////////////////
  $.fn.mouseyDialog.defaults = {
    zIndex:100,
    eventType:'click',
    addOffset:10,
    animation:'fade',
    animationSpeed:250
  };
})(jQuery);