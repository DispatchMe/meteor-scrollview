/* globals TemplateSequence:true */
/**
 * TemplateSequence
 * This class maintains a sequence of template instances, each is handed an
 * index as its data context
 *
 * The sequence can be resized, index can be set and there are helpers for
 * iteration and memory consumption
 */

var _setElementData = function(el, data) {
  Kernel.defer(function () {
    el.dataVar.set(data);
  });
};

/**
 * TemplateSequence maintainer of template instances
 * @method TemplateSequence
 * @param  {Object}         options
 * @param {Template} template The Meteor template
 * @param {DOMElement} container The container element to insert templates
 * @param {Number} [index=0] Initial index
 * @param {Number} [offset=0] Offset of the index
 * @param {Number} [size=0] Initial number of template instances
 */
TemplateSequence = function(options) {
  var self = this;

  if (!(self instanceof TemplateSequence))
    return new TemplateSequence(options);

  options = _.extend({
    // Template to instanciate
    template: null,
    // Container of template instances
    container: null,
    // Start index
    index: 0,
    // index offset
    offset: 0,
    // Number of elements
    size: 0,
    // Events enabled
    eventsEnabled: true
  }, options);

  self.index = options.index;
  self.items = [];


  self.eventsEnabled = options.eventsEnabled;

  self.eventemitter = $(options.container);

  // Create the item at index
  self.createItem = function(index) {
    return Blaze.renderWithData(options.template, {
      index: { x: index, y: 0 }
    }, options.container);
  };

  self.firstIndex = function() {
    return self.index - options.offset;
  };

  // Create initial items
  for (var i=0; i < options.size; i++) {
    self.items.push(self.createItem(self.firstIndex() + i));
  }
};

/**
 * Resize the sequence
 * @method resize
 * @param  {Number} newSize This number contains the new size
 */
TemplateSequence.prototype.resize = function(newSize) {
  var self = this;
  var diff = newSize - self.items.length;

  if (diff > 0) {
    // Calc the first missing index
    var firstMissingIndex = self.firstIndex() + self.items.length;

    for (var i = 0; i < diff; i++) {
      // Add missing items
      self.items.push(self.createItem(firstMissingIndex + i));
    }
  } else if (diff < 0) {

    for (var a = 0; a < Math.abs(diff); a++) {
      // Remove items
      Blaze.remove(self.items.pop());
    }
  }

  if (diff) self.emit('indexResize', { size: newSize, diff: diff });
};

/**
 * Set the index
 * @method setIndex
 * @param  {number} index The new index of the seqence
 */
TemplateSequence.prototype.setIndex = function(index) {
  var self = this;
  var diff = index - self.index;

  // TODO: We can make this function more performant when setting an index
  // far away.
  //
  // So if diff is > self.items.length we kinda know that we need to set a
  // clean sequence.
  // Instead of iterating from 0 to diff we could iterate from:
  // diff-self.items.length to diff with the result of skipping 0 to diff-length
  //
  // Note: This optimization requires additional tests

  if (diff > 0) {
    var lastIndex = self.firstIndex() + self.items.length;

    for (var i = 0; i < diff; i++) {
      // Move element from first
      var el = self.items.shift();
      // To last
      self.items.push(el);
      // And update the template data
      _setElementData(el, { index: { x: lastIndex + i, y: 0 } });
    }
  } else if (diff < 0) {
    // Calc the first index
    var firstIndex = self.firstIndex() -1;

    for (var a = 0; a < Math.abs(diff); a++) {
      // Move element from last
      var elA = self.items.pop();
      // To first
      self.items.unshift(elA);
      // And update the template data
      _setElementData(elA, { index: { x: firstIndex - a, y: 0 } });
    }
  }

  self.index = index;

  if (diff) self.emit('indexChange', { index: { x: index, y: 0 } });
};

/**
 * Iterator for iterating over template instances in the sequence
 * @method forEach
 * @param  {Function} f Function will get (item, index, i)
 */
TemplateSequence.prototype.forEach = function(f) {
  var self = this;

  for (var i = 0; i < self.items.length; i++) {
    f(self.items[i], self.firstIndex() + i, i);
  }
};

/**
 * Destroy the TemplateSequence
 * @method destroy
 */
TemplateSequence.prototype.destroy = function() {
  var self = this;

  // Cleanup event emitter
  self.eventemitter.off('indexChange');
  self.eventemitter.off('indexResize');

  // Empty this sequence
  self.resize(0);
};

/**
 * Emit events on the eventemitter (typically the container element)
 * @method emit
 * @param  {String} method Event name
 * @param  {Object} data   Event data
 * @return {EventHandle}
 */
TemplateSequence.prototype.emit = function(method, data) {
  var self = this;

  if (!self.eventsEnabled)
    return;

  var e = $.Event(method, data);

  return self.eventemitter && self.eventemitter.trigger(e);
};
