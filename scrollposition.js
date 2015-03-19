/* globals calcValue:true */
////////////////////////////////////////////////////////////////////////////////
// Utils
////////////////////////////////////////////////////////////////////////////////

/** Helper function for ScrollPosition */
var _scrollPositionDiff = function _scrollPositionDiff(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y
  };
};

/**
 * Creates a scroll position object with details about index/offset/size and
 * helper funtions diff for delta between two scroll positions and clone for
 * cloning object
 * @param {Object} position
 * @param {Object} size
 */
ScrollPosition = function ScrollPosition(position, size) {
  var self = this;

  // Allow user to set an existing scrollPosition as position
  size = size || position;

  // Make sure to return a new instance of ScrollPosition
  if (!(this instanceof ScrollPosition))
    return new ScrollPosition(position, size);

  self.width = size.width;
  self.height = size.height;
  self.x = position.x;
  self.y = position.y;

};

ScrollPosition.prototype.index = function() {
  // [-1, 0, 1]
  // We have to make zero count only once
  var x = this.x;
  var y = this.y;
  return {
    x: Math.floor(x / this.width),
    y: Math.floor(y / this.height)
  };
};

ScrollPosition.prototype.offset = function() {
  // TODO: Clean up this formular if possible
  var dx = (Math.floor(Math.abs(this.x) / this.width) + 1) * this.width;
  var dy = (Math.floor(Math.abs(this.y) / this.height) + 1) * this.height;

  return {
    x: (dx + this.x) % this.width,
    y: (dy + this.y) % this.height
  };
};

ScrollPosition.prototype.position = function() {
  return {
    x: this.x,
    y: this.y
  };
};

ScrollPosition.prototype.size = function() {
  return {
    width: this.width,
    height: this.height
  };
};

ScrollPosition.prototype.diff = function (compare) {
  return {
    position: _scrollPositionDiff(this.position(), compare.position()),
    index: _scrollPositionDiff(this.index(), compare.index()),
    offset: _scrollPositionDiff(this.offset(), compare.offset())
  };
};

ScrollPosition.prototype.clone = function () {
  return new ScrollPosition(this);
};

ScrollPosition.prototype.toObject = function () {
  var self = this;

  return {
    index: self.index(),
    offset: self.offset(),
    position: self.position(),
    size: self.size()
  };
};

/** Options helper function */
calcValue = function (value, actual, container) {
  if (typeof container === 'undefined') container = actual;
  if (value === +value) {
    // Percentage size
    if (value % 1 !== 0) {
      // eg 0.3
      return container * value;
    } else {
      // eg. 20
      return value;
    }
  }

  return actual;
};
