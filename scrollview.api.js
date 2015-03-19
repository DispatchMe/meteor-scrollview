/*jshint ignore:start,-W101*/ // allow long lines
////////////////////////////////////////////////////////////////////////////////
// DataListView Api
////////////////////////////////////////////////////////////////////////////////

ScrollView.prototype.destroy = function() {
  var container = $(this.options.container);
  // XXX: Clean up this instance...

  // Make sure our render loop halts have to do this:
  this.isDestroyed = true;

  // XXX: We need to destroy touch events
  this.panEvents.destroy();

  // and clean up dom container + its elements
  // children / items are listed in this.items

  // Clean up listeners
  // XXX: At the moment this just removes all event listeners
  // We might want this a bit more finegrained.
  container && container.off();
};

ScrollView.prototype.on = function(/* arguments */) {
  var container = $(this.options.container);

  return container && container.on.apply(container, _.toArray(arguments));
};

ScrollView.prototype.emit = function(method, data) {
  if (!this.eventsEnabled)
    return;

  var container = $(this.options.container);

  var e = $.Event(method, data);

  return container && container.trigger(e);
};

ScrollView.prototype.disableEvents = function() {
  this.eventsEnabled = false;
  this.sequence.eventsEnabled = false;
};

ScrollView.prototype.enableEvents = function() {
  this.eventsEnabled = true;
  this.sequence.eventsEnabled = true;
};

ScrollView.prototype.currentIndex = function() {
  // We return the destination index - not the currently animated. This way we
  // can get started working on data that depends on the result of the scroll
  return this.destination.index();
};

// This updates the position instantly without animation
ScrollView.prototype.moveTo = function(position) {
  var self = this;
  self.last = self.current;
  self.current = new ScrollPosition(position, self.child);
  self.destination = new ScrollPosition(position, self.child);
};

// Applies a transition on the scroll
ScrollView.prototype.scrollTo = function(position, duration) {
  var self = this;

  self.duration = duration;
  self.destinationTime = self.currentTime + duration;

  if (typeof position.x !== 'undefined')
    self.destination.x = position.x;

  if (typeof position.y !== 'undefined')
    self.destination.y = position.y;

  // transitionElement(self.container, 'transform ' + duration + 'ms linear');
  // translateElement(self.container, -value, 0);

  self.transition = self.interpolator.create(self.current.position(), self.destination.position(), duration);
};

ScrollView.prototype.indexPosition = function(index, defaultPos) {
  var self = this;

  // Set default position
  defaultPos = defaultPos || self.destination.position();

  var x = defaultPos.x;
  var y = defaultPos.y;

  if (index === +index) {
    // Index is a number use direction
    if (self.options.direction === 0) {
      x = index * self.child.width;
    } else {
      y = index * self.child.height;
    }
  } else if (typeof index === 'object') {
    if (typeof index.x !== 'undefined') x = index.x * self.child.width;
    if (typeof index.y !== 'undefined') y = index.y * self.child.height;
  } else {
    throw new Error('ScrollView.indexPosition: index should be number or object {x, y}');
  }

  return {
    x: x,
    y: y
  };
};

// XXX: We should perhaps have a speed limit setting pixels pr. sec otherwise
// the ensure index cannot keep up - we could also do a jump if distance is
// above x items
ScrollView.prototype.scrollToIndex = function(index, duration) {
  var self = this;

  // Get the calculated position
  var position = self.indexPosition(index);

  // Scroll to index
  self.scrollTo(position, duration);
};

// The idea here is if we are have a diff in index > visibleItems + preload
// then set current to index - visibleItems+preload and scrollToIndex from
// there - this is a much faster way getting there...
ScrollView.prototype.jumpToIndex = function(index, duration) {
  var self = this;

  // Get the calculated position
  var position = new ScrollPosition(self.indexPosition(index), self.child);

  var diff = self.current.diff(position);

  var bufferLength = self.sequence.items.length;
  var bufferWidth = bufferLength * self.child.width;

  // XXX: add y support
  if (diff.index.x > bufferLength) {
    // Set the current position a buffer length behind
    var deltaX = (position.x - bufferWidth) - self.current.x;

    self.current.x += deltaX;
  } else if (diff.index.x < -bufferLength) {
    // Set the current position a buffer length in front
    var deltaX = (position.x + bufferWidth) - self.current.x;

    self.current.x += deltaX;
  }

  // Scroll to index
  self.scrollTo(position, duration);
};

/**
 * This function will test if the passed in index is visible on the screen
 * @param  {Number}
 * @return {Number} Returns -1, 0, 1
 */
ScrollView.prototype.isHidden = function(index) {
  var self = this;
  // Calculate the offset
  var offset = (self.child.offset.x > 0) ?
          Math.ceil(self.child.offset.x / self.child.width) :
          Math.floor(self.child.offset.x / self.child.width);

  // Set 2 x preload helper
  var doublePreload = 2 * self.options.preload.x;
  // First is the index - visual offset
  var firstIndex = self.sequence.index - offset;
  // Add the length - 2 x preload
  var lastIndex = firstIndex + self.sequence.items.length - doublePreload;

  if (index < firstIndex) return -1;
  if (index > lastIndex) return 1;
  return 0;
};
/*jshint ignore:end,-W101*/
