/*jshint ignore:start,-W101*/ // allow long lines
////////////////////////////////////////////////////////////////////////////////
// Velocity to destination calculation
////////////////////////////////////////////////////////////////////////////////

/**
 * Calculate the end position of the transition based on the velocity given
 * by user input.
 * @param  {ScrollPosition}
 * @param  {Object}
 * @param  {Object}
 * @param  {Boolean}
 * @param  {Number}
 * @return {ScrollPosition}
 */
var getVelocityDestination = function (current, velocity, paginated, resistance) {
  // Distance to travel
  var dX = -velocity.x / resistance;
  var dY = -velocity.y / resistance;
  var x = current.x + dX;
  var y = current.y + dY;

  if (paginated) {

    var page = new ScrollPosition({
      x: x + (current.width / 2),
      y: y + (current.height / 2)
    }, current.size());

    // Target something like modulus zero on client height/width
    x = page.index().x * current.width;
    y = page.index().y * current.height;

  }

  return new ScrollPosition({ x: x, y: y }, current.size());
};



////////////////////////////////////////////////////////////////////////////////
// ScrollView
////////////////////////////////////////////////////////////////////////////////


// The infinite date scroller
ScrollView = function ScrollView(options) {
  var self = this;

  // Make sure an instance is returned
  if (!(self instanceof ScrollView))
    return new ScrollView(options);

  // Destroyed flag
  self.isDestroyed = false;

  // Set default options
  self.options = _.extend({
    resistance: 0.001,
    minimumDuration: 200, // Minimum animation at scroll end
    scrollWeight: 10, // Weight to calculate momentum
    releaseLimit: 200, // threshold from last move to release - above this velocity is set to 0
    offset: [0, 0],
    pagePeriod: 200,
    preload: {
      x: 1,
      y: 0
    },
    direction: 0, // 0 = Horisontal, 1 = Vertically
    ease: 'linear', // iosScroll
    handleEvents: true,
    eventsEnabled: true,
    index: {
      x: 0,
      y: 0
    }
  }, options || {});

  // Check options
  if (typeof self.options.container === 'undefined')
    throw new Error('ScrollView: Requires option "container" as dom container element');

  if (typeof self.options.template === 'undefined')
    throw new Error('ScrollView: Requires option "template"');

  self.height = $(self.options.container).height();
  self.width = $(self.options.container).width();
  self.child = {
    height: self.height,
    width: self.width,
    offset: {
      x: 0,
      y: 0
    }
  };

  if (typeof self.options.size === 'undefined' || self.options.size.length !== 2)
    throw new Error('ScrollView: Requires option "size" of children');

  // Ajust self.child{height, width} accordingly to the self.options.size[]
  self.child.width = calcValue(self.options.size[0], self.child.width);
  self.child.height = calcValue(self.options.size[1], self.child.height);

  // Ajust self.child.offset{x, y} accordingly to the self.options.offset[]
  self.child.offset.x = calcValue(self.options.offset[0], self.child.offset.x, self.child.width);
  self.child.offset.y = calcValue(self.options.offset[1], self.child.offset.y, self.child.height);

  var initialPosition = {
    x: self.options.index.x * self.child.width,
    y: self.options.index.y * self.child.height
  };

  // These functions will help us keep track of animation
  self.current = new ScrollPosition(initialPosition, self.child);
  self.last = new ScrollPosition(initialPosition, self.child);
  self.destination = new ScrollPosition(initialPosition, self.child);

  // Dom elements
  self.items = [];

  // Initialize the current time stamp
  self.currentTime = null;
  // Destination for the animation / time to end
  self.destinationTime = null;
  // Default duration of animation
  self.duration = 0;

  self.eventsEnabled = self.options.eventsEnabled;

  self.interpolator = new Interpolator(self.options.ease);

  _constructor.call(this, options);
};

var Tools = {
  transform: function(el, transform) {
    el.style.transform = transform;
  }
};

// Detect transform
_.each([
  'MozTransform',
  'msTransform',
  'webkit',
  'OTransform',
  'WebkitTransform',
  'webkitTransform',
  'transform'
  ], function(name) {
  // Check if prefix is found
  if (document.documentElement.style[name]) {
    // Set the transform function
    Tools.transform = function(el, transform) {
      el.style[name] = transform;
    };
  }
});

var translateElement = function translateElement(el, x, y) {
  Tools.transform(el, 'translate3d(' + x + 'px,' + y + 'px, 0)');
};

// var transitionElement = function transitionElement(el, ease) {
//   el.style[usePrefix('transition')] = ease;
// };

var _updateMasterTranslate = function translateMasterLayer() {
  var self = this;
  // Calculate the offset position
  var offsetPosition = new ScrollPosition({
    x: self.current.x + self.child.offset.x,
    y: self.current.y + self.child.offset.y,
  }, self.current.size());

  // Make sure our elements contain the correct data
  self.sequence.setIndex(offsetPosition.index().x);

  var o = offsetPosition.offset();

  // Calculate the main offset
  var mainOffset = {
    x: -o.x -self.options.preload.x * self.child.width,
    y: -o.y -self.options.preload.y * self.child.height
  };

  // Calculate the main x, y
  var x = mainOffset.x + self.child.offset.x + (self.child.width / 2);
  var y = self.child.offset.y; // TODO: Add support for y axis
  //mainOffset.y + self.child.offset.y + (self.child.height / 2);

  self.sequence.forEach(function(item, index, i) {
    var elementX = i * self.child.width;

    // Translate each item
    translateElement(item.firstNode(), x + elementX, y);
  });
};

var _constructor = function () {
  var self = this;
  var container = self.options.container;

  // Track last coordinate
  var lX = 0;
  var lY = 0;

  //////////////
  // SEQUENCE //
  //////////////
  var calculateSequenceSize = function() {
    return Math.round(self.width / self.child.width) + 2 * self.options.preload.x;
  };

  // Define our template sequence
  self.sequence = new TemplateSequence({
    template: self.options.template,
    index: self.options.index.x,
    offset: self.options.preload.x,
    container: container,
    size: calculateSequenceSize(),
    eventsEnabled: false
  });

  // Define resize event
  var resizeEvent = function(evt) {
    self.height = $(container).height();
    self.width = $(container).width();

    self.sequence.resize(calculateSequenceSize());

    _updateMasterTranslate.call(self);
  };

  // Add event listener
  $(window).resize(resizeEvent)

  self.destroy = function() {
    // Decouple event listener
    $(window).off('resize', resizeEvent);

    // Destroy sequence
    self.sequence.destroy();

    // Destroy events
    self.panEvents && self.panEvents.destroy();
  };

  // Update translation
  _updateMasterTranslate.call(self);


  ///////////////
  // RENDERING //
  ///////////////

  var ScrollViewRender = function ScrollViewRender(timestamp) {

    // Set the currentTime
    self.currentTime = timestamp;
    // Render this scroll


    if (self.transition) {
      // Progress factor
      var factor = (self.duration - (self.destinationTime - timestamp)) / self.duration;
      // factor interval: [0..1]
      factor = Math.max(0, Math.min(1, factor));
      // Do animation
      // XXX: We can make other more natural animations - this is just for test
      self.last = self.current;
      var currentPosition = self.transition(factor);
      self.current = new ScrollPosition(currentPosition, self.child);

      if (factor == 1) {
        // Stop transition when done
        self.transition = null;
        // Trigger snap event
        self.emit('snapEnd', self.destination.toObject());
      }

    } else {
      // Get diff to see if we need to move anything
      var diffMove = self.current.diff(self.destination);
      if (diffMove.position.x || diffMove.position.y) {
        // Something have changed
        self.last = self.current;
        self.current = self.destination.clone();
      }
    }

    // XXX: We should have a package that detects device density in order for us
    // to calculate the proper accuratcy of position
    var X = Math.round(self.current.x * 10) / 10;
    var Y = Math.round(self.current.y * 10) / 10;

    // Break from animation loop - nothing need to be updated on screen if
    // coordinates are not updated
    if (X !== lX || Y !== lY) {

      lX = X;
      lY = Y;

      // Set the modulus position on the container div - we dont change
      // positions of the child containers them self

      var diff = self.last.diff(self.current);

      if (Math.abs(diff.position.x) > 0 || Math.abs(diff.position.y) > 0) {
        // We need to animate

        if (Math.abs(diff.index.y) > 0) {
          // XXX: vertical scroll not implemented
        }

        if (Math.abs(diff.offset.x) > 0 || Math.abs(diff.offset.y) > 0) {
          // Update container position
          _updateMasterTranslate.call(self);
        }

      } // EO Animate

    }

    // Render this view in next tick
    if (!self.isDestroyed)
      Kernel.onRender(ScrollViewRender);

  }; // EO Render function

  // Start rendering this view
  if (!self.isDestroyed)
    Kernel.onRender(ScrollViewRender);

  ////////////
  // EVENTS //
  ////////////

  if (self.options.handleEvents) {

    // Add pan event listener on the container
    self.panEvents = new Events.Pan(container);

    // Pan start event
    self.panEvents.on('start', function () {
      // Stop any transition animations
      self.destinationTime = 0;
    });
    // Pan move event
    self.panEvents.on('move', function (evt) {
      // XXX: Accellerate mass

      // Move the scroller
      if (self.options.direction === 0) {
        self.destination.x -= evt.delta.x;
      } else {
        self.destination.y -= evt.delta.y;
      }
    });

    // Pan end event
    self.panEvents.on('end', function (evt) {
      // A slow release triggers a stop and we go to the nearst index
      if (evt.releaseTime > self.options.releaseLimit) {
        evt.velocity.x = 0;
        evt.velocity.y = 0;
      }

      // Lock direction
      if (self.options.direction === 0) {
        evt.velocity.y = 0;
      } else {
        evt.velocity.x = 0;
      }

      var velocity = {
        x: evt.velocity.x * Math.abs(evt.velocity.x),
        y: evt.velocity.y * Math.abs(evt.velocity.y)
      };

      // Get the active velocity
      var v = (self.options.direction === 0) ? Math.abs(evt.velocity.x) : Math.abs(evt.velocity.y);

      // Change duration depending on velocity
      self.duration = Math.min(Math.max(self.options.minimumDuration, self.options.pagePeriod * v * self.options.scrollWeight), self.options.maximumDuration);

      // Calculate destination time
      self.destinationTime = self.currentTime + self.duration;

      // Get the destination
      self.destination = getVelocityDestination(self.current, velocity, true, self.options.resistance);

      // Set the transition function
      self.transition = self.interpolator.create(self.current.position(), self.destination.position(), self.duration);

      // XXX: We can use css transitions instead:
      // transitionElement(self.container, 'all ' + self.duration + 'ms ease-in-out');
      // translateElement(self.container, -self.destination.x, 0);

      // Emit index changed event
      self.emit('indexChanged', self.destination.toObject());

    });

  }
  // var i = 0;
  // Meteor.setInterval(function triggerScrollTo() {
  //   i += self.child.width * 10;
  //   self.scrollTo(i, 5000);
  // }, 5000);

  // Set events enabled
  this.sequence.eventsEnabled = self.eventsEnabled;

};

/*jshint ignore:end,-W101*/
