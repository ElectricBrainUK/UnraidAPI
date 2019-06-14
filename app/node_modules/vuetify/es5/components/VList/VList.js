'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Styles

// Mixins

// Types


require('../../../src/stylus/components/_lists.styl');

var _themeable = require('../../mixins/themeable');

var _themeable2 = _interopRequireDefault(_themeable);

var _registrable = require('../../mixins/registrable');

var _mixins = require('../../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _mixins2.default)((0, _registrable.provide)('list'), _themeable2.default
/* @vue/component */
).extend({
    name: 'v-list',
    provide: function provide() {
        return {
            listClick: this.listClick
        };
    },

    props: {
        dense: Boolean,
        expand: Boolean,
        subheader: Boolean,
        threeLine: Boolean,
        twoLine: Boolean
    },
    data: function data() {
        return {
            groups: []
        };
    },
    computed: {
        classes: function classes() {
            return _extends({
                'v-list--dense': this.dense,
                'v-list--subheader': this.subheader,
                'v-list--two-line': this.twoLine,
                'v-list--three-line': this.threeLine
            }, this.themeClasses);
        }
    },
    methods: {
        register: function register(content) {
            this.groups.push(content);
        },
        unregister: function unregister(content) {
            var index = this.groups.findIndex(function (g) {
                return g._uid === content._uid;
            });
            if (index > -1) this.groups.splice(index, 1);
        },
        listClick: function listClick(uid) {
            if (this.expand) return;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.groups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var group = _step.value;

                    group.toggle(uid);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    },
    render: function render(h) {
        var data = {
            staticClass: 'v-list',
            class: this.classes,
            attrs: {
                role: 'list'
            }
        };
        return h('div', data, [this.$slots.default]);
    }
});
//# sourceMappingURL=VList.js.map