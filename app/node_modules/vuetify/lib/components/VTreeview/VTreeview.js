var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Styles
import '../../../src/stylus/components/_treeview.styl';
// Components
import VTreeviewNode, { VTreeviewNodeProps } from './VTreeviewNode';
// Mixins
import Themeable from '../../mixins/themeable';
import { provide as RegistrableProvide } from '../../mixins/registrable';
// Utils
import { arrayDiff, deepEqual, getObjectValueByPath } from '../../util/helpers';
import mixins from '../../util/mixins';
import { consoleWarn } from '../../util/console';
import { filterTreeItems, filterTreeItem } from './util/filterTreeItems';
export default mixins(RegistrableProvide('treeview'), Themeable
/* @vue/component */
).extend({
    name: 'v-treeview',
    provide: function provide() {
        return { treeview: this };
    },

    props: _extends({
        active: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        items: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        hoverable: Boolean,
        multipleActive: Boolean,
        open: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        openAll: Boolean,
        returnObject: {
            type: Boolean,
            default: false // TODO: Should be true in next major
        },
        value: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        search: String,
        filter: Function
    }, VTreeviewNodeProps),
    data: function data() {
        return {
            nodes: {},
            selectedCache: new Set(),
            activeCache: new Set(),
            openCache: new Set()
        };
    },
    computed: {
        excludedItems: function excludedItems() {
            var excluded = new Set();
            if (!this.search) return excluded;
            for (var i = 0; i < this.items.length; i++) {
                filterTreeItems(this.filter || filterTreeItem, this.items[i], this.search, this.itemKey, this.itemText, this.itemChildren, excluded);
            }
            return excluded;
        }
    },
    watch: {
        items: {
            handler: function handler() {
                var _this = this;

                var oldKeys = Object.keys(this.nodes).map(function (k) {
                    return getObjectValueByPath(_this.nodes[k].item, _this.itemKey);
                });
                var newKeys = this.getKeys(this.items);
                var diff = arrayDiff(newKeys, oldKeys);
                // We only want to do stuff if items have changed
                if (!diff.length && newKeys.length < oldKeys.length) return;
                // If nodes are removed we need to clear them from this.nodes
                diff.forEach(function (k) {
                    return delete _this.nodes[k];
                });
                var oldSelectedCache = [].concat(_toConsumableArray(this.selectedCache));
                this.selectedCache = new Set();
                this.activeCache = new Set();
                this.openCache = new Set();
                this.buildTree(this.items);
                // Only emit selected if selection has changed
                // as a result of items changing. This fixes a
                // potential double emit when selecting a node
                // with dynamic children
                if (!deepEqual(oldSelectedCache, [].concat(_toConsumableArray(this.selectedCache)))) this.emitSelected();
            },

            deep: true
        },
        active: function active(value) {
            this.handleNodeCacheWatcher(value, this.activeCache, this.updateActive, this.emitActive);
        },
        value: function value(_value) {
            this.handleNodeCacheWatcher(_value, this.selectedCache, this.updateSelected, this.emitSelected);
        },
        open: function open(value) {
            this.handleNodeCacheWatcher(value, this.openCache, this.updateOpen, this.emitOpen);
        }
    },
    created: function created() {
        var _this2 = this;

        this.buildTree(this.items);
        this.value.forEach(function (key) {
            return _this2.updateSelected(key, true);
        });
        this.emitSelected();
        this.active.forEach(function (key) {
            return _this2.updateActive(key, true);
        });
        this.emitActive();
    },
    mounted: function mounted() {
        var _this3 = this;

        // Save the developer from themselves
        if (this.$slots.prepend || this.$slots.append) {
            consoleWarn('The prepend and append slots require a slot-scope attribute', this);
        }
        if (this.openAll) {
            this.updateAll(true);
        } else {
            this.open.forEach(function (key) {
                return _this3.updateOpen(key, true);
            });
            this.emitOpen();
        }
    },

    methods: {
        /** @public */
        updateAll: function updateAll(value) {
            var _this4 = this;

            Object.keys(this.nodes).forEach(function (key) {
                return _this4.updateOpen(getObjectValueByPath(_this4.nodes[key].item, _this4.itemKey), value);
            });
            this.emitOpen();
        },
        getKeys: function getKeys(items) {
            var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            for (var i = 0; i < items.length; i++) {
                var key = getObjectValueByPath(items[i], this.itemKey);
                keys.push(key);
                var children = getObjectValueByPath(items[i], this.itemChildren);
                if (children) {
                    keys.push.apply(keys, _toConsumableArray(this.getKeys(children)));
                }
            }
            return keys;
        },
        buildTree: function buildTree(items) {
            var _this5 = this;

            var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var key = getObjectValueByPath(item, this.itemKey);
                var children = getObjectValueByPath(item, this.itemChildren, []);
                var oldNode = this.nodes.hasOwnProperty(key) ? this.nodes[key] : {
                    isSelected: false, isIndeterminate: false, isActive: false, isOpen: false, vnode: null
                };
                var node = {
                    vnode: oldNode.vnode,
                    parent: parent,
                    children: children.map(function (c) {
                        return getObjectValueByPath(c, _this5.itemKey);
                    }),
                    item: item
                };
                this.buildTree(children, key);
                // This fixed bug with dynamic children resetting selected parent state
                if (!this.nodes.hasOwnProperty(key) && parent !== null && this.nodes.hasOwnProperty(parent)) {
                    node.isSelected = this.nodes[parent].isSelected;
                    node.isIndeterminate = this.nodes[parent].isIndeterminate;
                } else {
                    node.isSelected = oldNode.isSelected;
                    node.isIndeterminate = oldNode.isIndeterminate;
                }
                node.isActive = oldNode.isActive;
                node.isOpen = oldNode.isOpen;
                this.nodes[key] = !children.length ? node : this.calculateState(node, this.nodes);
                // Don't forget to rebuild cache
                if (this.nodes[key].isSelected) this.selectedCache.add(key);
                if (this.nodes[key].isActive) this.activeCache.add(key);
                if (this.nodes[key].isOpen) this.openCache.add(key);
                this.updateVnodeState(key);
            }
        },
        calculateState: function calculateState(node, state) {
            var counts = node.children.reduce(function (counts, child) {
                counts[0] += +Boolean(state[child].isSelected);
                counts[1] += +Boolean(state[child].isIndeterminate);
                return counts;
            }, [0, 0]);
            node.isSelected = !!node.children.length && counts[0] === node.children.length;
            node.isIndeterminate = !node.isSelected && (counts[0] > 0 || counts[1] > 0);
            return node;
        },
        emitOpen: function emitOpen() {
            this.emitNodeCache('update:open', this.openCache);
        },
        emitSelected: function emitSelected() {
            this.emitNodeCache('input', this.selectedCache);
        },
        emitActive: function emitActive() {
            this.emitNodeCache('update:active', this.activeCache);
        },
        emitNodeCache: function emitNodeCache(event, cache) {
            var _this6 = this;

            this.$emit(event, this.returnObject ? [].concat(_toConsumableArray(cache)).map(function (key) {
                return _this6.nodes[key].item;
            }) : [].concat(_toConsumableArray(cache)));
        },
        handleNodeCacheWatcher: function handleNodeCacheWatcher(value, cache, updateFn, emitFn) {
            var _this7 = this;

            value = this.returnObject ? value.map(function (v) {
                return getObjectValueByPath(v, _this7.itemKey);
            }) : value;
            var old = [].concat(_toConsumableArray(cache));
            if (deepEqual(old, value)) return;
            old.forEach(function (key) {
                return updateFn(key, false);
            });
            value.forEach(function (key) {
                return updateFn(key, true);
            });
            emitFn();
        },
        getDescendants: function getDescendants(key) {
            var _descendants;

            var descendants = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            var children = this.nodes[key].children;
            (_descendants = descendants).push.apply(_descendants, _toConsumableArray(children));
            for (var i = 0; i < children.length; i++) {
                descendants = this.getDescendants(children[i], descendants);
            }
            return descendants;
        },
        getParents: function getParents(key) {
            var parent = this.nodes[key].parent;
            var parents = [];
            while (parent !== null) {
                parents.push(parent);
                parent = this.nodes[parent].parent;
            }
            return parents;
        },
        register: function register(node) {
            var key = getObjectValueByPath(node.item, this.itemKey);
            this.nodes[key].vnode = node;
            this.updateVnodeState(key);
        },
        unregister: function unregister(node) {
            var key = getObjectValueByPath(node.item, this.itemKey);
            if (this.nodes[key]) this.nodes[key].vnode = null;
        },
        updateActive: function updateActive(key, isActive) {
            var _this8 = this;

            if (!this.nodes.hasOwnProperty(key)) return;
            if (!this.multipleActive) {
                this.activeCache.forEach(function (active) {
                    _this8.nodes[active].isActive = false;
                    _this8.updateVnodeState(active);
                    _this8.activeCache.delete(active);
                });
            }
            var node = this.nodes[key];
            if (!node) return;
            if (isActive) this.activeCache.add(key);else this.activeCache.delete(key);
            node.isActive = isActive;
            this.updateVnodeState(key);
        },
        updateSelected: function updateSelected(key, isSelected) {
            var _this9 = this;

            if (!this.nodes.hasOwnProperty(key)) return;
            var changed = new Map();
            var descendants = [key].concat(_toConsumableArray(this.getDescendants(key)));
            descendants.forEach(function (descendant) {
                _this9.nodes[descendant].isSelected = isSelected;
                _this9.nodes[descendant].isIndeterminate = false;
                changed.set(descendant, isSelected);
            });
            var parents = this.getParents(key);
            parents.forEach(function (parent) {
                _this9.nodes[parent] = _this9.calculateState(_this9.nodes[parent], _this9.nodes);
                changed.set(parent, _this9.nodes[parent].isSelected);
            });
            var all = [key].concat(_toConsumableArray(descendants), _toConsumableArray(parents));
            all.forEach(this.updateVnodeState);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = changed.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _ref = _step.value;

                    var _ref2 = _slicedToArray(_ref, 2);

                    var _key = _ref2[0];
                    var value = _ref2[1];

                    value === true ? this.selectedCache.add(_key) : this.selectedCache.delete(_key);
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
        },
        updateOpen: function updateOpen(key, isOpen) {
            var _this10 = this;

            if (!this.nodes.hasOwnProperty(key)) return;
            var node = this.nodes[key];
            var children = getObjectValueByPath(node.item, this.itemChildren);
            if (children && !children.length && node.vnode && !node.vnode.hasLoaded) {
                node.vnode.checkChildren().then(function () {
                    return _this10.updateOpen(key, isOpen);
                });
            } else if (children && children.length) {
                node.isOpen = isOpen;
                node.isOpen ? this.openCache.add(key) : this.openCache.delete(key);
                this.updateVnodeState(key);
            }
        },
        updateVnodeState: function updateVnodeState(key) {
            var node = this.nodes[key];
            if (node && node.vnode) {
                node.vnode.isSelected = node.isSelected;
                node.vnode.isIndeterminate = node.isIndeterminate;
                node.vnode.isActive = node.isActive;
                node.vnode.isOpen = node.isOpen;
            }
        },
        isExcluded: function isExcluded(key) {
            return !!this.search && this.excludedItems.has(key);
        }
    },
    render: function render(h) {
        var children = this.items.length ? this.items.map(VTreeviewNode.options.methods.genChild.bind(this))
        /* istanbul ignore next */
        : this.$slots.default; // TODO: remove type annotation with TS 3.2
        return h('div', {
            staticClass: 'v-treeview',
            class: _extends({
                'v-treeview--hoverable': this.hoverable
            }, this.themeClasses)
        }, children);
    }
});
//# sourceMappingURL=VTreeview.js.map