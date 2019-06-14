var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Styles
// import '../../stylus/components/_calendar-daily.styl'
// Mixins
import CalendarBase from './mixins/calendar-base';
// Util
import props from './util/props';
import { DAYS_IN_MONTH_MAX, DAY_MIN, DAYS_IN_WEEK, parseTimestamp, relativeDays, nextDay, prevDay, copyTimestamp, updateFormatted, updateWeekday, updateRelative, getStartOfMonth, getEndOfMonth } from './util/timestamp';
// Calendars
import VCalendarMonthly from './VCalendarMonthly';
import VCalendarDaily from './VCalendarDaily';
import VCalendarWeekly from './VCalendarWeekly';
/* @vue/component */
export default CalendarBase.extend({
    name: 'v-calendar',
    props: _extends({}, props.calendar, props.weeks, props.intervals),
    data: function data() {
        return {
            lastStart: null,
            lastEnd: null
        };
    },
    computed: {
        parsedValue: function parsedValue() {
            return parseTimestamp(this.value) || this.parsedStart || this.times.today;
        },
        renderProps: function renderProps() {
            var around = this.parsedValue;
            var component = 'div';
            var maxDays = this.maxDays;
            var start = around;
            var end = around;
            switch (this.type) {
                case 'month':
                    component = VCalendarMonthly;
                    start = getStartOfMonth(around);
                    end = getEndOfMonth(around);
                    break;
                case 'week':
                    component = VCalendarDaily;
                    start = this.getStartOfWeek(around);
                    end = this.getEndOfWeek(around);
                    maxDays = 7;
                    break;
                case 'day':
                    component = VCalendarDaily;
                    maxDays = 1;
                    break;
                case '4day':
                    component = VCalendarDaily;
                    end = relativeDays(copyTimestamp(end), nextDay, 4);
                    updateFormatted(end);
                    maxDays = 4;
                    break;
                case 'custom-weekly':
                    component = VCalendarWeekly;
                    start = this.parsedStart || around;
                    end = this.parsedEnd;
                    break;
                case 'custom-daily':
                    component = VCalendarDaily;
                    start = this.parsedStart || around;
                    end = this.parsedEnd;
                    break;
            }
            return { component: component, start: start, end: end, maxDays: maxDays };
        }
    },
    watch: {
        renderProps: 'checkChange'
    },
    methods: {
        checkChange: function checkChange() {
            var _renderProps = this.renderProps,
                start = _renderProps.start,
                end = _renderProps.end;

            if (start !== this.lastStart || end !== this.lastEnd) {
                this.lastStart = start;
                this.lastEnd = end;
                this.$emit('change', { start: start, end: end });
            }
        },
        move: function move() {
            var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            var moved = copyTimestamp(this.parsedValue);
            var forward = amount > 0;
            var mover = forward ? nextDay : prevDay;
            var limit = forward ? DAYS_IN_MONTH_MAX : DAY_MIN;
            var times = forward ? amount : -amount;
            while (--times >= 0) {
                switch (this.type) {
                    case 'month':
                        moved.day = limit;
                        mover(moved);
                        break;
                    case 'week':
                        relativeDays(moved, mover, DAYS_IN_WEEK);
                        break;
                    case 'day':
                        mover(moved);
                        break;
                    case '4day':
                        relativeDays(moved, mover, 4);
                        break;
                }
            }
            updateWeekday(moved);
            updateFormatted(moved);
            updateRelative(moved, this.times.now);
            this.$emit('input', moved.date);
            this.$emit('moved', moved);
        },
        next: function next() {
            var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            this.move(amount);
        },
        prev: function prev() {
            var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            this.move(-amount);
        },
        timeToY: function timeToY(time) {
            var clamp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var c = this.$children[0];
            if (c && c.timeToY) {
                return c.timeToY(time, clamp);
            } else {
                return false;
            }
        },
        minutesToPixels: function minutesToPixels(minutes) {
            var c = this.$children[0];
            if (c && c.minutesToPixels) {
                return c.minutesToPixels(minutes);
            } else {
                return -1;
            }
        },
        scrollToTime: function scrollToTime(time) {
            var c = this.$children[0];
            if (c && c.scrollToTime) {
                return c.scrollToTime(time);
            } else {
                return false;
            }
        }
    },
    render: function render(h) {
        var _this = this;

        var _renderProps2 = this.renderProps,
            start = _renderProps2.start,
            end = _renderProps2.end,
            maxDays = _renderProps2.maxDays,
            component = _renderProps2.component;

        return h(component, {
            staticClass: 'v-calendar',
            props: _extends({}, this.$props, {
                start: start.date,
                end: end.date,
                maxDays: maxDays
            }),
            on: _extends({}, this.$listeners, {
                'click:date': function clickDate(day) {
                    if (_this.$listeners['input']) {
                        _this.$emit('input', day.date);
                    }
                    if (_this.$listeners['click:date']) {
                        _this.$emit('click:date', day);
                    }
                }
            }),
            scopedSlots: this.$scopedSlots
        });
    }
});
//# sourceMappingURL=VCalendar.js.map