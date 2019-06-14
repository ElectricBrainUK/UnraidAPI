'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* @vue/component */
exports.default = _vue2.default.extend({
    name: 'v-list-tile-action',
    functional: true,
    render: function render(h, _ref) {
        var data = _ref.data,
            _ref$children = _ref.children,
            children = _ref$children === undefined ? [] : _ref$children;

        data.staticClass = data.staticClass ? 'v-list__tile__action ' + data.staticClass : 'v-list__tile__action';
        var filteredChild = children.filter(function (VNode) {
            return VNode.isComment === false && VNode.text !== ' ';
        });
        if (filteredChild.length > 1) data.staticClass += ' v-list__tile__action--stack';
        return h('div', data, children);
    }
}); // Types
//# sourceMappingURL=VListTileAction.js.map