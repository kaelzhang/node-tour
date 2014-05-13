var assert = require('assert')

var routington = require('../index')

describe('Route definitions', function () {
  it('should create the root', function () {
    var router = routington()
    assert(router instanceof routington)

    var routes = router.define('')
    assert.equal(routes.length, 1)

    var route = routes[0]
    assert(route instanceof routington)
    assert.equal(route.string, '')
    assert.equal(route.name, '')
    assert.equal(route.parent, router)

    assert(router.child[''], route)

    var routes2 = router.define('/')
    assert(routes2.length, 1)
    assert.equal(routes2[0].parent, route)
  })

  it('should create a first level child', function () {
    var router = routington()

    var routes = router.define('/asdf')
    assert(routes.length, 1)

    var route = routes[0]
    assert.equal(route.string, 'asdf')
    assert.equal(route.name, '')
    assert.equal(route.parent.parent, router)
    assert.equal(route.parent.child['asdf'], route)

    route = route.parent
    assert.equal(route.string, '')
    assert.equal(route.name, '')
    assert.equal(route.parent, router)
  })

  it('should create a second level child', function () {
    var router = routington()

    var routes = router.define('/asdf/wqer')
    assert.equal(routes.length, 1)

    var route = routes[0]
    assert.equal(route.string, 'wqer')

    var parent = route.parent
    assert.equal(parent.string, 'asdf')
    assert.equal(parent.parent.string, '')
    assert.equal(parent.parent.parent, router)
  })

  it('should define a named route', function () {
    var router = routington()

    var routes = router.define('/:id')
    assert.equal(routes.length, 1)

    var route = routes[0]
    assert.equal(route.name, 'id')

    var parent = route.parent
    assert.equal(parent.string, '')
  })

  it('should define a regex route', function () {
    var router = routington()

    var routes = router.define('/:id(\\w{3,30})')
    assert.equal(routes.length, 1)

    var route = routes[0]
    assert.equal(route.name, 'id')
    assert.equal(route.regex.toString(), '/^(\\w{3,30})$/i')
    assert.ok(route.regex.test('asd'))
    assert.ok(!route.regex.test('a'))
  })

  it('should define multiple regex routes', function () {
    var router = routington()

    var routes = router.define('/:id(\\w{3,30}|[0-9a-f]{24})')
    assert.equal(routes.length, 1)

    var route = routes[0]
    assert.equal(route.name, 'id')
    assert.equal(route.regex.toString(),'/^(\\w{3,30}|[0-9a-f]{24})$/i')
    assert.ok(route.regex.test('asdf'))
    assert.ok(route.regex.test('1234123412341234'))
    assert.ok(!route.regex.test('a'))
  })

  it('should define multiple unnamed regex routes', function () {
    var router = routington()

    var routes = router.define('/(\\w{3,30}|[0-9a-f]{24})')
    assert.equal(routes.length, 1)

    var route = routes[0]
    assert.equal(route.name, '')
    assert.equal(route.regex.toString(), '/^(\\w{3,30}|[0-9a-f]{24})$/i')
    assert(route.regex.test('asdf'))
    assert(route.regex.test('1234123412341234'))
    assert.ok(!route.regex.test('a'))
  })

  it('should define multiple string routes', function () {
    var router = routington()

    var routes = router.define('/asdf|qwer')
    assert.equal(routes.length, 2)

    var route1 = routes[0]
    assert.equal(route1.name, '')
    assert.equal(route1.string, 'asdf')

    var route2 = routes[1]
    assert.equal(route2.name, '')
    assert.equal(route2.string, 'qwer')
  })

  it('should define multiple string routes using regex', function () {
    var router = routington()

    var routes = router.define('/:id(asdf|qwer)')
    assert.equal(routes.length, 2)

    var route1 = routes[0]
    assert.equal(route1.name, 'id')
    assert.equal(route1.string, 'asdf')

    var route2 = routes[1]
    assert.equal(route2.name, 'id')
    assert.equal(route2.string, 'qwer')
  })

  it('should not duplicate string routes', function () {
    var router = routington()

    var routes2 = router.define('/asdf')
    assert.equal(routes2.length, 1)
    var route2 = routes2[0]

    var routes1 = router.define('/:id(asdf)')
    assert.equal(routes1.length, 1)
    var route1 = routes1[0]

    assert.equal(route1, route2)
    assert.equal(route1.name, '')
    assert.equal(route2.name, '')
  })

  it('should multiply every child', function () {
      var router = routington()

      assert.equal(router.define('/a|b/c|d').length , 4)
      assert.equal(router.define('/a|b|c/d|e|f').length, 9)
      assert.equal(router.define('/1|4/2|3/6|2').length, 8)
  })

  it('should care for trailing slashes', function () {
    var router = routington()

    var routes1 = router.define('/asdf/')
    assert.equal(routes1.length, 1)

    var routes2 = router.define('/asdf')
    assert.equal(routes2.length, 1)

    assert.notEqual(routes1[0], routes2[0])
  })

  it('should care for null or root paths', function () {
    var router = routington()

    var routes1 = router.define('')
    assert.equal(routes1.length, 1)

    var routes2 = router.define('/')
    assert.equal(routes2.length, 1)

    assert.notEqual(routes1[0], routes2[0])
  })

  // To do:
  // Routers like /asdf*asdf
  it('should not support * outside a regex', function () {
    var router = routington()

    assert.throws(function () {
      router.define('/*')
    })
    assert.throws(function () {
      router.define('/asdf/*')
    })
    assert.throws(function () {
      router.define('/*asdf')
    })
    assert.throws(function () {
      router.define('/asdf*')
    })
    assert.throws(function () {
      router.define('/*?')
    })

    assert.doesNotThrow(function () {
      router.define('/:id(.*)')
    })
  })
})
