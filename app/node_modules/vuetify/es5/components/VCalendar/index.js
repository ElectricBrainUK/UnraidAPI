'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VCalendarMonthly = exports.VCalendarWeekly = exports.VCalendarDaily = exports.VCalendar = undefined;

var _VCalendar = require('./VCalendar');

var _VCalendar2 = _interopRequireDefault(_VCalendar);

var _VCalendarDaily = require('./VCalendarDaily');

var _VCalendarDaily2 = _interopRequireDefault(_VCalendarDaily);

var _VCalendarWeekly = require('./VCalendarWeekly');

var _VCalendarWeekly2 = _interopRequireDefault(_VCalendarWeekly);

var _VCalendarMonthly = require('./VCalendarMonthly');

var _VCalendarMonthly2 = _interopRequireDefault(_VCalendarMonthly);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.VCalendar = _VCalendar2.default;
exports.VCalendarDaily = _VCalendarDaily2.default;
exports.VCalendarWeekly = _VCalendarWeekly2.default;
exports.VCalendarMonthly = _VCalendarMonthly2.default;
exports.default = {
    $_vuetify_subcomponents: {
        VCalendar: _VCalendar2.default,
        VCalendarDaily: _VCalendarDaily2.default,
        VCalendarWeekly: _VCalendarWeekly2.default,
        VCalendarMonthly: _VCalendarMonthly2.default
    }
};
//# sourceMappingURL=index.js.map