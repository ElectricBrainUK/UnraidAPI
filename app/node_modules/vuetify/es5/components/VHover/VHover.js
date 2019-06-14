'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _delayable = require('../../mixins/delayable');

var _delayable2 = _interopRequireDefault(_delayable);

var _toggleable = require('../../mixins/toggleable');

var _toggleable2 = _interopRequireDefault(_toggleable);

var _mixins = require('../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

var _console = require('../../util/console');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Utilities
// Mixins
exports.default = (0, _mixins2.default)(_delayable2.default, _toggleable2.default
/* @vue/component */
).extend({
    name: 'v-hover',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        value: {
            type: Boolean,
            default: undefined
        }
    },
    methods: {
        onMouseEnter: function onMouseEnter() {
            this.runDelay('open');
        },
        onMouseLeave: function onMouseLeave() {
            this.runDelay('close');
        }
    },
    render: function render() {
        if (!this.$scopedSlots.default && this.value === undefined) {
            (0, _console.consoleWarn)('v-hover is missing a default scopedSlot or bound value', this);
            return null;
        }
        var element = void 0;
        if (this.$scopedSlots.default) {
            element = this.$scopedSlots.default({ hover: this.isActive });
        } else if (this.$slots.default && this.$slots.default.length === 1) {
            element = this.$slots.default[0];
        }
        if (Array.isArray(element) && element.length === 1) {
            element = element[0];
        }
        if (!element || Array.isArray(element) || !element.tag) {
            (0, _console.consoleWarn)('v-hover should only contain a single element', this);
            return element;
        }
        if (!this.disabled) {
            element.data = element.data || {};
            this._g(element.data, {
                mouseenter: this.onMouseEnter,
                mouseleave: this.onMouseLeave
            });
        }
        return element;
    }
});
//# sourceMappingURL=VHover.js.map