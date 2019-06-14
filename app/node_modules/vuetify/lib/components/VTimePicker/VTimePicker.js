var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// Components
import VTimePickerTitle from './VTimePickerTitle';
import VTimePickerClock from './VTimePickerClock';
// Mixins
import Picker from '../../mixins/picker';
// Utils
import { createRange } from '../../util/helpers';
import pad from '../VDatePicker/util/pad';
import mixins from '../../util/mixins';
var rangeHours24 = createRange(24);
var rangeHours12am = createRange(12);
var rangeHours12pm = rangeHours12am.map(function (v) {
    return v + 12;
});
var range60 = createRange(60);
var selectingTimes = { hour: 1, minute: 2, second: 3 };
var selectingNames = { 1: 'hour', 2: 'minute', 3: 'second' };
export { selectingTimes };
export default mixins(Picker
/* @vue/component */
).extend({
    name: 'v-time-picker',
    props: {
        allowedHours: Function,
        allowedMinutes: Function,
        allowedSeconds: Function,
        disabled: Boolean,
        format: {
            type: String,
            default: 'ampm',
            validator: function validator(val) {
                return ['ampm', '24hr'].includes(val);
            }
        },
        min: String,
        max: String,
        readonly: Boolean,
        scrollable: Boolean,
        useSeconds: Boolean,
        value: null
    },
    data: function data() {
        return {
            inputHour: null,
            inputMinute: null,
            inputSecond: null,
            lazyInputHour: null,
            lazyInputMinute: null,
            lazyInputSecond: null,
            period: 'am',
            selecting: selectingTimes.hour
        };
    },

    computed: {
        selectingHour: {
            get: function get() {
                return this.selecting === selectingTimes.hour;
            },
            set: function set(v) {
                this.selecting = selectingTimes.hour;
            }
        },
        selectingMinute: {
            get: function get() {
                return this.selecting === selectingTimes.minute;
            },
            set: function set(v) {
                this.selecting = selectingTimes.minute;
            }
        },
        selectingSecond: {
            get: function get() {
                return this.selecting === selectingTimes.second;
            },
            set: function set(v) {
                this.selecting = selectingTimes.second;
            }
        },
        isAllowedHourCb: function isAllowedHourCb() {
            var _this = this;

            if (!this.min && !this.max) return this.allowedHours;
            var minHour = this.min ? Number(this.min.split(':')[0]) : 0;
            var maxHour = this.max ? Number(this.max.split(':')[0]) : 23;
            return function (val) {
                return val >= minHour * 1 && val <= maxHour * 1 && (!_this.allowedHours || _this.allowedHours(val));
            };
        },
        isAllowedMinuteCb: function isAllowedMinuteCb() {
            var _this2 = this;

            var isHourAllowed = !this.allowedHours || this.allowedHours(this.inputHour);
            if (!this.min && !this.max) {
                return isHourAllowed ? this.allowedMinutes : function () {
                    return false;
                };
            }

            var _ref = this.min ? this.min.split(':').map(Number) : [0, 0],
                _ref2 = _slicedToArray(_ref, 2),
                minHour = _ref2[0],
                minMinute = _ref2[1];

            var _ref3 = this.max ? this.max.split(':').map(Number) : [23, 59],
                _ref4 = _slicedToArray(_ref3, 2),
                maxHour = _ref4[0],
                maxMinute = _ref4[1];

            var minTime = minHour * 60 + minMinute * 1;
            var maxTime = maxHour * 60 + maxMinute * 1;
            return function (val) {
                var time = 60 * _this2.inputHour + val;
                return time >= minTime && time <= maxTime && isHourAllowed && (!_this2.allowedMinutes || _this2.allowedMinutes(val));
            };
        },
        isAllowedSecondCb: function isAllowedSecondCb() {
            var _this3 = this;

            var isHourAllowed = !this.allowedHours || this.allowedHours(this.inputHour);
            var isMinuteAllowed = !this.allowedMinutes || this.allowedMinutes(this.inputMinute);
            if (!this.min && !this.max) {
                return isHourAllowed && isMinuteAllowed ? this.allowedSeconds : function () {
                    return false;
                };
            }

            var _ref5 = this.min ? this.min.split(':').map(Number) : [0, 0, 0],
                _ref6 = _slicedToArray(_ref5, 3),
                minHour = _ref6[0],
                minMinute = _ref6[1],
                minSecond = _ref6[2];

            var _ref7 = this.max ? this.max.split(':').map(Number) : [23, 59, 59],
                _ref8 = _slicedToArray(_ref7, 3),
                maxHour = _ref8[0],
                maxMinute = _ref8[1],
                maxSecond = _ref8[2];

            var minTime = minHour * 3600 + minMinute * 60 + (minSecond || 0) * 1;
            var maxTime = maxHour * 3600 + maxMinute * 60 + (maxSecond || 0) * 1;
            return function (val) {
                var time = 3600 * _this3.inputHour + 60 * _this3.inputMinute + val;
                return time >= minTime && time <= maxTime && isHourAllowed && isMinuteAllowed && (!_this3.allowedSeconds || _this3.allowedSeconds(val));
            };
        },
        isAmPm: function isAmPm() {
            return this.format === 'ampm';
        }
    },
    watch: {
        value: 'setInputData'
    },
    mounted: function mounted() {
        this.setInputData(this.value);
    },

    methods: {
        genValue: function genValue() {
            if (this.inputHour != null && this.inputMinute != null && (!this.useSeconds || this.inputSecond != null)) {
                return pad(this.inputHour) + ':' + pad(this.inputMinute) + (this.useSeconds ? ':' + pad(this.inputSecond) : '');
            }
            return null;
        },
        emitValue: function emitValue() {
            var value = this.genValue();
            if (value !== null) this.$emit('input', value);
        },
        setPeriod: function setPeriod(period) {
            this.period = period;
            if (this.inputHour != null) {
                var newHour = this.inputHour + (period === 'am' ? -12 : 12);
                this.inputHour = this.firstAllowed('hour', newHour);
                this.emitValue();
            }
        },
        setInputData: function setInputData(value) {
            if (value == null || value === '') {
                this.inputHour = null;
                this.inputMinute = null;
                this.inputSecond = null;
            } else if (value instanceof Date) {
                this.inputHour = value.getHours();
                this.inputMinute = value.getMinutes();
                this.inputSecond = value.getSeconds();
            } else {
                var _ref9 = value.trim().toLowerCase().match(/^(\d+):(\d+)(:(\d+))?([ap]m)?$/) || new Array(6),
                    _ref10 = _slicedToArray(_ref9, 6),
                    hour = _ref10[1],
                    minute = _ref10[2],
                    second = _ref10[4],
                    period = _ref10[5];

                this.inputHour = period ? this.convert12to24(parseInt(hour, 10), period) : parseInt(hour, 10);
                this.inputMinute = parseInt(minute, 10);
                this.inputSecond = parseInt(second || 0, 10);
            }
            this.period = this.inputHour == null || this.inputHour < 12 ? 'am' : 'pm';
        },
        convert24to12: function convert24to12(hour) {
            return hour ? (hour - 1) % 12 + 1 : 12;
        },
        convert12to24: function convert12to24(hour, period) {
            return hour % 12 + (period === 'pm' ? 12 : 0);
        },
        onInput: function onInput(value) {
            if (this.selecting === selectingTimes.hour) {
                this.inputHour = this.isAmPm ? this.convert12to24(value, this.period) : value;
            } else if (this.selecting === selectingTimes.minute) {
                this.inputMinute = value;
            } else {
                this.inputSecond = value;
            }
            this.emitValue();
        },
        onChange: function onChange(value) {
            this.$emit('click:' + selectingNames[this.selecting], value);
            var emitChange = this.selecting === (this.useSeconds ? selectingTimes.second : selectingTimes.minute);
            if (this.selecting === selectingTimes.hour) {
                this.selecting = selectingTimes.minute;
            } else if (this.useSeconds && this.selecting === selectingTimes.minute) {
                this.selecting = selectingTimes.second;
            }
            if (this.inputHour === this.lazyInputHour && this.inputMinute === this.lazyInputMinute && (!this.useSeconds || this.inputSecond === this.lazyInputSecond)) return;
            var time = this.genValue();
            if (time === null) return;
            this.lazyInputHour = this.inputHour;
            this.lazyInputMinute = this.inputMinute;
            this.useSeconds && (this.lazyInputSecond = this.inputSecond);
            emitChange && this.$emit('change', time);
        },
        firstAllowed: function firstAllowed(type, value) {
            var allowedFn = type === 'hour' ? this.isAllowedHourCb : type === 'minute' ? this.isAllowedMinuteCb : this.isAllowedSecondCb;
            if (!allowedFn) return value;
            // TODO: clean up
            var range = type === 'minute' ? range60 : type === 'second' ? range60 : this.isAmPm ? value < 12 ? rangeHours12am : rangeHours12pm : rangeHours24;
            var first = range.find(function (v) {
                return allowedFn((v + value) % range.length + range[0]);
            });
            return ((first || 0) + value) % range.length + range[0];
        },
        genClock: function genClock() {
            return this.$createElement(VTimePickerClock, {
                props: {
                    allowedValues: this.selecting === selectingTimes.hour ? this.isAllowedHourCb : this.selecting === selectingTimes.minute ? this.isAllowedMinuteCb : this.isAllowedSecondCb,
                    color: this.color,
                    dark: this.dark,
                    disabled: this.disabled,
                    double: this.selecting === selectingTimes.hour && !this.isAmPm,
                    format: this.selecting === selectingTimes.hour ? this.isAmPm ? this.convert24to12 : function (val) {
                        return val;
                    } : function (val) {
                        return pad(val, 2);
                    },
                    light: this.light,
                    max: this.selecting === selectingTimes.hour ? this.isAmPm && this.period === 'am' ? 11 : 23 : 59,
                    min: this.selecting === selectingTimes.hour && this.isAmPm && this.period === 'pm' ? 12 : 0,
                    readonly: this.readonly,
                    scrollable: this.scrollable,
                    size: Number(this.width) - (!this.fullWidth && this.landscape ? 80 : 20),
                    step: this.selecting === selectingTimes.hour ? 1 : 5,
                    value: this.selecting === selectingTimes.hour ? this.inputHour : this.selecting === selectingTimes.minute ? this.inputMinute : this.inputSecond
                },
                on: {
                    input: this.onInput,
                    change: this.onChange
                },
                ref: 'clock'
            });
        },
        genPickerBody: function genPickerBody() {
            return this.$createElement('div', {
                staticClass: 'v-time-picker-clock__container',
                key: this.selecting
            }, [this.genClock()]);
        },
        genPickerTitle: function genPickerTitle() {
            var _this4 = this;

            return this.$createElement(VTimePickerTitle, {
                props: {
                    ampm: this.isAmPm,
                    disabled: this.disabled,
                    hour: this.inputHour,
                    minute: this.inputMinute,
                    second: this.inputSecond,
                    period: this.period,
                    readonly: this.readonly,
                    useSeconds: this.useSeconds,
                    selecting: this.selecting
                },
                on: {
                    'update:selecting': function updateSelecting(value) {
                        return _this4.selecting = value;
                    },
                    'update:period': this.setPeriod
                },
                ref: 'title',
                slot: 'title'
            });
        }
    },
    render: function render() {
        return this.genPicker('v-picker--time');
    }
});
//# sourceMappingURL=VTimePicker.js.map