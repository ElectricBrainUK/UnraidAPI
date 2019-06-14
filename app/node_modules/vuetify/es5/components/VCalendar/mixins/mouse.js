'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = _vue2.default.extend({
    name: 'mouse',
    methods: {
        getDefaultMouseEventHandlers: function getDefaultMouseEventHandlers(suffix, getEvent) {
            var _getMouseEventHandler;

            return this.getMouseEventHandlers((_getMouseEventHandler = {}, _defineProperty(_getMouseEventHandler, 'click' + suffix, { event: 'click' }), _defineProperty(_getMouseEventHandler, 'contextmenu' + suffix, { event: 'contextmenu', prevent: true, result: false }), _defineProperty(_getMouseEventHandler, 'mousedown' + suffix, { event: 'mousedown' }), _defineProperty(_getMouseEventHandler, 'mousemove' + suffix, { event: 'mousemove' }), _defineProperty(_getMouseEventHandler, 'mouseup' + suffix, { event: 'mouseup' }), _defineProperty(_getMouseEventHandler, 'mouseenter' + suffix, { event: 'mouseenter' }), _defineProperty(_getMouseEventHandler, 'mouseleave' + suffix, { event: 'mouseleave' }), _defineProperty(_getMouseEventHandler, 'touchstart' + suffix, { event: 'touchstart' }), _defineProperty(_getMouseEventHandler, 'touchmove' + suffix, { event: 'touchmove' }), _defineProperty(_getMouseEventHandler, 'touchend' + suffix, { event: 'touchend' }), _getMouseEventHandler), getEvent);
        },
        getMouseEventHandlers: function getMouseEventHandlers(events, getEvent) {
            var _this = this;

            var on = {};

            var _loop = function _loop(event) {
                var eventOptions = events[event];
                if (!_this.$listeners[event]) return 'continue';
                // TODO somehow pull in modifiers
                var prefix = eventOptions.passive ? '&' : (eventOptions.once ? '~' : '') + (eventOptions.capture ? '!' : '');
                var key = prefix + eventOptions.event;
                var handler = function handler(e) {
                    var mouseEvent = e;
                    if (eventOptions.button === undefined || mouseEvent.buttons > 0 && mouseEvent.button === eventOptions.button) {
                        if (eventOptions.prevent) {
                            e.preventDefault();
                        }
                        if (eventOptions.stop) {
                            e.stopPropagation();
                        }
                        _this.$emit(event, getEvent(e));
                    }
                    return eventOptions.result;
                };
                if (key in on) {
                    if (Array.isArray(on[key])) {
                        on[key].push(handler);
                    } else {
                        on[key] = [on[key], handler];
                    }
                } else {
                    on[key] = handler;
                }
            };

            for (var event in events) {
                var _ret = _loop(event);

                if (_ret === 'continue') continue;
            }
            return on;
        }
    }
});
//# sourceMappingURL=mouse.js.map