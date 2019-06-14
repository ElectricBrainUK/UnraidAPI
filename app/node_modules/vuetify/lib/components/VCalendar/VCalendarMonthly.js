// Styles
import '../../../src/stylus/components/_calendar-weekly.styl';
// Mixins
import VCalendarWeekly from './VCalendarWeekly';
// Util
import { parseTimestamp, getStartOfMonth, getEndOfMonth } from './util/timestamp';
/* @vue/component */
export default VCalendarWeekly.extend({
    name: 'v-calendar-monthly',
    computed: {
        staticClass: function staticClass() {
            return 'v-calendar-monthly v-calendar-weekly';
        },
        parsedStart: function parsedStart() {
            return getStartOfMonth(parseTimestamp(this.start));
        },
        parsedEnd: function parsedEnd() {
            return getEndOfMonth(parseTimestamp(this.end));
        }
    }
});
//# sourceMappingURL=VCalendarMonthly.js.map