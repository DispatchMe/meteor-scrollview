/*jshint ignore:start,-W101*/ // allow long lines

Tinytest.add('dispatch:scroll-position - test', function(test) {
  test.isTrue(typeof ScrollPosition === 'function', 'ScrollPosition not declared?');
});

Tinytest.add('dispatch:scroll-position - test clone', function(test) {

  var foo = new ScrollPosition({ x: 0, y: 0 }, { width: 20, height: 20 });

  var bar = foo.clone();

  var diff = foo.diff(bar);

  // Test diff of clone
  test.equal(diff.index.x, 0, 'Difference in clone index.x');
  test.equal(diff.index.y, 0, 'Difference in clone index.y');
  test.equal(diff.offset.x, 0, 'Difference in clone offset.x');
  test.equal(diff.offset.y, 0, 'Difference in clone offset.y');
  test.equal(diff.position.x, 0, 'Difference in clone position.x');
  test.equal(diff.position.y, 0, 'Difference in clone position.y');


  var foo10 = new ScrollPosition({ x: 10, y: 0 }, { width: 20, height: 20 });

  var diff10 = foo.diff(foo10);

  // Test diff10 of foo 10
  test.equal(diff10.index.x, 0, 'Difference in foo 10 index.x');
  test.equal(diff10.index.y, 0, 'Difference in foo 10 index.y');
  test.equal(diff10.offset.x, 10, 'Difference in foo 10 offset.x');
  test.equal(diff10.offset.y, 0, 'Difference in foo 10 offset.y');
  test.equal(diff10.position.x, 10, 'Difference in foo 10 position.x');
  test.equal(diff10.position.y, 0, 'Difference in foo 10 position.y');


});



Tinytest.add('dispatch:scroll-position - test position', function(test) {

  var foo = new ScrollPosition({ x: 0, y: 0 }, { width: 10, height: 10 });

  for (var i = -30; i < 30; i++) {
    foo.x = i;
    test.equal(foo.position().x, i, 'Difference in foo ' + i + ' position.x');
  }

  for (var i = -30; i < 30; i++) {
    foo.y = i;
    test.equal(foo.position().y, i, 'Difference in foo ' + i + ' position.y');
  }

  for (var i = -30; i < 30; i++) {
    foo.y = i;
    test.equal(foo.position().y, i, 'Difference in foo ' + i + ' position.y');
  }

  for (var i = -30; i < 30; i++) {
    var index = null;

    if (i >= -30 && i < 20) index = -3;
    if (i >= -20 && i < -10) index = -2;
    if (i >= -10 && i < 0) index = -1;

    if (i >= 0 && i < 10) index = 0;

    if (i >= 10 && i < 20) index = 1;
    if (i >= 20 && i < 30) index = 2;

    foo.x = i;
    test.equal(foo.index().x, index, 'Difference in foo index at ' + i + ' position.y, got index ' + foo.index().x + ' should be ' + index);
  }

});

Tinytest.add('dispatch:scroll-position - test offset', function(test) {

  var foo = new ScrollPosition({ x: 0, y: 0 }, { width: 10, height: 10 });

  for (var i = -30; i < 30; i++) {
    foo.x = i;
    var o = (i + 100) % 10;
    test.equal(foo.offset().x, o, 'Difference in foo index at ' + i + ' position.y, got offset ' +foo.offset().x + ' should be ' + o);
  }

});

//Test API:
//test.isFalse(v, msg)
//test.isTrue(v, msg)
//test.equalactual, expected, message, not
//test.length(obj, len)
//test.include(s, v)
//test.isNaN(v, msg)
//test.isUndefined(v, msg)
//test.isNotNull
//test.isNull
//test.throws(func)
//test.instanceOf(obj, klass)
//test.notEqual(actual, expected, message)
//test.runId()
//test.exception(exception)
//test.expect_fail()
//test.ok(doc)
//test.fail(doc)
//test.equal(a, b, msg)

/*jshint ignore:end,-W101*/
