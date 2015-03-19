dispatch:scrollview
===================

This package adds a high performance infinite scrollview. It uses Blaze and Meteors reactive data.

Limits at the moment / todo:
* List have to be infinite - theres currently no way of limiting scroll
* Still not user friendly - it should be safely contained as a ui block helper
* Data cells have to be uniform in size - this will not change
* Currently only support horisontal scrolling

### Example
```js
  var list = new ScrollView({

    // Where scroll view will be injected
    container: container,

    // Template to render { index: 0 } - can be positive and negative
    template: Template.dateListItem,

    // Offset if any percent or pixels
    offset: [-0.5, 0],

    // Width, Height - percent/pixels/undefined
    size: [65, undefined],

    // 'spring', [250, 15], 'ease' etc... Read docs for dispatch:interpolator
    ease: 'iosScroll',

    // Preload pages on each invisible side (ajust when using offset)
    preload: {
      x: 2,
      y: 0
    },

    // Set initial index
    index: {
      x: 0,
      y: 0
    }

    // Scroll parameters
    resistance: 0.001,
    pagePeriod: 200,
    scrollWeight: 10,
    minimumDuration: 200,
    maximumDuration: 1000,


    debug: false
  });
```

API:
```js
  list.on
  list.emit
  list.disableEvents
  list.enableEvents
  list.currentIndex
  list.destroy

  // Move to coordinate
  list.moveTo({ x, y });

  // Scroll to coordinate
  list.scrollTo({ x, y }, duration);

  // Simply scrolls from one index to another - use carefully, mind the speed
  list.scrollToIndex({ x, y }, duration);

  // Jump will scroll directly into the new sequence if
  // far away
  list.jumpToIndex({ x, y }, duration);
```