var assert = require('assert')

var routington = require('../index')

var parse = routington.parse

describe('Parse', function () {
  it('should parse a null string', function () {
    assert.deepEqual(parse(''), {
      name: '',
      string: {
        '': true
      },
      regex: ''
    })
  })

  it('should parse a word string', function () {
    assert.deepEqual(parse('asdf'), {
      name: '',
      string: {
        'asdf': true
      },
      regex: ''
    })
  })

  it('should allow - and _ in strings', function () {
    assert.deepEqual(parse('a-b_-a'), {
      name: '',
      string: {
        'a-b_-a': true
      },
      regex: ''
    })
  })

  it('should parse a named parameter', function () {
    assert.deepEqual(parse(':id'), {
      name: 'id',
      string: {},
      regex: ''
    })
  })

  it('should parse a named parameter with strings', function () {
    assert.deepEqual(parse(':id(one|two)'), {
      name: 'id',
      string: {
        'one': true,
        'two': true
      },
      regex: ''
    })
  })

  it('should parse a named parameter with regexs', function () {
    assert.deepEqual(parse(':id(\\w{3,30}|[0-9a-f]{24})'), {
      name: 'id',
      string: {},
      regex: '\\w{3,30}|[0-9a-f]{24}'
    })
  })

  it('should parse a named parameter with regexs and strings as a regex', function () {
    assert.deepEqual(parse(':id(\\w{3,30}|asdf)'), {
      name: 'id',
      string: {},
      regex: '\\w{3,30}|asdf'
    })
  })

  it('should parse pipe separated strings', function () {
    assert.deepEqual(parse('asdf|qwer'), {
      name: '',
      string: {
        'asdf': true,
        'qwer': true
      },
      regex: ''
    })
  })

  it('should throw on invalid pipe separated strings', function () {
    assert.throws(function () {
      parse('asdf|$$$')
    })
  })

  it('should parse unnamed regexs', function () {
    assert.deepEqual(parse('(\\w+|\\d+)'), {
      name: '',
      string: {},
      regex: '\\w+|\\d+'
    })
  })

  /*
  it('should parse trailing ?', function () {
    parse(':id?').should.eql({
      name: 'id',
      string: {
        '': true
      },
      regex: ''
    })
  })
  */

  it('should throw on invalid parameters', function () {
    ;[
      '*',
      ':id*',
      '*a',
      'a*',
      ':',
      ':()'
    ].forEach(function (x) {
      assert.throws(function () {
        parse(x)
      }, x)
    })
  })

  it('should not throw on oddly piped parameters', function () {
    ;[
      'a|b',
      'a||b',
      ':a(|b|c)',
      ':b(|c||d)'
    ].forEach(function (x) {
      assert.doesNotThrow(function () {
        parse(x)
      }, x)
    })
  })

  it('should support regular expressions with pipes', function () {
    assert.deepEqual(parse(':id([0-9a-f]{24}\\.[olmsta]\\.(jpg|png))'), {
      name: 'id',
      string: {},
      regex: '[0-9a-f]{24}\\.[olmsta]\\.(jpg|png)'
    })
  })

  it('should parse strings with a `.` as a string', function () {
    assert.deepEqual(parse('blog.rss'), {
      name: '',
      string: {
        'blog.rss': true
      },
      regex: ''
    })

    assert.deepEqual(parse(':nav(blog.rss)'), {
      name: 'nav',
      string: {
        'blog.rss': true
      },
      regex: ''
    })
  })

  it('should parse strings with a `-` as a string', function () {
    assert.deepEqual(parse('privacy-policy'), {
      name: '',
      string: {
        'privacy-policy': true
      },
      regex: ''
    })

    assert.deepEqual(parse(':nav(privacy-policy|terms-of-service)'), {
      name: 'nav',
      string: {
        'privacy-policy': true,
        'terms-of-service': true
      },
      regex: ''
    })
  })
})
