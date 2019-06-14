var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Styles
import '../../../src/stylus/components/_calendar-weekly.styl';
// Mixins
import CalendarBase from './mixins/calendar-base';
// Util
import props from './util/props';
import { createDayList, getDayIdentifier, createNativeLocaleFormatter } from './util/timestamp';
/* @vue/component */
export default CalendarBase.extend({
    name: 'v-calendar-weekly',
    props: props.weeks,
    computed: {
        staticClass: function staticClass() {
            return 'v-calendar-weekly';
        },
        classes: function classes() {
            return this.themeClasses;
        },
        parsedMinWeeks: function parsedMinWeeks() {
            return parseInt(this.minWeeks);
        },
        days: function days() {
            var minDays = this.parsedMinWeeks * this.weekdays.length;
            var start = this.getStartOfWeek(this.parsedStart);
            var end = this.getEndOfWeek(this.parsedEnd);
            return createDayList(start, end, this.times.today, this.weekdaySkips, Number.MAX_SAFE_INTEGER, minDays);
        },
        todayWeek: function todayWeek() {
            var today = this.times.today;
            var start = this.getStartOfWeek(today);
            var end = this.getEndOfWeek(today);
            return createDayList(start, end, today, this.weekdaySkips, this.weekdays.length, this.weekdays.length);
        },
        monthFormatter: function monthFormatter() {
            if (this.monthFormat) {
                return this.monthFormat;
            }
            var longOptions = { timeZone: 'UTC', month: 'long' };
            var shortOptions = { timeZone: 'UTC', month: 'short' };
            return createNativeLocaleFormatter(this.locale, function (_tms, short) {
                return short ? shortOptions : longOptions;
            });
        }
    },
    methods: {
        isOutside: function isOutside(day) {
            var dayIdentifier = getDayIdentifier(day);
            return dayIdentifier < getDayIdentifier(this.parsedStart) || dayIdentifier > getDayIdentifier(this.parsedEnd);
        },
        genHead: function genHead() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-weekly__head'
            }, this.genHeadDays());
        },
        genHeadDays: function genHeadDays() {
            return this.todayWeek.map(this.genHeadDay);
        },
        genHeadDay: function genHeadDay(day, index) {
            var outside = this.isOutside(this.days[index]);
            var color = day.present ? this.color : undefined;
            return this.$createElement('div', this.setTextColor(color, {
                key: day.date,
                staticClass: 'v-calendar-weekly__head-weekday',
                class: this.getRelativeClasses(day, outside)
            }), this.weekdayFormatter(day, this.shortWeekdays));
        },
        genWeeks: function genWeeks() {
            var days = this.days;
            var weekDays = this.weekdays.length;
            var weeks = [];
            for (var i = 0; i < days.length; i += weekDays) {
                weeks.push(this.genWeek(days.slice(i, i + weekDays)));
            }
            return weeks;
        },
        genWeek: function genWeek(week) {
            return this.$createElement('div', {
                key: week[0].date,
                staticClass: 'v-calendar-weekly__week'
            }, week.map(this.genDay));
        },
        genDay: function genDay(day) {
            var outside = this.isOutside(day);
            var slot = this.$scopedSlots.day;
            var slotData = _extends({ outside: outside }, day);
            var hasMonth = day.day === 1 && this.showMonthOnFirst;
            return this.$createElement('div', {
                key: day.date,
                staticClass: 'v-calendar-weekly__day',
                class: this.getRelativeClasses(day, outside),
                on: this.getDefaultMouseEventHandlers(':day', function (_e) {
                    return day;
                })
            }, [this.genDayLabel(day), hasMonth ? this.genDayMonth(day) : '', slot ? slot(slotData) : '']);
        },
        genDayLabel: function genDayLabel(day) {
            var color = day.present ? this.color : undefined;
            var slot = this.$scopedSlots.dayLabel;
            return this.$createElement('div', this.setTextColor(color, {
                staticClass: 'v-calendar-weekly__day-label',
                on: this.getMouseEventHandlers({
                    'click:date': { event: 'click', stop: true },
                    'contextmenu:date': { event: 'contextmenu', stop: true, prevent: true, result: false }
                }, function (_e) {
                    return day;
                })
            }), slot ? slot(day) : this.dayFormatter(day, false));
        },
        genDayMonth: function genDayMonth(day) {
            var color = day.present ? this.color : undefined;
            var slot = this.$scopedSlots.dayMonth;
            return this.$createElement('div', this.setTextColor(color, {
                staticClass: 'v-calendar-weekly__day-month'
            }), slot ? slot(day) : this.monthFormatter(day, this.shortMonths));
        }
    },
    render: function render(h) {
        return h('div', {
            staticClass: this.staticClass,
            class: this.classes,
            nativeOn: {
                dragstart: function dragstart(e) {
                    e.preventDefault();
                }
            }
        }, [!this.hideHeader ? this.genHead() : ''].concat(_toConsumableArray(this.genWeeks())));
    }
});
//# sourceMappingURL=VCalendarWeekly.js.map