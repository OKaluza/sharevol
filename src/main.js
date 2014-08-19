/** @preserve
 * ShareVol
 * Lightweight WebGL volume viewer/slicer
 *
 * Copyright (c) 2014, Monash University. All rights reserved.
 * Author: Owen Kaluza - owen.kaluza ( at ) monash.edu
 *
 * Licensed under the GNU Lesser General Public License
 * https://www.gnu.org/licenses/lgpl.html
 *
 */
//TODO: colourmaps per slicer/volume not shared (global shared list of selectable maps?)
var volume;
var slicer;
var colours;
//Windows...
var info, colourmaps;
var props = {};
var reset;
var filename;
var mobile;

function initPage() {
  window.onresize = autoResize;
  //Save props on exit
  window.onbeforeunload = saveData;

  //Create tool windows
  info = new Toolbox("info");
  info.show();
  colourmaps = new Toolbox("colourmap", 400, 200);

  //Yes it's user agent sniffing, but we need to attempt to detect mobile devices so we don't over-stress their gpu...
  mobile = (screen.width <= 760 || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent));

  //Colour editing and palette management
  colours = new GradientEditor($('palette'), updateColourmap);

  //Load json data?
  var json = getSearchVariable("data");
  if (!json) {
    //Saved settings for this image...
    filename = getSearchVariable("img");
    if (filename) {
      loadStoredData(filename);
      //Use props from url or defaults
      props = {
        "url" : decodeURI(filename),
        "res" : [getSearchVariable("nx", 256), getSearchVariable("ny", 256), getSearchVariable("nz", 256)],
        "scale" : [getSearchVariable("dx", 1), getSearchVariable("dy", 1), getSearchVariable("dz", 1)]
      }

      if (props["url"]) loadTexture();
    } else {
      //Attempt to load default.json
      json = "default.json";
    }
  }

  //Try and load json parameters file (no cache)
  if (json) {
    $('status').innerHTML = "Loading params...";
    ajaxReadFile(decodeURI(json), loadData, true);
  }
}

function loadStoredData(key) {
  if (localStorage[key]) {
    try {
      var parsed = JSON.parse(localStorage[key]);
      props = parsed;
    } catch (e) {
      //if erroneous data in local storage, delete
      //console.log("parse error: " + e.message);
      alert("parse error: " + e.message);
      localStorage[key] = null;
    }
  }
}

function loadData(src, fn) {
  props = JSON.parse(src);
  reset = props; //Store orig for reset
  //Storage reset?
  if (getSearchVariable("reset")) {localStorage.removeItem(fn); console.log("Storage cleared");}
  //Load any stored presets for this file
  filename = fn;
  loadStoredData(fn);

  //Setup default props from original data...
  props.url = reset.url;
  props.res = reset.res || [256, 256, 256];
  props.scale = reset.scale || [1.0, 1.0, 1.0];

  //Load the image
  loadTexture();
}

function saveData() {
  try {
    localStorage[filename] = getData();
  } catch(e) {
    //data wasn’t successfully saved due to quota exceed so throw an error
    console.log('LocalStorage Error: Quota exceeded? ' + e);
  }
}

function getData() {
  var data = {};
  data.url = props.url;
  data.res = props.res;
  data.scale = props.scale;
  if (volume) data.volume = volume.get();
  if (slicer) data.slicer = slicer.get();
  return JSON.stringify(data, null, 2);
}

function exportData() {
  window.open('data:text/json;base64,' + window.btoa(getData()));
}

function resetFromData(src) {
  //Restore data from saved props
  if (src.volume && volume) {
    volume.load(src.volume);
    volume.draw();
  }
  if (src.slicer && slicer) {
    slicer.load(src.slicer);
    slicer.draw();
  }
}

function loadTexture() {
  $('status').innerHTML = "Loading image data... ";
  var image;

  loadImage(props["url"], function () {
    image = new Image();

    var headers = request.getAllResponseHeaders();
    var match = headers.match( /^Content-Type\:\s*(.*?)$/mi );
    var mimeType = match[1] || 'image/png';
    var blob = new Blob([request.response], {type: mimeType} );
    image.src =  window.URL.createObjectURL(blob);
    var imageElement = document.createElement("img");

    image.onload = function () {
      console.log("Loaded image: " + image.width + " x " + image.height);

      //Create the slicer
      if (props.slicer) {
        if (mobile) props.slicer.show = false; //Start hidden on small screen
        slicer = new Slicer(props, image, "linear");
      }

      //Create the volume viewer
      if (props.volume) {
        volume = new Volume(props, image, mobile);
        volume.slicer = slicer; //For axis position
      }

      //Volume draw on mouseup to apply changes from other controls (including slicer)
      document.addEventListener("mouseup", function(ev) {if (volume) volume.delayedRender(250, true);}, false);
      document.addEventListener("wheel", function(ev) {if (volume) volume.delayedRender(250, true);}, false);

      //Update colours (and draw objects)
      updateColourmap();

      info.hide();  //Status

      /*/Draw speed test
      frames = 0;
      testtime = new Date().getTime();
      info.show();
      volume.draw(false, true);*/

      if (!props.nogui) {
        var gui = new dat.GUI();
        gui.add({"Reset" : function() {resetFromData(reset);}}, 'Reset');
        gui.add({"Restore" : function() {resetFromData(props);}}, 'Restore');
        gui.add({"Export" : function() {exportData();}}, 'Export');
        gui.add({"loadFile" : function() {document.getElementById('fileupload').click();}}, 'loadFile'). name('Load Image file');
        gui.add({"ColourMap" : function() {window.colourmaps.toggle();}}, 'ColourMap');

        if (volume) volume.addGUI(gui);
        if (slicer) slicer.addGUI(gui);
      }
    }
  }
  );
}

/////////////////////////////////////////////////////////////////////////
//File upload handling
function fileSelected(files) {
  filesProcess(files);
}
function filesProcess(files, callback) {
  window.URL = window.webkitURL || window.URL; // Vendor prefixed in Chrome.
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    props["url"] = window.URL.createObjectURL(file);
    loadTexture();
  }
}

function autoResize() {
  if (volume) {
    volume.width = 0; //volume.canvas.width = window.innerWidth;
    volume.height = 0; //volume.canvas.height = window.innerHeight;
    volume.draw();
  }
}

function setColourMap(filename) {
  var data = readURL("colourmaps/" + filename);
  colours.read(data);
  updateColourmap();
}

function updateColourmap() {
  if (!colours) return;
  var gradient = $('gradient');
  colours.palette.draw(gradient, false);

  if (volume && volume.webgl) {
    volume.webgl.updateTexture(volume.webgl.gradientTexture, gradient, volume.gl.TEXTURE1);  //Use 2nd texture unit
    volume.applyBackground(colours.palette.background.html());
    volume.draw();
  }

  if (slicer) {
    slicer.updateColourmap();
    slicer.draw();
  }
}

var request, progressBar;

    function loadImage(imageURI, callback)
    {
        request = new XMLHttpRequest();
        request.onloadstart = showProgressBar;
        request.onprogress = updateProgressBar;
        request.onload = callback;
        request.onloadend = hideProgressBar;
        request.open("GET", imageURI, true);
        request.responseType = 'arraybuffer';
        request.send(null);
    }
    
    function showProgressBar()
    {
        progressBar = document.createElement("progress");
        progressBar.value = 0;
        progressBar.max = 100;
        progressBar.removeAttribute("value");
        document.getElementById('status').appendChild(progressBar);
    }
    
    function updateProgressBar(e)
    {
        if (e.lengthComputable)
            progressBar.value = e.loaded / e.total * 100;
        else
            progressBar.removeAttribute("value");
    }
    
    function showImage()
    {
        var headers = request.getAllResponseHeaders();
        var match = headers.match( /^Content-Type\:\s*(.*?)$/mi );
        var mimeType = match[1] || 'image/png';
        var blob = new Blob([request.response], {type: mimeType} );
        var imageElement = document.createElement("img");
        imageElement.src = window.URL.createObjectURL(blob);
        document.body.appendChild(imageElement);
    }
    
    function hideProgressBar()
    {
      document.getElementById('status').removeChild(progressBar);
    }

/**
 * @constructor
 */
function Toolbox(id, x, y) {
  //Mouse processing:
  this.el = $(id);
  this.mouse = new Mouse(this.el, this);
  this.mouse.moveUpdate = true;
  this.el.mouse = this.mouse;
  this.style = $S(id);
  if (x && y) {
    this.style.left = x + 'px';
    this.style.top = y + 'px';
  } else {
    this.style.left = ((window.innerWidth - this.el.offsetWidth) * 0.5) + 'px';
    this.style.top = ((window.innerHeight - this.el.offsetHeight) * 0.5) + 'px';
  }
  this.drag = false;
}

Toolbox.prototype.toggle = function() {
  if (this.style.visibility == 'visible')
    this.hide();
  else
    this.show();
}

Toolbox.prototype.show = function() {
  this.style.visibility = 'visible';
}

Toolbox.prototype.hide = function() {
  this.style.visibility = 'hidden';
}

//Mouse event handling
Toolbox.prototype.click = function(e, mouse) {
  this.drag = false;
  return true;
}

Toolbox.prototype.down = function(e, mouse) {
  //Process left drag only
  this.drag = false;
  if (mouse.button == 0 && e.target.className.indexOf('scroll') < 0 && ['INPUT', 'SELECT', 'OPTION', 'RADIO'].indexOf(e.target.tagName) < 0)
    this.drag = true;
  return true;
}

Toolbox.prototype.move = function(e, mouse) {
  if (!mouse.isdown) return true;
  if (!this.drag) return true;

  //Drag position
  this.el.style.left = parseInt(this.el.style.left) + mouse.deltaX + 'px';
  this.el.style.top = parseInt(this.el.style.top) + mouse.deltaY + 'px';
  return false;
}

Toolbox.prototype.wheel = function(e, mouse) {
}
