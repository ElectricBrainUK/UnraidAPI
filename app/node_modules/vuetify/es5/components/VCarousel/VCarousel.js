'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('../../../src/stylus/components/_carousel.styl');

var _VWindow = require('../VWindow/VWindow');

var _VWindow2 = _interopRequireDefault(_VWindow);

var _VBtn = require('../VBtn');

var _VBtn2 = _interopRequireDefault(_VBtn);

var _VIcon = require('../VIcon');

var _VIcon2 = _interopRequireDefault(_VIcon);

var _buttonGroup = require('../../mixins/button-group');

var _buttonGroup2 = _interopRequireDefault(_buttonGroup);

var _helpers = require('../../util/helpers');

var _console = require('../../util/console');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Utilities

// Extensions
exports.default = _VWindow2.default.extend({
    name: 'v-carousel',
    props: {
        cycle: {
            type: Boolean,
            default: true
        },
        delimiterIcon: {
            type: String,
            default: '$vuetify.icons.delimiter'
        },
        height: {
            type: [Number, String],
            default: 500
        },
        hideControls: Boolean,
        hideDelimiters: Boolean,
        interval: {
            type: [Number, String],
            default: 6000,
            validator: function validator(value) {
                return value > 0;
            }
        },
        mandatory: {
            type: Boolean,
            default: true
        },
        nextIcon: {
            type: [Boolean, String],
            default: '$vuetify.icons.next'
        },
        prevIcon: {
            type: [Boolean, String],
            default: '$vuetify.icons.prev'
        }
    },
    data: function data() {
        return {
            changedByDelimiters: false,
            internalHeight: this.height,
            slideTimeout: undefined
        };
    },

    computed: {
        isDark: function isDark() {
            return this.dark || !this.light;
        }
    },
    watch: {
        internalValue: function internalValue(val) {
            this.restartTimeout();
            /* @deprecate */
            /* istanbul ignore else */
            if (!this.$listeners['input']) return;
            this.$emit('input', val);
        },

        interval: 'restartTimeout',
        height: function height(val, oldVal) {
            if (val === oldVal || !val) return;
            this.internalHeight = val;
        },
        cycle: function cycle(val) {
            if (val) {
                this.restartTimeout();
            } else {
                clearTimeout(this.slideTimeout);
                this.slideTimeout = undefined;
            }
        }
    },
    mounted: function mounted() {
        /* @deprecate */
        /* istanbul ignore next */
        if (this.$listeners['input']) {
            (0, _console.deprecate)('@input', '@change', this);
        }
        this.startTimeout();
    },

    methods: {
        genDelimiters: function genDelimiters() {
            return this.$createElement('div', {
                staticClass: 'v-carousel__controls'
            }, [this.genItems()]);
        },
        genIcon: function genIcon(direction, icon, fn) {
            var _this = this;

            return this.$createElement('div', {
                staticClass: 'v-carousel__' + direction
            }, [this.$createElement(_VBtn2.default, {
                props: {
                    icon: true
                },
                attrs: {
                    'aria-label': this.$vuetify.t('$vuetify.carousel.' + direction)
                },
                on: {
                    click: function click() {
                        _this.changedByDelimiters = true;
                        fn();
                    }
                }
            }, [this.$createElement(_VIcon2.default, {
                props: { 'size': '46px' }
            }, icon)])]);
        },
        genIcons: function genIcons() {
            var icons = [];
            var prevIcon = this.$vuetify.rtl ? this.nextIcon : this.prevIcon;
            if (prevIcon && typeof prevIcon === 'string') {
                icons.push(this.genIcon('prev', prevIcon, this.prev));
            }
            var nextIcon = this.$vuetify.rtl ? this.prevIcon : this.nextIcon;
            if (nextIcon && typeof nextIcon === 'string') {
                icons.push(this.genIcon('next', nextIcon, this.next));
            }
            return icons;
        },
        genItems: function genItems() {
            var _this2 = this;

            var length = this.items.length;
            var children = [];
            for (var i = 0; i < length; i++) {
                var child = this.$createElement(_VBtn2.default, {
                    class: {
                        'v-carousel__controls__item': true
                    },
                    props: {
                        icon: true,
                        small: true,
                        value: this.getValue(this.items[i], i)
                    }
                }, [this.$createElement(_VIcon2.default, {
                    props: { size: 18 }
                }, this.delimiterIcon)]);
                children.push(child);
            }
            return this.$createElement(_buttonGroup2.default, {
                props: {
                    value: this.internalValue
                },
                on: {
                    change: function change(val) {
                        _this2.internalValue = val;
                    }
                }
            }, children);
        },
        restartTimeout: function restartTimeout() {
            this.slideTimeout && clearTimeout(this.slideTimeout);
            this.slideTimeout = undefined;
            var raf = requestAnimationFrame || setTimeout;
            raf(this.startTimeout);
        },
        startTimeout: function startTimeout() {
            if (!this.cycle) return;
            this.slideTimeout = window.setTimeout(this.next, +this.interval > 0 ? +this.interval : 6000);
        },
        updateReverse: function updateReverse(val, oldVal) {
            if (this.changedByDelimiters) {
                this.changedByDelimiters = false;
                return;
            }
            _VWindow2.default.options.methods.updateReverse.call(this, val, oldVal);
        }
    },
    render: function render(h) {
        var children = [];
        var data = {
            staticClass: 'v-window v-carousel',
            style: {
                height: (0, _helpers.convertToUnit)(this.height)
            },
            directives: []
        };
        if (!this.touchless) {
            data.directives.push({
                name: 'touch',
                value: {
                    left: this.next,
                    right: this.prev
                }
            });
        }
        if (!this.hideControls) {
            children.push(this.genIcons());
        }
        if (!this.hideDelimiters) {
            children.push(this.genDelimiters());
        }
        return h('div', data, [this.genContainer(), children]);
    }
});
// Mixins
// TODO: Move this into core components v2.0

// Components
// Styles
//# sourceMappingURL=VCarousel.js.map