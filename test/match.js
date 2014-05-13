var assert = require('assert')

var routington = require('../index')

describe('Route matching', function () {
  it('should match the root path', function () {
    var router = routington()
    var routes = router.define('')

    var match = router.match('')
    assert.deepEqual(match.param, {});
    assert.deepEqual(match.node, routes[0]);
  })

  it('should match a top level path', function () {
    var router = routington()
    var routes = router.define('/favicon')

    var match = router.match('/favicon')
    assert.deepEqual(match.param, {});
    assert.deepEqual(match.node, routes[0]);
  })

  it('should match a named parameter', function () {
    var router = routington()
    var routes = router.define('/:id')

    var match = router.match('/asdf')
    assert.deepEqual(match.param, {
      id: 'asdf'
    });
    assert.deepEqual(match.node, routes[0]);
  })

  it('should match a regex', function () {
    var router = routington()
    var route = router.define('/:id(\\w{3,30})').shift()

    var match = router.match('/asdf')
    assert.deepEqual(match.param, {
      id: 'asdf'
    });
    assert.deepEqual(match.node, route);

    assert(router.match('/a') == null);
  })

  it('should match the first declared regex', function () {
    var router = routington()
    router.define('/:id(\\w{3,30})')
    router.define('/:id([0-9a-f]{24})')

    var match = router.match('/asdfasdfasdfasdfasdfasdf')
    assert.deepEqual(match.param, {
      id: 'asdfasdfasdfasdfasdfasdf'
    });
    assert.equal(match.node.regex.toString(), '/^(\\w{3,30})$/i');
  })

  it('should match strings over regex', function () {
    var router = routington()
    router.define('/asdf')
    router.define('/:id(\\w{3,30})')

    var match = router.match('/asdf')
    assert.deepEqual(match.param, {});
    assert.equal(match.node.string, 'asdf');
  })

  it('should not overwrite generically named routes', function () {
    var router = routington()
    router.define('/:id')
    router.define('/:id(.*)')

    var match = router.match('/a')
    assert.deepEqual(match.param, {
      id: 'a'
    });
    assert(match.node.parent.regex == null);
  })

  it('should be case sensitive with strings, but not regexs', function () {
    var router = routington()
    router.define('/asdf')
    router.define('/:id([0-9A-F]+)')

    assert(router.match('/ASDF') == null);
    assert(router.match('/asdf'));
    assert(router.match('/a0b'));
    assert(router.match('/A0B'));
  })

  it('should not match Object.prototype properties', function () {
    var router = routington()
    router.define('/')
    
    assert(router.match('/__proto__') == null);
    assert(router.match('/hasOwnProperty') == null);
  })

  it('/:path should not match /', function () {
    var router = routington()

    assert(router.match('/:path') == null);
  })

  it('should match encoded paths', function () {
    var router = routington()

    router.define('/page/:name(@\\w+)')

    assert(router.match('/page/@jongleberry'));
    assert(router.match('/page/%40jongleberry'));
  })

  it('should throw on malformed paths', function () {
    var router = routington()

    router.define('/page/:name(@\\w+)')

    assert.throws(function () {
      router.match('/page/%%%')
    })
  })
})
