import '../../../src/stylus/components/_date-picker-title.styl';
// Components
import VIcon from '../VIcon';
// Mixins
import PickerButton from '../../mixins/picker-button';
// Utils
import mixins from '../../util/mixins';
export default mixins(PickerButton
/* @vue/component */
).extend({
    name: 'v-date-picker-title',
    props: {
        date: {
            type: String,
            default: ''
        },
        disabled: Boolean,
        readonly: Boolean,
        selectingYear: Boolean,
        value: {
            type: String
        },
        year: {
            type: [Number, String],
            default: ''
        },
        yearIcon: {
            type: String
        }
    },
    data: function data() {
        return {
            isReversing: false
        };
    },
    computed: {
        computedTransition: function computedTransition() {
            return this.isReversing ? 'picker-reverse-transition' : 'picker-transition';
        }
    },
    watch: {
        value: function value(val, prev) {
            this.isReversing = val < prev;
        }
    },
    methods: {
        genYearIcon: function genYearIcon() {
            return this.$createElement(VIcon, {
                props: {
                    dark: true
                }
            }, this.yearIcon);
        },
        getYearBtn: function getYearBtn() {
            return this.genPickerButton('selectingYear', true, [String(this.year), this.yearIcon ? this.genYearIcon() : null], false, 'v-date-picker-title__year');
        },
        genTitleText: function genTitleText() {
            return this.$createElement('transition', {
                props: {
                    name: this.computedTransition
                }
            }, [this.$createElement('div', {
                domProps: { innerHTML: this.date || '&nbsp;' },
                key: this.value
            })]);
        },
        genTitleDate: function genTitleDate() {
            return this.genPickerButton('selectingYear', false, [this.genTitleText()], false, 'v-date-picker-title__date');
        }
    },
    render: function render(h) {
        return h('div', {
            staticClass: 'v-date-picker-title',
            'class': {
                'v-date-picker-title--disabled': this.disabled
            }
        }, [this.getYearBtn(), this.genTitleDate()]);
    }
});
//# sourceMappingURL=VDatePickerTitle.js.map