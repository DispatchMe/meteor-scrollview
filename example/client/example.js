var currentIndex = new ReactiveVar(0);

Template.item.helpers({
  text: function(evt, temp) {
    // Return the index x value - this can be -+
    return this.index.x;
  }
});


Template.itemlist.events({
  'click .btn-jump-backwards': function(evt, temp) {
    var current = temp.datelist.currentIndex();
    temp.datelist.jumpToIndex(current.x - 1000, 300);
  },
  'click .btn-jump-to-0': function(evt, temp) {
    temp.datelist.jumpToIndex(0, 300);
  },
  'click .btn-jump-forwards': function(evt, temp) {
    var current = temp.datelist.currentIndex();
    temp.datelist.jumpToIndex(current.x + 1000, 300);
  },
  'click .btn-scrollto-neg10': function(evt, temp) {
    temp.datelist.scrollToIndex(-10, 300);
  },
  'click .btn-scrollto-0': function(evt, temp) {
    temp.datelist.scrollToIndex(0, 300);
  },
  'click .btn-scrollto-pos10': function(evt, temp) {
    temp.datelist.scrollToIndex(10, 300);
  }
});

Template.itemlist.rendered = function () {
  var self = this;

  // Create scroll view for date list
  self.datelist = new ScrollView({
    // Grab the container element
    container: self.find('.container'),
    // The meteor template to render, data context format is {date: new Date()}
    template: Template.item,
    offset: [0.5, 0],
    size: [65, undefined],  // Width, Height

    ease: 'iosScroll', // 'spring', [250, 15], 'ease' etc...

    // Scroll parameters
    resistance: 0.0001,
    pagePeriod: 200,
    scrollWeight: 10,
    minimumDuration: 200,
    maximumDuration: 1000,

    // Preload pages on each invisible side
    preload: {
      x: 2,
      y: 0
    },

    index: {
      x: currentIndex.get(),
      y: 0
    },

    debug: false
  });

};

Template.itemlist.destroyed = function () {
  if (this.datelist) this.datelist.destroy();
};