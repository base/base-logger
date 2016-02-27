/*!
 * base-logger <https://github.com/node-base/base-logger>
 *
 * Copyright (c) 2016, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Add [verbalize][] instance to app as `.logger`.
 * Adds logger and mode methods to the `app` directly for easy logging.
 * Sets up a default listener to handle log events and write messages to
 * `process.stdout`
 *
 * Pass `options.defaultListener = false` to disable the default listener.
 *
 * ```js
 * var options {
 *   defaultListener: true
 * };
 *
 * app.use(logger(options));
 * app.verbose.info('info message');
 * ```
 * @param  {Objects} `options` Options used when creating the logger.
 * @return {Function} plugin function to pass to `app.use`
 * @api public
 */

module.exports = function logger(options) {
  var opts = utils.extend({defaultListener: true}, options);
  var Logger = utils.verbalize.create();

  return function plugin(app) {
    if (typeof this['logger'] !== 'undefined') return;
    var logger = new Logger();
    logger.options = this.options;
    logger.on('addLogger', addMethod(this));
    logger.on('addMode', addMethod(this));

    addMethods(this, logger.modifiers);
    addMethods(this, logger.modes);

    if (opts.defaultListener === true) {
      logger.on('*', function(name, stats) {
        this.handle(stats);
      });
    }

    this.define('logger', {
      enumerable: true,
      configurable: true,
      get: function() {
        function fn() {
          var args = [].slice.call(arguments);
          args.unshift('log');
          return logger._emit.apply(logger, args);
        }
        fn.__proto__ = logger;
        return fn;
      }
    });

    function hasMethod(app, name) {
      if (app.hasOwnProperty(name)) {
        return true;
      }
      return false;
    }

    function addMethod(app, init) {
      return function(name) {
        if (hasMethod(app, name)) {
          if (init) return;
          throw new Error('App "' + app._name + '" already has a method "' + name + '". Unable to add logger method "' + name + '".');
        }
        app.define(name, {
          enumerable: true,
          configurable: true,
          get: function() {
            return logger[name];
          }
        });
      };
    }

    function addMethods(app, obj) {
      var add = addMethod(app, true);
      var methods = Object.keys(obj);
      var len = methods.length, i = -1;
      while (++i < len) {
        add(methods[i]);
      }
    }
  };
};
