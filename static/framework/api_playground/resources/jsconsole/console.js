(function (window) {

function sortci(a, b) {
  return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
}

function cleanse(s) {
  return (s||'').replace(/[<&]/g, function (m) { return {'&':'&amp;','<':'&lt;'}[m];});
}

function run(cmd) {
  var rawoutput = null, 
      className = 'response',
      internalCmd = internalCommand(cmd);
  
  if (internalCmd) {
    return ['info', internalCmd];
  } else if (remoteId !== null) {
    // send the remote event
    var xhr = new XMLHttpRequest(),
        params = 'data=' + encodeURIComponent(cmd);

    xhr.open('POST', '/remote/' + remoteId + '/run', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
	setCursorTo('');
    return ['info', 'sent remote command'];
  } else {
    try {
	rawoutput = eval(cmd); //sandboxframe.contentWindow.eval(cmd);
    } catch (e) {
      rawoutput = e.message;
      className = 'error';
    }

      return [className, cleanse(JSON.stringify(rawoutput))]
  } 
}

function post(cmd, blind, response /* passed in when echoing from remote console */) {
  cmd = trim(cmd);

  if (blind === undefined) {
    history.push(cmd);
    setHistory(history);

    if (historySupported) {
//      window.history.pushState(cmd, cmd, '?' + encodeURIComponent(cmd));
    }
  } 

  if (!remoteId || response) echo(cmd);

  // order so it appears at the top
  var el = document.createElement('div'),
      li = document.createElement('li'),
      span = document.createElement('span'),
      parent = output.parentNode;

  response = response || run(cmd);

  if (response !== undefined) {
    el.className = 'response';
    span.innerHTML = response[1];

    if (response[0] != 'info') {
	span.innerHTML = js_beautify(response[1]);
//	prettyPrint([span]);
    }
    el.appendChild(span);

    li.className = response[0];
    li.innerHTML = '<span class="gutter"></span>';
    li.appendChild(el);

    appendLog(li);

    output.parentNode.scrollTop = 0;
    if (!body.className) {
      exec.value = '';
      if (enableCC) {
        try {
          document.getElementsByTagName('a')[0].focus();
          cursor.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('delete', false, null);
        } catch (e) {}
      }
    }
  }
  pos = history.length;
}
window.postJSConsole = post;
function log(msg, className) {
  var li = document.createElement('li'),
      div = document.createElement('div');

  div.innerHTML = msg;
  prettyPrint([div]);
  li.className = className || 'log';
  li.innerHTML = '<span class="gutter"></span>';
  li.appendChild(div);

  appendLog(li);
}

function echo(cmd) {
  var li = document.createElement('li');

  li.className = 'echo';
  li.innerHTML = '<span class="gutter"></span><div>' + cleanse(cmd) + '<a href="/?' + encodeURIComponent(cmd) + '" class="permalink" title="permalink">link</a></div>';

  logAfter = null;

  if (output.querySelector) {
    logAfter = output.querySelector('li.echo') || null;
  } else {
    var lis = document.getElementsByTagName('li'),
        len = lis.length,
        i;
    for (i = 0; i < len; i++) {
      if (lis[i].className.indexOf('echo') !== -1) {
        logAfter = lis[i];
        break;
      }
    }
  }
  
  // logAfter = output.querySelector('li.echo') || null;
  appendLog(li, true);
}

window.info = function(cmd) {
  var li = document.createElement('li');

  li.className = 'info';
  li.innerHTML = '<span class="gutter"></span><div>' + cleanse(cmd) + '</div>';

  // logAfter = output.querySelector('li.echo') || null;
  // appendLog(li, true);
  appendLog(li);
}

function appendLog(el, echo) {
  if (echo) {
    if (!output.firstChild) {
      output.appendChild(el);
    } else {
      output.insertBefore(el, output.firstChild);
    }      
  } else {
    // if (!output.lastChild) {
    //   output.appendChild(el);
    //   // console.log('ok');
    // } else {
      // console.log(output.lastChild.nextSibling);
      output.insertBefore(el, logAfter ? logAfter : output.lastChild.nextSibling); //  ? output.lastChild.nextSibling : output.firstChild
    // }
  }
}

function changeView(event){
  if (false && enableCC) return;
  
  var which = event.which || event.keyCode;
  if (which == 38 && event.shiftKey == true) {
    body.className = '';
    cursor.focus();
    return false;
  } else if (which == 40 && event.shiftKey == true) {
    body.className = 'large';
    cursor.focus();
    return false;
  }
}

function internalCommand(cmd) {
  var parts = [], c;
  if (cmd.substr(0, 1) == ':') {
    parts = cmd.substr(1).split(' ');
    c = parts.shift();
    return (commands[c] || noop).apply(this, parts);
  }
}

function noop() {}

function showhelp() {
  var commands = [

      "response.source_xml",
      "response.where('?s ?p ?o.').length",
      "response.where('?s ?p ?o.')[0].s",
//    ':load &lt;script_url&gt; - to inject external library',
  //  '      load also supports following shortcuts: <br />      jquery, underscore, prototype, mootools, dojo, rightjs, coffeescript, yui.<br />      eg. :load jquery',
    ':clear - to clear the history (accessed using cursor keys)',
    ':history - list current session history',
    ':about - about jsconsole, built by @rem',
    ''
  ];
    
  if (injected) {
    commands.push(':close - to hide the JS Console');
  }
  
  // commands = commands.concat([
  //   'up/down - cycle history',
  //   'shift+up - single line command',
  //   'shift+down - multiline command', 
  //   'shift+enter - to run command in multiline mode'
  // ]);
  
  return commands.join('\n');
}

function checkTab(evt) {
  var t = evt.target,
      ss = t.selectionStart,
      se = t.selectionEnd,
      tab = "  ";
  

  // Tab key - insert tab expansion
  if (evt.keyCode == 9) {
    evt.preventDefault();

    // Special case of multi line selection
    if (ss != se && t.value.slice(ss,se).indexOf("\n") != -1) {
      // In case selection was not of entire lines (e.g. selection begins in the middle of a line)
      // we ought to tab at the beginning as well as at the start of every following line.
      var pre = t.value.slice(0,ss);
      var sel = t.value.slice(ss,se).replace(/\n/g,"\n"+tab);
      var post = t.value.slice(se,t.value.length);
      t.value = pre.concat(tab).concat(sel).concat(post);

      t.selectionStart = ss + tab.length;
      t.selectionEnd = se + tab.length;
    }

    // "Normal" case (no selection or selection on one line only)
    else {
      t.value = t.value.slice(0,ss).concat(tab).concat(t.value.slice(ss,t.value.length));
      if (ss == se) {
        t.selectionStart = t.selectionEnd = ss + tab.length;
      }
      else {
        t.selectionStart = ss + tab.length;
        t.selectionEnd = se + tab.length;
      }
    }
  }

  // Backspace key - delete preceding tab expansion, if exists
  else if (evt.keyCode==8 && t.value.slice(ss - 4,ss) == tab) {
    evt.preventDefault();

    t.value = t.value.slice(0,ss - 4).concat(t.value.slice(ss,t.value.length));
    t.selectionStart = t.selectionEnd = ss - tab.length;
  }

  // Delete key - delete following tab expansion, if exists
  else if (evt.keyCode==46 && t.value.slice(se,se + 4) == tab) {
    evt.preventDefault();

    t.value = t.value.slice(0,ss).concat(t.value.slice(ss + 4,t.value.length));
    t.selectionStart = t.selectionEnd = ss;
  }
  // Left/right arrow keys - move across the tab in one go
  else if (evt.keyCode == 37 && t.value.slice(ss - 4,ss) == tab) {
    evt.preventDefault();
    t.selectionStart = t.selectionEnd = ss - 4;
  }
  else if (evt.keyCode == 39 && t.value.slice(ss,ss + 4) == tab) {
    evt.preventDefault();
    t.selectionStart = t.selectionEnd = ss + 4;
  }
}

function trim(s) {
  return (s||"").replace(/^\s+|\s+$/g,"");
}

var ccCache = {};
var ccPosition = false;

function removeSuggestion() {
  if (!enableCC) exec.setAttribute('rows', 1);
  if (enableCC && cursor.nextSibling) cursor.parentNode.removeChild(cursor.nextSibling);
}

window._console = {
  log: function () {
    var l = arguments.length, i = 0;
    for (; i < l; i++) {
      log(stringify(arguments[i], true));
    }
  },
  dir: function () {
    var l = arguments.length, i = 0;
    for (; i < l; i++) {
      log(stringify(arguments[i]));
    }
  },
  props: function (obj) {
    var props = [], realObj;
    try {
      for (var p in obj) props.push(p);
    } catch (e) {}
    return props;
  }
};

function showHistory() {
  var h = getHistory();
  h.shift();
  return h.join("\n");
}

function getHistory() {
  var history = [''];
  
  if (typeof JSON == 'undefined') return history;
  
  try {
    // because FF with cookies disabled goes nuts, and because sometimes WebKit goes nuts too...
    history = JSON.parse(sessionStorage.getItem('history') || '[""]');
  } catch (e) {}
  return history;
}

// I should do this onunload...but I'm being lazy and hacky right now
function setHistory(history) {
  if (typeof JSON == 'undefined') return;
  
  try {
    // because FF with cookies disabled goes nuts, and because sometimes WebKit goes nuts too...
    sessionStorage.setItem('history', JSON.stringify(history));
  } catch (e) {}
}

function about() {
  return 'Built by <a target="_new" href="http://twitter.com/rem">@rem</a>';
}
var exec = document.getElementById('exec'),
    form = exec.form || {},
    output = document.getElementById('output'),
    cursor = document.getElementById('exec'),
    injected = typeof window['JSCONSOLE'] !== 'undefined',
    fakeConsole = 'window._console',
    history = getHistory(),
    liveHistory = (window.history.pushState !== undefined),
    pos = 0,
    wide = true,
    libraries = {
        jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js',
        prototype: 'http://ajax.googleapis.com/ajax/libs/prototype/1/prototype.js',
        dojo: 'http://ajax.googleapis.com/ajax/libs/dojo/1/dojo/dojo.xd.js',
        mootools: 'http://ajax.googleapis.com/ajax/libs/mootools/1/mootools-yui-compressed.js',
        underscore: 'http://documentcloud.github.com/underscore/underscore-min.js',
        rightjs: 'http://rightjs.org/hotlink/right.js',
        coffeescript: 'http://jashkenas.github.com/coffee-script/extras/coffee-script.js',
        yui: 'http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js'
    },
    body = document.getElementsByTagName('body')[0],
    logAfter = null,
    historySupported = !!(window.history && window.history.pushState),
    sse = null,
    lastCmd = null,
    remoteId = null,
    codeCompleteTimer = null,
    keypressTimer = null,
    commands = { 
      help: showhelp, 
      about: about,
      // loadjs: loadScript, 
//      load: load,
      history: showHistory,
      clear: function () {
        setTimeout(function () { output.innerHTML = ''; }, 10);
        return 'clearing...';
      },
      close: function () {
        if (injected) {
          JSCONSOLE.console.style.display = 'none';
          return 'hidden';
        } else {
          return 'noop';
        }
      },
      listen: function (id) {
        // place script request for new listen ID and start SSE
        var script = document.createElement('script'),
            callback = '_cb' + +new Date;
        script.src = '/remote/' + (id||'') + '?callback=' + callback;

        window[callback] = function (id) {
          remoteId = id;
          if (sse !== null) sse.close();

          sse = new EventSource('/remote/' + id + '/log');
          sse.onopen = function () {
            remoteId = id;
            window.info('Connected to "' + id + '"\n\n<script src="http://jsconsole.com/remote.js?' + id + '"></script>');
          };

          sse.onmessage = function (event) {
            var data = JSON.parse(event.data);
            if (data.type && data.type == 'error') {
              post(data.cmd, true, ['error', data.response]);
            } else if (data.type && data.type == 'info') {
              window.info(data.response);
            } else {
              if (data.cmd != 'remote console.log') data.response = data.response.substr(1, data.response.length - 2); // fiddle to remove the [] around the repsonse
              echo(data.cmd);
              log(data.response, 'response');
            }
          };

          sse.onclose = function () {
            window.info('Remote connection closed');
            remoteId = null;
          };

          try {
            body.removeChild(script);
            delete window[callback];
          } catch (e) {}
        };
        body.appendChild(script);
        return 'Creating connection...';
      }
    },
    // I hate that I'm browser sniffing, but there's issues with Firefox and execCommand so code completion won't work
    iOSMobile = navigator.userAgent.indexOf('AppleWebKit') !== -1 && navigator.userAgent.indexOf('Mobile') !== -1,
    // TODO try and detect this - currently Firefox doesn't allow me to clear the contents :(
    enableCC = navigator.userAgent.indexOf('AppleWebKit') !== -1 && navigator.userAgent.indexOf('Mobile') === -1;

    enableCC = false;
if (enableCC) {
  exec.parentNode.innerHTML = '<div autofocus id="exec" spellcheck="false"><span id="cursor" contenteditable></span></div>';
  exec = document.getElementById('exec');
  cursor = document.getElementById('cursor');
}


// tweaks to interface to allow focus
// if (!('autofocus' in document.createElement('input'))) exec.focus();
cursor.focus();
output.parentNode.tabIndex = 0;

function whichKey(event) {
  var keys = {38:1, 40:1, Up:38, Down:40, Enter:10, 'U+0009':9, 'U+0008':8, 'U+0190':190, 'Right':39, 
      // these two are ignored
      'U+0028': 57, 'U+0026': 55 }; 
  return keys[event.keyIdentifier] || event.which || event.keyCode;
}

function setCursorTo(str) {
  str = enableCC ? cleanse(str) : str;
  exec.value = str;
  if (enableCC) {
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertHTML', false, str);
  } else {
    var rows = str.match(/\n/g);
    exec.setAttribute('rows', rows !== null ? rows.length + 1 : 1);
  }
  cursor.focus();
  window.scrollTo(0,0);
}

output.ontouchstart = output.onclick = function (event) {
  event = event || window.event;
  if (event.target.nodeName == 'A' && event.target.className == 'permalink') {
    var command = decodeURIComponent(event.target.search.substr(1));
    setCursorTo(command);
    
    if (liveHistory) {
      window.history.pushState(command, command, event.target.href);
    }
    
    return false;
  }
};

exec.ontouchstart = function () {
  window.scrollTo(0,0);
};

exec.onkeyup = function (event) {
  var which = whichKey(event);

  if (enableCC && which != 9 && which != 16) {
    clearTimeout(codeCompleteTimer);
    codeCompleteTimer = setTimeout(function () {
      codeComplete(event);
    }, 200);
  }
};

function findNode(list, node) {
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i] == node) {
      return pos;
    }
    pos += list[i].nodeValue.length;
  }
  return -1;
}

exec.onkeydown = function (event) {
  event = event || window.event;
  var keys = {38:1, 40:1}, 
      wide = body.className == 'large', 
      which = whichKey(event);

  if (typeof which == 'string') which = which.replace(/\/U\+/, '\\u');
  if (keys[which]) {
    if (event.shiftKey) {
      changeView(event);
    } else if (!wide) { // history cycle
      if (enableCC && window.getSelection) {
        window.selObj = window.getSelection();
        var selRange = selObj.getRangeAt(0);
        
        cursorPos =  findNode(selObj.anchorNode.parentNode.childNodes, selObj.anchorNode) + selObj.anchorOffset;
        var value = exec.value,
            firstnl = value.indexOf('\n'),
            lastnl = value.lastIndexOf('\n');

        if (firstnl !== -1) {
          if (which == 38 && cursorPos > firstnl) {
            return;
          } else if (which == 40 && cursorPos < lastnl) {
            return;
          }
        }
      }
      
      if (which == 38) { // cycle up
        pos--;
        if (pos < 0) pos = 0; //history.length - 1;
      } else if (which == 40) { // down
        pos++;
        if (pos >= history.length) pos = history.length; //0;
      } 
      if (history[pos] != undefined && history[pos] !== '') {
        removeSuggestion();
        setCursorTo(history[pos])
        return false;
      } else if (pos == history.length) {
        removeSuggestion();
        setCursorTo('');
        return false;
      }
    }
  } else if ((which == 13 || which == 10) && event.shiftKey == false) { // enter (what about the other one)
    removeSuggestion();
    if (event.shiftKey == true || event.metaKey || event.ctrlKey || !wide) {
      var command = exec.textContent || exec.value;
      if (command.length) post(command);
      return false;
    }
  } else if ((which == 13 || which == 10) && !enableCC && event.shiftKey == true) {
    // manually expand the textarea when we don't have code completion turned on
    var rows = exec.value.match(/\n/g);
    rows = rows != null ? rows.length + 2 : 2;
    exec.setAttribute('rows', rows);
  } else if (which == 9 && wide) {
    checkTab(event);
  } else if (event.shiftKey && event.metaKey && which == 8) {
    output.innerHTML = '';
  } else if ((which == 39 || which == 35) && ccPosition !== false) { // complete code
    completeCode();
  } else if (event.ctrlKey && which == 76) {
    output.innerHTML = '';
  } else if (enableCC) { // try code completion
    if (ccPosition !== false && which == 9) {
      codeComplete(event); // cycles available completions
      return false;
    } else if (ccPosition !== false && cursor.nextSibling) {
      removeSuggestion();
    }
  }
};

function completeCode(focus) {
  var tmp = exec.textContent, l = tmp.length;
  removeSuggestion();
  
  cursor.innerHTML = tmp;
  ccPosition = false;
  
  // daft hack to move the focus elsewhere, then back on to the cursor to
  // move the cursor to the end of the text.
  document.getElementsByTagName('a')[0].focus();
  cursor.focus();
  
  var range, selection;
  if (document.createRange) {//Firefox, Chrome, Opera, Safari, IE 9+
    range = document.createRange();//Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(cursor);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);//make the range you have just created the visible selection
  } else if (document.selection) {//IE 8 and lower
    range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
    range.moveToElementText(cursor);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    range.select();//Select the range (make it the visible selection
  }
}

form.onsubmit = function (event) {
  event = event || window.event;
  event.preventDefault && event.preventDefault();
  removeSuggestion();
  post(exec.textContent || exec.value);
  return false;
};

document.onkeydown = function (event) {
  event = event || window.event;
  var which = event.which || event.keyCode;
  
  if (event.shiftKey && event.metaKey && which == 8) {
    output.innerHTML = '';
    cursor.focus();
  } else if (event.target == output.parentNode && which == 32) { // space
    output.parentNode.scrollTop += 5 + output.parentNode.offsetHeight * (event.shiftKey ? -1 : 1);
  }
  
  return changeView(event);
};

exec.onclick = function () {
  cursor.focus();
}


window.onpopstate = function (event) {
  setCursorTo(event.state || '');
};

setTimeout(function () {
  window.scrollTo(0, 1);
}, 500);


//getProps('window'); // cache 

if (document.addEventListener) document.addEventListener('deviceready', function () {
  cursor.focus();
}, false);

// if (iOSMobile) {
//   document.getElementById('footer').style.display = 'none';
//   alert('hidden');
// }

})(this);
