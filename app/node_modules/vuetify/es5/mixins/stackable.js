'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _helpers = require('../util/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* @vue/component */
exports.default = _vue2.default.extend().extend({
    name: 'stackable',
    data: function data() {
        return {
            stackClass: 'unpecified',
            stackElement: null,
            stackExclude: null,
            stackMinZIndex: 0,
            isActive: false
        };
    },

    computed: {
        activeZIndex: function activeZIndex() {
            if (typeof window === 'undefined') return 0;
            var content = this.stackElement || this.$refs.content;
            // Return current zindex if not active
            var index = !this.isActive ? (0, _helpers.getZIndex)(content) : this.getMaxZIndex(this.stackExclude || [content]) + 2;
            if (index == null) return index;
            // Return max current z-index (excluding self) + 2
            // (2 to leave room for an overlay below, if needed)
            return parseInt(index);
        }
    },
    methods: {
        getMaxZIndex: function getMaxZIndex() {
            var exclude = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var base = this.$el;
            // Start with lowest allowed z-index or z-index of
            // base component's element, whichever is greater
            var zis = [this.stackMinZIndex, (0, _helpers.getZIndex)(base)];
            // Convert the NodeList to an array to
            // prevent an Edge bug with Symbol.iterator
            // https://github.com/vuetifyjs/vuetify/issues/2146
            var activeElements = [].concat(_toConsumableArray(document.getElementsByClassName(this.stackClass)));
            // Get z-index for all active dialogs
            for (var index = 0; index < activeElements.length; index++) {
                if (!exclude.includes(activeElements[index])) {
                    zis.push((0, _helpers.getZIndex)(activeElements[index]));
                }
            }
            return Math.max.apply(Math, zis);
        }
    }
});
//# sourceMappingURL=stackable.js.map