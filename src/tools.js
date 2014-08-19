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
