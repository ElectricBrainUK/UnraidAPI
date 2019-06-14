'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('../../../src/stylus/components/_system-bars.styl');

var _applicationable = require('../../mixins/applicationable');

var _applicationable2 = _interopRequireDefault(_applicationable);

var _colorable = require('../../mixins/colorable');

var _colorable2 = _interopRequireDefault(_colorable);

var _themeable = require('../../mixins/themeable');

var _themeable2 = _interopRequireDefault(_themeable);

var _mixins = require('../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _mixins2.default)((0, _applicationable2.default)('bar', ['height', 'window']), _colorable2.default, _themeable2.default
/* @vue/component */
).extend({
    name: 'v-system-bar',
    props: {
        height: {
            type: [Number, String],
            validator: function validator(v) {
                return !isNaN(parseInt(v));
            }
        },
        lightsOut: Boolean,
        status: Boolean,
        window: Boolean
    },
    computed: {
        classes: function classes() {
            return _extends({
                'v-system-bar--lights-out': this.lightsOut,
                'v-system-bar--absolute': this.absolute,
                'v-system-bar--fixed': !this.absolute && (this.app || this.fixed),
                'v-system-bar--status': this.status,
                'v-system-bar--window': this.window
            }, this.themeClasses);
        },
        computedHeight: function computedHeight() {
            if (this.height) return parseInt(this.height);
            return this.window ? 32 : 24;
        }
    },
    methods: {
        /**
         * Update the application layout
         *
         * @return {number}
         */
        updateApplication: function updateApplication() {
            return this.computedHeight;
        }
    },
    render: function render(h) {
        var data = {
            staticClass: 'v-system-bar',
            'class': this.classes,
            style: {
                height: this.computedHeight + 'px'
            }
        };
        return h('div', this.setBackgroundColor(this.color, data), this.$slots.default);
    }
});
//# sourceMappingURL=VSystemBar.js.map