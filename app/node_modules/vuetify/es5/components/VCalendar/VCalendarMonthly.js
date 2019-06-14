'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('../../../src/stylus/components/_calendar-weekly.styl');

var _VCalendarWeekly = require('./VCalendarWeekly');

var _VCalendarWeekly2 = _interopRequireDefault(_VCalendarWeekly);

var _timestamp = require('./util/timestamp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* @vue/component */

// Mixins
exports.default = _VCalendarWeekly2.default.extend({
    name: 'v-calendar-monthly',
    computed: {
        staticClass: function staticClass() {
            return 'v-calendar-monthly v-calendar-weekly';
        },
        parsedStart: function parsedStart() {
            return (0, _timestamp.getStartOfMonth)((0, _timestamp.parseTimestamp)(this.start));
        },
        parsedEnd: function parsedEnd() {
            return (0, _timestamp.getEndOfMonth)((0, _timestamp.parseTimestamp)(this.end));
        }
    }
});
// Util
// Styles
//# sourceMappingURL=VCalendarMonthly.js.map