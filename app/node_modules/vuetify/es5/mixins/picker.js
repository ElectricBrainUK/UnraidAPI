'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _VPicker = require('../components/VPicker');

var _VPicker2 = _interopRequireDefault(_VPicker);

var _colorable = require('./colorable');

var _colorable2 = _interopRequireDefault(_colorable);

var _themeable = require('./themeable');

var _themeable2 = _interopRequireDefault(_themeable);

var _mixins = require('../util/mixins');

var _mixins2 = _interopRequireDefault(_mixins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Components
exports.default = (0, _mixins2.default)(_colorable2.default, _themeable2.default
/* @vue/component */
).extend({
    name: 'picker',
    props: {
        fullWidth: Boolean,
        headerColor: String,
        landscape: Boolean,
        noTitle: Boolean,
        width: {
            type: [Number, String],
            default: 290
        }
    },
    methods: {
        genPickerTitle: function genPickerTitle() {
            return null;
        },
        genPickerBody: function genPickerBody() {
            return null;
        },
        genPickerActionsSlot: function genPickerActionsSlot() {
            return this.$scopedSlots.default ? this.$scopedSlots.default({
                save: this.save,
                cancel: this.cancel
            }) : this.$slots.default;
        },
        genPicker: function genPicker(staticClass) {
            var children = [];
            if (!this.noTitle) {
                var title = this.genPickerTitle();
                title && children.push(title);
            }
            var body = this.genPickerBody();
            body && children.push(body);
            children.push(this.$createElement('template', { slot: 'actions' }, [this.genPickerActionsSlot()]));
            return this.$createElement(_VPicker2.default, {
                staticClass: staticClass,
                props: {
                    color: this.headerColor || this.color,
                    dark: this.dark,
                    fullWidth: this.fullWidth,
                    landscape: this.landscape,
                    light: this.light,
                    width: this.width
                }
            }, children);
        }
    }
});
// Utils

// Mixins
//# sourceMappingURL=picker.js.map