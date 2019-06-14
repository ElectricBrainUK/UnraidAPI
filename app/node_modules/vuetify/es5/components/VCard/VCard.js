'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Styles

// Extensions

// Mixins

// Helpers


require('../../../src/stylus/components/_cards.styl');

var _VSheet = require('../VSheet');

var _VSheet2 = _interopRequireDefault(_VSheet);

var _routable = require('../../mixins/routable');

var _routable2 = _interopRequireDefault(_routable);

var _mixins = require('../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* @vue/component */
exports.default = (0, _mixins2.default)(_routable2.default, _VSheet2.default).extend({
    name: 'v-card',
    props: {
        flat: Boolean,
        hover: Boolean,
        img: String,
        raised: Boolean
    },
    computed: {
        classes: function classes() {
            return _extends({
                'v-card': true,
                'v-card--flat': this.flat,
                'v-card--hover': this.hover
            }, _VSheet2.default.options.computed.classes.call(this));
        },
        styles: function styles() {
            var style = _extends({}, _VSheet2.default.options.computed.styles.call(this));
            if (this.img) {
                style.background = 'url("' + this.img + '") center center / cover no-repeat';
            }
            return style;
        }
    },
    render: function render(h) {
        var _generateRouteLink = this.generateRouteLink(this.classes),
            tag = _generateRouteLink.tag,
            data = _generateRouteLink.data;

        data.style = this.styles;
        return h(tag, this.setBackgroundColor(this.color, data), this.$slots.default);
    }
});
//# sourceMappingURL=VCard.js.map