var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Styles
import '../../../src/stylus/components/_calendar-daily.styl';
// Directives
import Resize from '../../directives/resize';
// Mixins
import CalendarWithIntervals from './mixins/calendar-with-intervals';
// Util
import { convertToUnit } from '../../util/helpers';
/* @vue/component */
export default CalendarWithIntervals.extend({
    name: 'v-calendar-daily',
    directives: { Resize: Resize },
    data: function data() {
        return {
            scrollPush: 0
        };
    },
    computed: {
        classes: function classes() {
            return _extends({
                'v-calendar-daily': true
            }, this.themeClasses);
        }
    },
    mounted: function mounted() {
        this.init();
    },

    methods: {
        init: function init() {
            this.$nextTick(this.onResize);
        },
        onResize: function onResize() {
            this.scrollPush = this.getScrollPush();
        },
        getScrollPush: function getScrollPush() {
            var area = this.$refs.scrollArea;
            var pane = this.$refs.pane;
            return area && pane ? area.offsetWidth - pane.offsetWidth : 0;
        },
        genHead: function genHead() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__head',
                style: {
                    marginRight: this.scrollPush + 'px'
                }
            }, [this.genHeadIntervals()].concat(_toConsumableArray(this.genHeadDays())));
        },
        genHeadIntervals: function genHeadIntervals() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__intervals-head'
            });
        },
        genHeadDays: function genHeadDays() {
            return this.days.map(this.genHeadDay);
        },
        genHeadDay: function genHeadDay(day) {
            var _this = this;

            var slot = this.$scopedSlots.dayHeader;
            return this.$createElement('div', {
                key: day.date,
                staticClass: 'v-calendar-daily_head-day',
                class: this.getRelativeClasses(day),
                on: this.getDefaultMouseEventHandlers(':day', function (_e) {
                    return _this.getSlotScope(day);
                })
            }, [this.genHeadWeekday(day), this.genHeadDayLabel(day), slot ? slot(day) : '']);
        },
        genHeadWeekday: function genHeadWeekday(day) {
            var color = day.present ? this.color : undefined;
            return this.$createElement('div', this.setTextColor(color, {
                staticClass: 'v-calendar-daily_head-weekday'
            }), this.weekdayFormatter(day, this.shortWeekdays));
        },
        genHeadDayLabel: function genHeadDayLabel(day) {
            var color = day.present ? this.color : undefined;
            return this.$createElement('div', this.setTextColor(color, {
                staticClass: 'v-calendar-daily_head-day-label',
                on: this.getMouseEventHandlers({
                    'click:date': { event: 'click', stop: true },
                    'contextmenu:date': { event: 'contextmenu', stop: true, prevent: true, result: false }
                }, function (_e) {
                    return day;
                })
            }), this.dayFormatter(day, false));
        },
        genBody: function genBody() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__body'
            }, [this.genScrollArea()]);
        },
        genScrollArea: function genScrollArea() {
            return this.$createElement('div', {
                ref: 'scrollArea',
                staticClass: 'v-calendar-daily__scroll-area'
            }, [this.genPane()]);
        },
        genPane: function genPane() {
            return this.$createElement('div', {
                ref: 'pane',
                staticClass: 'v-calendar-daily__pane',
                style: {
                    height: convertToUnit(this.bodyHeight)
                }
            }, [this.genDayContainer()]);
        },
        genDayContainer: function genDayContainer() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__day-container'
            }, [this.genBodyIntervals()].concat(_toConsumableArray(this.genDays())));
        },
        genDays: function genDays() {
            return this.days.map(this.genDay);
        },
        genDay: function genDay(day, index) {
            var _this2 = this;

            var slot = this.$scopedSlots.dayBody;
            var scope = this.getSlotScope(day);
            return this.$createElement('div', {
                key: day.date,
                staticClass: 'v-calendar-daily__day',
                class: this.getRelativeClasses(day),
                on: this.getDefaultMouseEventHandlers(':time', function (e) {
                    return _this2.getSlotScope(_this2.getTimestampAtEvent(e, day));
                })
            }, [].concat(_toConsumableArray(this.genDayIntervals(index)), [slot ? slot(scope) : '']));
        },
        genDayIntervals: function genDayIntervals(index) {
            return this.intervals[index].map(this.genDayInterval);
        },
        genDayInterval: function genDayInterval(interval) {
            var height = convertToUnit(this.intervalHeight);
            var styler = this.intervalStyle || this.intervalStyleDefault;
            var slot = this.$scopedSlots.interval;
            var scope = this.getSlotScope(interval);
            var data = {
                key: interval.time,
                staticClass: 'v-calendar-daily__day-interval',
                style: _extends({
                    height: height
                }, styler(interval))
            };
            var children = slot ? slot(scope) : undefined;
            return this.$createElement('div', data, children);
        },
        genBodyIntervals: function genBodyIntervals() {
            var _this3 = this;

            var data = {
                staticClass: 'v-calendar-daily__intervals-body',
                on: this.getDefaultMouseEventHandlers(':interval', function (e) {
                    return _this3.getTimestampAtEvent(e, _this3.parsedStart);
                })
            };
            return this.$createElement('div', data, this.genIntervalLabels());
        },
        genIntervalLabels: function genIntervalLabels() {
            return this.intervals[0].map(this.genIntervalLabel);
        },
        genIntervalLabel: function genIntervalLabel(interval) {
            var height = convertToUnit(this.intervalHeight);
            var short = this.shortIntervals;
            var shower = this.showIntervalLabel || this.showIntervalLabelDefault;
            var show = shower(interval);
            var label = show ? this.intervalFormatter(interval, short) : undefined;
            return this.$createElement('div', {
                key: interval.time,
                staticClass: 'v-calendar-daily__interval',
                style: {
                    height: height
                }
            }, [this.$createElement('div', {
                staticClass: 'v-calendar-daily__interval-text'
            }, label)]);
        }
    },
    render: function render(h) {
        return h('div', {
            class: this.classes,
            nativeOn: {
                dragstart: function dragstart(e) {
                    e.preventDefault();
                }
            },
            directives: [{
                modifiers: { quiet: true },
                name: 'resize',
                value: this.onResize
            }]
        }, [!this.hideHeader ? this.genHead() : '', this.genBody()]);
    }
});
//# sourceMappingURL=VCalendarDaily.js.map