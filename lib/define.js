var Routington = require('./routington')
var util = require('util')

/*

  @route {string}

  returns []routington

*/
Routington.prototype.define = function (route) {
  if (typeof route !== 'string')
    throw new TypeError('Only strings can be defined.')

  try {
    return Define(route.split('/'), this)
  } catch (err) {
    err.route = route
    throw err
  }
}

function Define(frags, root) {
  var frag = frags[0]
  var info = Routington.parse(frag)
  var name = info.name

  var nodes = Object.keys(info.string).map(function (x) {
    return {
      name: name,
      string: x
    }
  })

  if (info.regex) {
    nodes.push({
      name: name,
      regex: info.regex
    })
  }

  if (!nodes.length) {
    nodes = [{
      name: name
    }]
  }

  nodes = nodes.map(root._add, root)

  return frags.length - 1
    ? flatten(nodes.map(function (node) {
        return Define(frags.slice(1), node)
      }))
    : nodes
}

function flatten(arr, tmp) {
  tmp = tmp || []

  if (util.isArray(arr)) {
    arr.forEach(function (x) {
      flatten(x, tmp)
    })
  } else {
    tmp.push(arr)
  }

  return tmp
}