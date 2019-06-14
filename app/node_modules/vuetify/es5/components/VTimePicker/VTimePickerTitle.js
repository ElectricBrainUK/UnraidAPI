'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('../../../src/stylus/components/_time-picker-title.styl');

var _pickerButton = require('../../mixins/picker-button');

var _pickerButton2 = _interopRequireDefault(_pickerButton);

var _util = require('../VDatePicker/util');

var _mixins = require('../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

var _VTimePicker = require('./VTimePicker');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
exports.default = (0, _mixins2.default)(_pickerButton2.default
/* @vue/component */
).extend({
    name: 'v-time-picker-title',
    props: {
        ampm: Boolean,
        disabled: Boolean,
        hour: Number,
        minute: Number,
        second: Number,
        period: {
            type: String,
            validator: function validator(period) {
                return period === 'am' || period === 'pm';
            }
        },
        readonly: Boolean,
        useSeconds: Boolean,
        selecting: Number
    },
    methods: {
        genTime: function genTime() {
            var hour = this.hour;
            if (this.ampm) {
                hour = hour ? (hour - 1) % 12 + 1 : 12;
            }
            var displayedHour = this.hour == null ? '--' : this.ampm ? String(hour) : (0, _util.pad)(hour);
            var displayedMinute = this.minute == null ? '--' : (0, _util.pad)(this.minute);
            var titleContent = [this.genPickerButton('selecting', _VTimePicker.selectingTimes.hour, displayedHour, this.disabled), this.$createElement('span', ':'), this.genPickerButton('selecting', _VTimePicker.selectingTimes.minute, displayedMinute, this.disabled)];
            if (this.useSeconds) {
                var displayedSecond = this.second == null ? '--' : (0, _util.pad)(this.second);
                titleContent.push(this.$createElement('span', ':'));
                titleContent.push(this.genPickerButton('selecting', _VTimePicker.selectingTimes.second, displayedSecond, this.disabled));
            }
            return this.$createElement('div', {
                'class': 'v-time-picker-title__time'
            }, titleContent);
        },
        genAmPm: function genAmPm() {
            return this.$createElement('div', {
                staticClass: 'v-time-picker-title__ampm'
            }, [this.genPickerButton('period', 'am', 'am', this.disabled || this.readonly), this.genPickerButton('period', 'pm', 'pm', this.disabled || this.readonly)]);
        }
    },
    render: function render(h) {
        var children = [this.genTime()];
        this.ampm && children.push(this.genAmPm());
        return h('div', {
            staticClass: 'v-time-picker-title'
        }, children);
    }
});
// Utils
//# sourceMappingURL=VTimePickerTitle.js.map