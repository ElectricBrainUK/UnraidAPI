'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Styles

// Mixins


require('../../../src/stylus/components/_subheaders.styl');

var _themeable = require('../../mixins/themeable');

var _themeable2 = _interopRequireDefault(_themeable);

var _mixins = require('../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _mixins2.default)(_themeable2.default
/* @vue/component */
).extend({
    name: 'v-subheader',
    props: {
        inset: Boolean
    },
    render: function render(h) {
        return h('div', {
            staticClass: 'v-subheader',
            class: _extends({
                'v-subheader--inset': this.inset
            }, this.themeClasses),
            attrs: this.$attrs,
            on: this.$listeners
        }, this.$slots.default);
    }
});
//# sourceMappingURL=VSubheader.js.map