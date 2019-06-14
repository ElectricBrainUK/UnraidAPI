var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Styles
import '../../../src/stylus/components/_subheaders.styl';
// Mixins
import Themeable from '../../mixins/themeable';
import mixins from '../../util/mixins';
export default mixins(Themeable
/* @vue/component */
).extend({
    name: 'v-subheader',
    props: {
        inset: Boolean
    },
    render: function render(h) {
        return h('div', {
            staticClass: 'v-subheader',
            class: _extends({
                'v-subheader--inset': this.inset
            }, this.themeClasses),
            attrs: this.$attrs,
            on: this.$listeners
        }, this.$slots.default);
    }
});
//# sourceMappingURL=VSubheader.js.map