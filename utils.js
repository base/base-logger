'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

var fn = require;
require = utils; // eslint-disable-line no-native-reassign

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend');
require('define-property', 'define');
require('verbalize');

/**
 * Restore `require`
 */

require = fn; // eslint-disable-line no-native-reassign

utils.sync = function(obj, prop, val) {
  utils.define(obj, prop, {
    configurable: true,
    enumerable: true,
    set: function(v) {
      utils.define(obj, prop, v);
    },
    get: function() {
      if (typeof val === 'function') {
        return val.call(obj);
      }
      return val;
    }
  });
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
