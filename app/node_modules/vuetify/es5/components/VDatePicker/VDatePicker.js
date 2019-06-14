'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // Components

// Mixins

// Utils


var _VDatePickerTitle = require('./VDatePickerTitle');

var _VDatePickerTitle2 = _interopRequireDefault(_VDatePickerTitle);

var _VDatePickerHeader = require('./VDatePickerHeader');

var _VDatePickerHeader2 = _interopRequireDefault(_VDatePickerHeader);

var _VDatePickerDateTable = require('./VDatePickerDateTable');

var _VDatePickerDateTable2 = _interopRequireDefault(_VDatePickerDateTable);

var _VDatePickerMonthTable = require('./VDatePickerMonthTable');

var _VDatePickerMonthTable2 = _interopRequireDefault(_VDatePickerMonthTable);

var _VDatePickerYears = require('./VDatePickerYears');

var _VDatePickerYears2 = _interopRequireDefault(_VDatePickerYears);

var _picker = require('../../mixins/picker');

var _picker2 = _interopRequireDefault(_picker);

var _util = require('./util');

var _isDateAllowed2 = require('./util/isDateAllowed');

var _isDateAllowed3 = _interopRequireDefault(_isDateAllowed2);

var _console = require('../../util/console');

var _timestamp = require('../VCalendar/util/timestamp');

var _mixins = require('../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Adds leading zero to month/day if necessary, returns 'YYYY' if type = 'year',
// 'YYYY-MM' if 'month' and 'YYYY-MM-DD' if 'date'
function sanitizeDateString(dateString, type) {
    var _dateString$split = dateString.split('-'),
        _dateString$split2 = _slicedToArray(_dateString$split, 3),
        year = _dateString$split2[0],
        _dateString$split2$ = _dateString$split2[1],
        month = _dateString$split2$ === undefined ? 1 : _dateString$split2$,
        _dateString$split2$2 = _dateString$split2[2],
        date = _dateString$split2$2 === undefined ? 1 : _dateString$split2$2;

    return (year + '-' + (0, _util.pad)(month) + '-' + (0, _util.pad)(date)).substr(0, { date: 10, month: 7, year: 4 }[type]);
}
exports.default = (0, _mixins2.default)(_picker2.default
/* @vue/component */
).extend({
    name: 'v-date-picker',
    props: {
        allowedDates: Function,
        // Function formatting the day in date picker table
        dayFormat: Function,
        disabled: Boolean,
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
        firstDayOfWeek: {
            type: [String, Number],
            default: 0
        },
        // Function formatting the tableDate in the day/month table header
        headerDateFormat: Function,
        locale: {
            type: String,
            default: 'en-us'
        },
        max: String,
        min: String,
        // Function formatting month in the months table
        monthFormat: Function,
        multiple: Boolean,
        nextIcon: {
            type: String,
            default: '$vuetify.icons.next'
        },
        pickerDate: String,
        prevIcon: {
            type: String,
            default: '$vuetify.icons.prev'
        },
        reactive: Boolean,
        readonly: Boolean,
        scrollable: Boolean,
        showCurrent: {
            type: [Boolean, String],
            default: true
        },
        showWeek: Boolean,
        // Function formatting currently selected date in the picker title
        titleDateFormat: Function,
        type: {
            type: String,
            default: 'date',
            validator: function validator(type) {
                return ['date', 'month'].includes(type);
            } // TODO: year
        },
        value: [Array, String],
        weekdayFormat: Function,
        // Function formatting the year in table header and pickup title
        yearFormat: Function,
        yearIcon: String
    },
    data: function data() {
        var _this = this;

        var now = new Date();
        return {
            activePicker: this.type.toUpperCase(),
            inputDay: null,
            inputMonth: null,
            inputYear: null,
            isReversing: false,
            now: now,
            // tableDate is a string in 'YYYY' / 'YYYY-M' format (leading zero for month is not required)
            tableDate: function () {
                if (_this.pickerDate) {
                    return _this.pickerDate;
                }
                var date = (_this.multiple ? _this.value[_this.value.length - 1] : _this.value) || now.getFullYear() + '-' + (now.getMonth() + 1);
                return sanitizeDateString(date, _this.type === 'date' ? 'month' : 'year');
            }()
        };
    },

    computed: {
        lastValue: function lastValue() {
            return this.multiple ? this.value[this.value.length - 1] : this.value;
        },
        selectedMonths: function selectedMonths() {
            if (!this.value || !this.value.length || this.type === 'month') {
                return this.value;
            } else if (this.multiple) {
                return this.value.map(function (val) {
                    return val.substr(0, 7);
                });
            } else {
                return this.value.substr(0, 7);
            }
        },
        current: function current() {
            if (this.showCurrent === true) {
                return sanitizeDateString(this.now.getFullYear() + '-' + (this.now.getMonth() + 1) + '-' + this.now.getDate(), this.type);
            }
            return this.showCurrent || null;
        },
        inputDate: function inputDate() {
            return this.type === 'date' ? this.inputYear + '-' + (0, _util.pad)(this.inputMonth + 1) + '-' + (0, _util.pad)(this.inputDay) : this.inputYear + '-' + (0, _util.pad)(this.inputMonth + 1);
        },
        tableMonth: function tableMonth() {
            return Number((this.pickerDate || this.tableDate).split('-')[1]) - 1;
        },
        tableYear: function tableYear() {
            return Number((this.pickerDate || this.tableDate).split('-')[0]);
        },
        minMonth: function minMonth() {
            return this.min ? sanitizeDateString(this.min, 'month') : null;
        },
        maxMonth: function maxMonth() {
            return this.max ? sanitizeDateString(this.max, 'month') : null;
        },
        minYear: function minYear() {
            return this.min ? sanitizeDateString(this.min, 'year') : null;
        },
        maxYear: function maxYear() {
            return this.max ? sanitizeDateString(this.max, 'year') : null;
        },
        formatters: function formatters() {
            return {
                year: this.yearFormat || (0, _util.createNativeLocaleFormatter)(this.locale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 }),
                titleDate: this.titleDateFormat || (this.multiple ? this.defaultTitleMultipleDateFormatter : this.defaultTitleDateFormatter)
            };
        },
        defaultTitleMultipleDateFormatter: function defaultTitleMultipleDateFormatter() {
            var _this2 = this;

            if (this.value.length < 2) {
                return function (dates) {
                    return dates.length ? _this2.defaultTitleDateFormatter(dates[0]) : '0 selected';
                };
            }
            return function (dates) {
                return dates.length + ' selected';
            };
        },
        defaultTitleDateFormatter: function defaultTitleDateFormatter() {
            var titleFormats = {
                year: { year: 'numeric', timeZone: 'UTC' },
                month: { month: 'long', timeZone: 'UTC' },
                date: { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }
            };
            var titleDateFormatter = (0, _util.createNativeLocaleFormatter)(this.locale, titleFormats[this.type], {
                start: 0,
                length: { date: 10, month: 7, year: 4 }[this.type]
            });
            var landscapeFormatter = function landscapeFormatter(date) {
                return titleDateFormatter(date).replace(/([^\d\s])([\d])/g, function (match, nonDigit, digit) {
                    return nonDigit + ' ' + digit;
                }).replace(', ', ',<br>');
            };
            return this.landscape ? landscapeFormatter : titleDateFormatter;
        }
    },
    watch: {
        tableDate: function tableDate(val, prev) {
            // Make a ISO 8601 strings from val and prev for comparision, otherwise it will incorrectly
            // compare for example '2000-9' and '2000-10'
            var sanitizeType = this.type === 'month' ? 'year' : 'month';
            this.isReversing = sanitizeDateString(val, sanitizeType) < sanitizeDateString(prev, sanitizeType);
            this.$emit('update:pickerDate', val);
        },
        pickerDate: function pickerDate(val) {
            if (val) {
                this.tableDate = val;
            } else if (this.lastValue && this.type === 'date') {
                this.tableDate = sanitizeDateString(this.lastValue, 'month');
            } else if (this.lastValue && this.type === 'month') {
                this.tableDate = sanitizeDateString(this.lastValue, 'year');
            }
        },
        value: function value(newValue, oldValue) {
            this.checkMultipleProp();
            this.setInputDate();
            if (!this.multiple && this.value && !this.pickerDate) {
                this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month');
            } else if (this.multiple && this.value.length && !oldValue.length && !this.pickerDate) {
                this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month');
            }
        },
        type: function type(_type) {
            this.activePicker = _type.toUpperCase();
            if (this.value && this.value.length) {
                var output = (this.multiple ? this.value : [this.value]).map(function (val) {
                    return sanitizeDateString(val, _type);
                }).filter(this.isDateAllowed);
                this.$emit('input', this.multiple ? output : output[0]);
            }
        }
    },
    created: function created() {
        this.checkMultipleProp();
        if (this.pickerDate !== this.tableDate) {
            this.$emit('update:pickerDate', this.tableDate);
        }
        this.setInputDate();
    },

    methods: {
        emitInput: function emitInput(newInput) {
            var output = this.multiple ? this.value.indexOf(newInput) === -1 ? this.value.concat([newInput]) : this.value.filter(function (x) {
                return x !== newInput;
            }) : newInput;
            this.$emit('input', output);
            this.multiple || this.$emit('change', newInput);
        },
        checkMultipleProp: function checkMultipleProp() {
            if (this.value == null) return;
            var valueType = this.value.constructor.name;
            var expected = this.multiple ? 'Array' : 'String';
            if (valueType !== expected) {
                (0, _console.consoleWarn)('Value must be ' + (this.multiple ? 'an' : 'a') + ' ' + expected + ', got ' + valueType, this);
            }
        },
        isDateAllowed: function isDateAllowed(value) {
            return (0, _isDateAllowed3.default)(value, this.min, this.max, this.allowedDates);
        },
        yearClick: function yearClick(value) {
            this.inputYear = value;
            if (this.type === 'month') {
                this.tableDate = '' + value;
            } else {
                this.tableDate = value + '-' + (0, _util.pad)((this.tableMonth || 0) + 1);
            }
            this.activePicker = 'MONTH';
            if (this.reactive && !this.readonly && !this.multiple && this.isDateAllowed(this.inputDate)) {
                this.$emit('input', this.inputDate);
            }
        },
        monthClick: function monthClick(value) {
            this.inputYear = parseInt(value.split('-')[0], 10);
            this.inputMonth = parseInt(value.split('-')[1], 10) - 1;
            if (this.type === 'date') {
                if (this.inputDay) {
                    this.inputDay = Math.min(this.inputDay, (0, _timestamp.daysInMonth)(this.inputYear, this.inputMonth + 1));
                }
                this.tableDate = value;
                this.activePicker = 'DATE';
                if (this.reactive && !this.readonly && !this.multiple && this.isDateAllowed(this.inputDate)) {
                    this.$emit('input', this.inputDate);
                }
            } else {
                this.emitInput(this.inputDate);
            }
        },
        dateClick: function dateClick(value) {
            this.inputYear = parseInt(value.split('-')[0], 10);
            this.inputMonth = parseInt(value.split('-')[1], 10) - 1;
            this.inputDay = parseInt(value.split('-')[2], 10);
            this.emitInput(this.inputDate);
        },
        genPickerTitle: function genPickerTitle() {
            var _this3 = this;

            return this.$createElement(_VDatePickerTitle2.default, {
                props: {
                    date: this.value ? this.formatters.titleDate(this.value) : '',
                    disabled: this.disabled,
                    readonly: this.readonly,
                    selectingYear: this.activePicker === 'YEAR',
                    year: this.formatters.year(this.value ? '' + this.inputYear : this.tableDate),
                    yearIcon: this.yearIcon,
                    value: this.multiple ? this.value[0] : this.value
                },
                slot: 'title',
                on: {
                    'update:selectingYear': function updateSelectingYear(value) {
                        return _this3.activePicker = value ? 'YEAR' : _this3.type.toUpperCase();
                    }
                }
            });
        },
        genTableHeader: function genTableHeader() {
            var _this4 = this;

            return this.$createElement(_VDatePickerHeader2.default, {
                props: {
                    nextIcon: this.nextIcon,
                    color: this.color,
                    dark: this.dark,
                    disabled: this.disabled,
                    format: this.headerDateFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.activePicker === 'DATE' ? this.minMonth : this.minYear,
                    max: this.activePicker === 'DATE' ? this.maxMonth : this.maxYear,
                    prevIcon: this.prevIcon,
                    readonly: this.readonly,
                    value: this.activePicker === 'DATE' ? (0, _util.pad)(this.tableYear, 4) + '-' + (0, _util.pad)(this.tableMonth + 1) : '' + (0, _util.pad)(this.tableYear, 4)
                },
                on: {
                    toggle: function toggle() {
                        return _this4.activePicker = _this4.activePicker === 'DATE' ? 'MONTH' : 'YEAR';
                    },
                    input: function input(value) {
                        return _this4.tableDate = value;
                    }
                }
            });
        },
        genDateTable: function genDateTable() {
            var _this5 = this;

            return this.$createElement(_VDatePickerDateTable2.default, {
                props: {
                    allowedDates: this.allowedDates,
                    color: this.color,
                    current: this.current,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.events,
                    eventColor: this.eventColor,
                    firstDayOfWeek: this.firstDayOfWeek,
                    format: this.dayFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.min,
                    max: this.max,
                    readonly: this.readonly,
                    scrollable: this.scrollable,
                    showWeek: this.showWeek,
                    tableDate: (0, _util.pad)(this.tableYear, 4) + '-' + (0, _util.pad)(this.tableMonth + 1),
                    value: this.value,
                    weekdayFormat: this.weekdayFormat
                },
                ref: 'table',
                on: {
                    input: this.dateClick,
                    tableDate: function tableDate(value) {
                        return _this5.tableDate = value;
                    },
                    'click:date': function clickDate(value) {
                        return _this5.$emit('click:date', value);
                    },
                    'dblclick:date': function dblclickDate(value) {
                        return _this5.$emit('dblclick:date', value);
                    }
                }
            });
        },
        genMonthTable: function genMonthTable() {
            var _this6 = this;

            return this.$createElement(_VDatePickerMonthTable2.default, {
                props: {
                    allowedDates: this.type === 'month' ? this.allowedDates : null,
                    color: this.color,
                    current: this.current ? sanitizeDateString(this.current, 'month') : null,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.type === 'month' ? this.events : null,
                    eventColor: this.type === 'month' ? this.eventColor : null,
                    format: this.monthFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.minMonth,
                    max: this.maxMonth,
                    readonly: this.readonly && this.type === 'month',
                    scrollable: this.scrollable,
                    value: this.selectedMonths,
                    tableDate: '' + (0, _util.pad)(this.tableYear, 4)
                },
                ref: 'table',
                on: {
                    input: this.monthClick,
                    tableDate: function tableDate(value) {
                        return _this6.tableDate = value;
                    },
                    'click:month': function clickMonth(value) {
                        return _this6.$emit('click:month', value);
                    },
                    'dblclick:month': function dblclickMonth(value) {
                        return _this6.$emit('dblclick:month', value);
                    }
                }
            });
        },
        genYears: function genYears() {
            return this.$createElement(_VDatePickerYears2.default, {
                props: {
                    color: this.color,
                    format: this.yearFormat,
                    locale: this.locale,
                    min: this.minYear,
                    max: this.maxYear,
                    value: this.tableYear
                },
                on: {
                    input: this.yearClick
                }
            });
        },
        genPickerBody: function genPickerBody() {
            var children = this.activePicker === 'YEAR' ? [this.genYears()] : [this.genTableHeader(), this.activePicker === 'DATE' ? this.genDateTable() : this.genMonthTable()];
            return this.$createElement('div', {
                key: this.activePicker
            }, children);
        },
        setInputDate: function setInputDate() {
            if (this.lastValue) {
                var array = this.lastValue.split('-');
                this.inputYear = parseInt(array[0], 10);
                this.inputMonth = parseInt(array[1], 10) - 1;
                if (this.type === 'date') {
                    this.inputDay = parseInt(array[2], 10);
                }
            } else {
                this.inputYear = this.inputYear || this.now.getFullYear();
                this.inputMonth = this.inputMonth == null ? this.inputMonth : this.now.getMonth();
                this.inputDay = this.inputDay || this.now.getDate();
            }
        }
    },
    render: function render() {
        return this.genPicker('v-picker--date');
    }
});
//# sourceMappingURL=VDatePicker.js.map