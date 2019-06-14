'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('../../../src/stylus/components/_date-picker-years.styl');

var _colorable = require('../../mixins/colorable');

var _colorable2 = _interopRequireDefault(_colorable);

var _util = require('./util');

var _mixins = require('../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Utils
exports.default = (0, _mixins2.default)(_colorable2.default
/* @vue/component */
).extend({
    name: 'v-date-picker-years',
    props: {
        format: Function,
        locale: {
            type: String,
            default: 'en-us'
        },
        min: [Number, String],
        max: [Number, String],
        readonly: Boolean,
        value: [Number, String]
    },
    data: function data() {
        return {
            defaultColor: 'primary'
        };
    },

    computed: {
        formatter: function formatter() {
            return this.format || (0, _util.createNativeLocaleFormatter)(this.locale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 });
        }
    },
    mounted: function mounted() {
        var _this = this;

        setTimeout(function () {
            var activeItem = _this.$el.getElementsByClassName('active')[0];
            if (activeItem) {
                _this.$el.scrollTop = activeItem.offsetTop - _this.$el.offsetHeight / 2 + activeItem.offsetHeight / 2;
            } else {
                _this.$el.scrollTop = _this.$el.scrollHeight / 2 - _this.$el.offsetHeight / 2;
            }
        });
    },

    methods: {
        genYearItem: function genYearItem(year) {
            var _this2 = this;

            var formatted = this.formatter('' + year);
            var active = parseInt(this.value, 10) === year;
            var color = active && (this.color || 'primary');
            return this.$createElement('li', this.setTextColor(color, {
                key: year,
                'class': { active: active },
                on: {
                    click: function click() {
                        return _this2.$emit('input', year);
                    }
                }
            }), formatted);
        },
        genYearItems: function genYearItems() {
            var children = [];
            var selectedYear = this.value ? parseInt(this.value, 10) : new Date().getFullYear();
            var maxYear = this.max ? parseInt(this.max, 10) : selectedYear + 100;
            var minYear = Math.min(maxYear, this.min ? parseInt(this.min, 10) : selectedYear - 100);
            for (var year = maxYear; year >= minYear; year--) {
                children.push(this.genYearItem(year));
            }
            return children;
        }
    },
    render: function render() {
        return this.$createElement('ul', {
            staticClass: 'v-date-picker-years',
            ref: 'years'
        }, this.genYearItems());
    }
});
// Mixins
//# sourceMappingURL=VDatePickerYears.js.map