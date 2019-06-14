var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Styles
import '../../../src/stylus/components/_counters.styl';
// Mixins
import Themeable, { functionalThemeClasses } from '../../mixins/themeable';
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(Themeable).extend({
    name: 'v-counter',
    functional: true,
    props: {
        value: {
            type: [Number, String],
            default: ''
        },
        max: [Number, String]
    },
    render: function render(h, ctx) {
        var props = ctx.props;

        var max = parseInt(props.max, 10);
        var value = parseInt(props.value, 10);
        var content = max ? value + ' / ' + max : String(props.value);
        var isGreater = max && value > max;
        return h('div', {
            staticClass: 'v-counter',
            class: _extends({
                'error--text': isGreater
            }, functionalThemeClasses(ctx))
        }, content);
    }
});
//# sourceMappingURL=VCounter.js.map