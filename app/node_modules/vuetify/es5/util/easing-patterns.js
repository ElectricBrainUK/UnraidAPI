'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _easingPatterns = require('../components/Vuetify/goTo/easing-patterns');

Object.keys(_easingPatterns).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _easingPatterns[key];
    }
  });
});

var _console = require('./console');

(0, _console.deprecate)('vuetify/es5/util/easing-patterns', 'vuetify/es5/Vuetify/goTo/easing-patterns');
//# sourceMappingURL=easing-patterns.js.map