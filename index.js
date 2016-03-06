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

  return function plugin(app) {
    if (!app.enabled('logger')) {
      return;
    }

    if (app.isRegistered('base-logger')) {
      return;
    }

    var self = this;
    var Logger = utils.verbalize.create();
    var logger = new Logger();
    utils.sync(logger, 'options', function() {
      return self.options;
    });

    logger.on('emitter', addMethod(this));
    logger.on('style', addMethod(this));
    logger.on('mode', addMethod(this));

    addMethods(this, logger.emitterKeys);
    addMethods(this, logger.modeKeys);
    addMethods(this, logger.styleKeys);

    if (opts.defaultListener === true) {
      logger.on('*', function(name, stats) {
        this.format(stats);
      });
    }

    this.define('logger', {
      enumerable: true,
      configurable: true,
      get: function() {
        function fn() {
          return logger.log(...arguments);
        }
        fn.__proto__ = logger;
        return fn;
      }
    });

    function hasMethod(app, name) {
      if (name in app) {
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

    function addMethods(app, methods) {
      var add = addMethod(app, true);
      var len = methods.length, i = -1;
      while (++i < len) {
        add(methods[i]);
      }
    }
  };
};
