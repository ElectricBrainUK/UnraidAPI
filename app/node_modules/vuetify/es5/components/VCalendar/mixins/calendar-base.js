'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mixins = require('../../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

var _themeable = require('../../../mixins/themeable');

var _themeable2 = _interopRequireDefault(_themeable);

var _colorable = require('../../../mixins/colorable');

var _colorable2 = _interopRequireDefault(_colorable);

var _times = require('./times');

var _times2 = _interopRequireDefault(_times);

var _mouse = require('./mouse');

var _mouse2 = _interopRequireDefault(_mouse);

var _props = require('../util/props');

var _props2 = _interopRequireDefault(_props);

var _timestamp = require('../util/timestamp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* @vue/component */

// Util
exports.default = (0, _mixins2.default)(_colorable2.default, _themeable2.default, _times2.default, _mouse2.default).extend({
    name: 'calendar-base',
    props: _props2.default.base,
    computed: {
        weekdaySkips: function weekdaySkips() {
            return (0, _timestamp.getWeekdaySkips)(this.weekdays);
        },
        parsedStart: function parsedStart() {
            return (0, _timestamp.parseTimestamp)(this.start);
        },
        parsedEnd: function parsedEnd() {
            return (0, _timestamp.parseTimestamp)(this.end);
        },
        days: function days() {
            return (0, _timestamp.createDayList)(this.parsedStart, this.parsedEnd, this.times.today, this.weekdaySkips);
        },
        dayFormatter: function dayFormatter() {
            if (this.dayFormat) {
                return this.dayFormat;
            }
            var options = { timeZone: 'UTC', day: 'numeric' };
            return (0, _timestamp.createNativeLocaleFormatter)(this.locale, function (_tms, _short) {
                return options;
            });
        },
        weekdayFormatter: function weekdayFormatter() {
            if (this.weekdayFormat) {
                return this.weekdayFormat;
            }
            var longOptions = { timeZone: 'UTC', weekday: 'long' };
            var shortOptions = { timeZone: 'UTC', weekday: 'short' };
            return (0, _timestamp.createNativeLocaleFormatter)(this.locale, function (_tms, short) {
                return short ? shortOptions : longOptions;
            });
        }
    },
    methods: {
        getRelativeClasses: function getRelativeClasses(timestamp) {
            var outside = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return {
                'v-present': timestamp.present,
                'v-past': timestamp.past,
                'v-future': timestamp.future,
                'v-outside': outside
            };
        },
        getStartOfWeek: function getStartOfWeek(timestamp) {
            return (0, _timestamp.getStartOfWeek)(timestamp, this.weekdays, this.times.today);
        },
        getEndOfWeek: function getEndOfWeek(timestamp) {
            return (0, _timestamp.getEndOfWeek)(timestamp, this.weekdays, this.times.today);
        }
    }
}); // Mixins
//# sourceMappingURL=calendar-base.js.map