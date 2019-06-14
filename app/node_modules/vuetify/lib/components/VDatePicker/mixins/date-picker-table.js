var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import '../../../../src/stylus/components/_date-picker-table.styl';
// Directives
import Touch from '../../../directives/touch';
// Mixins
import Colorable from '../../../mixins/colorable';
import Themeable from '../../../mixins/themeable';
// Utils
import isDateAllowed from '../util/isDateAllowed';
import mixins from '../../../util/mixins';
export default mixins(Colorable, Themeable
/* @vue/component */
).extend({
    directives: { Touch: Touch },
    props: {
        allowedDates: Function,
        current: String,
        disabled: Boolean,
        format: Function,
        events: {
            type: [Array, Function, Object],
            default: function _default() {
                return null;
            }
        },
        eventColor: {
            type: [Array, Function, Object, String],
            default: function _default() {
                return 'warning';
            }
        },
        locale: {
            type: String,
            default: 'en-us'
        },
        min: String,
        max: String,
        readonly: Boolean,
        scrollable: Boolean,
        tableDate: {
            type: String,
            required: true
        },
        value: [String, Array]
    },
    data: function data() {
        return {
            isReversing: false
        };
    },
    computed: {
        computedTransition: function computedTransition() {
            return this.isReversing === !this.$vuetify.rtl ? 'tab-reverse-transition' : 'tab-transition';
        },
        displayedMonth: function displayedMonth() {
            return Number(this.tableDate.split('-')[1]) - 1;
        },
        displayedYear: function displayedYear() {
            return Number(this.tableDate.split('-')[0]);
        }
    },
    watch: {
        tableDate: function tableDate(newVal, oldVal) {
            this.isReversing = newVal < oldVal;
        }
    },
    methods: {
        genButtonClasses: function genButtonClasses(isAllowed, isFloating, isSelected, isCurrent) {
            return _extends({
                'v-btn--active': isSelected,
                'v-btn--flat': !isSelected,
                'v-btn--icon': isSelected && isAllowed && isFloating,
                'v-btn--floating': isFloating,
                'v-btn--depressed': !isFloating && isSelected,
                'v-btn--disabled': !isAllowed || this.disabled && isSelected,
                'v-btn--outline': isCurrent && !isSelected
            }, this.themeClasses);
        },
        genButtonEvents: function genButtonEvents(value, isAllowed, mouseEventType) {
            var _this = this;

            if (this.disabled) return undefined;
            return {
                click: function click() {
                    isAllowed && !_this.readonly && _this.$emit('input', value);
                    _this.$emit('click:' + mouseEventType, value);
                },
                dblclick: function dblclick() {
                    return _this.$emit('dblclick:' + mouseEventType, value);
                }
            };
        },
        genButton: function genButton(value, isFloating, mouseEventType, formatter) {
            var isAllowed = isDateAllowed(value, this.min, this.max, this.allowedDates);
            var isSelected = value === this.value || Array.isArray(this.value) && this.value.indexOf(value) !== -1;
            var isCurrent = value === this.current;
            var setColor = isSelected ? this.setBackgroundColor : this.setTextColor;
            var color = (isSelected || isCurrent) && (this.color || 'accent');
            return this.$createElement('button', setColor(color, {
                staticClass: 'v-btn',
                'class': this.genButtonClasses(isAllowed, isFloating, isSelected, isCurrent),
                attrs: {
                    type: 'button'
                },
                domProps: {
                    disabled: this.disabled || !isAllowed
                },
                on: this.genButtonEvents(value, isAllowed, mouseEventType)
            }), [this.$createElement('div', {
                staticClass: 'v-btn__content'
            }, [formatter(value)]), this.genEvents(value)]);
        },
        getEventColors: function getEventColors(date) {
            var arrayize = function arrayize(v) {
                return Array.isArray(v) ? v : [v];
            };
            var eventData = void 0;
            var eventColors = [];
            if (Array.isArray(this.events)) {
                eventData = this.events.includes(date);
            } else if (this.events instanceof Function) {
                eventData = this.events(date) || false;
            } else if (this.events) {
                eventData = this.events[date] || false;
            } else {
                eventData = false;
            }
            if (!eventData) {
                return [];
            } else if (eventData !== true) {
                eventColors = arrayize(eventData);
            } else if (typeof this.eventColor === 'string') {
                eventColors = [this.eventColor];
            } else if (typeof this.eventColor === 'function') {
                eventColors = arrayize(this.eventColor(date));
            } else if (Array.isArray(this.eventColor)) {
                eventColors = this.eventColor;
            } else {
                eventColors = arrayize(this.eventColor[date]);
            }
            return eventColors.filter(function (v) {
                return v;
            });
        },
        genEvents: function genEvents(date) {
            var _this2 = this;

            var eventColors = this.getEventColors(date);
            return eventColors.length ? this.$createElement('div', {
                staticClass: 'v-date-picker-table__events'
            }, eventColors.map(function (color) {
                return _this2.$createElement('div', _this2.setBackgroundColor(color));
            })) : null;
        },
        wheel: function wheel(e, calculateTableDate) {
            e.preventDefault();
            this.$emit('tableDate', calculateTableDate(e.deltaY));
        },
        touch: function touch(value, calculateTableDate) {
            this.$emit('tableDate', calculateTableDate(value));
        },
        genTable: function genTable(staticClass, children, calculateTableDate) {
            var _this3 = this;

            var transition = this.$createElement('transition', {
                props: { name: this.computedTransition }
            }, [this.$createElement('table', { key: this.tableDate }, children)]);
            var touchDirective = {
                name: 'touch',
                value: {
                    left: function left(e) {
                        return e.offsetX < -15 && _this3.touch(1, calculateTableDate);
                    },
                    right: function right(e) {
                        return e.offsetX > 15 && _this3.touch(-1, calculateTableDate);
                    }
                }
            };
            return this.$createElement('div', {
                staticClass: staticClass,
                class: _extends({
                    'v-date-picker-table--disabled': this.disabled
                }, this.themeClasses),
                on: !this.disabled && this.scrollable ? {
                    wheel: function wheel(e) {
                        return _this3.wheel(e, calculateTableDate);
                    }
                } : undefined,
                directives: [touchDirective]
            }, [transition]);
        }
    }
});
//# sourceMappingURL=date-picker-table.js.map