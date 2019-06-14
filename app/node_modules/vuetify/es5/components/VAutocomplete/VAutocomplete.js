'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Styles

// Extensions

// Utils


require('../../../src/stylus/components/_autocompletes.styl');

var _VSelect = require('../VSelect/VSelect');

var _VSelect2 = _interopRequireDefault(_VSelect);

var _VTextField = require('../VTextField/VTextField');

var _VTextField2 = _interopRequireDefault(_VTextField);

var _helpers = require('../../util/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultMenuProps = _extends({}, _VSelect.defaultMenuProps, {
    offsetY: true,
    offsetOverflow: true,
    transition: false
});
/* @vue/component */
exports.default = _VSelect2.default.extend({
    name: 'v-autocomplete',
    props: {
        allowOverflow: {
            type: Boolean,
            default: true
        },
        browserAutocomplete: {
            type: String,
            default: 'off'
        },
        filter: {
            type: Function,
            default: function _default(item, queryText, itemText) {
                return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1;
            }
        },
        hideNoData: Boolean,
        noFilter: Boolean,
        searchInput: {
            default: undefined
        },
        menuProps: {
            type: _VSelect2.default.options.props.menuProps.type,
            default: function _default() {
                return defaultMenuProps;
            }
        },
        autoSelectFirst: {
            type: Boolean,
            default: false
        }
    },
    data: function data(vm) {
        return {
            attrsInput: null,
            lazySearch: vm.searchInput
        };
    },
    computed: {
        classes: function classes() {
            return Object.assign({}, _VSelect2.default.options.computed.classes.call(this), {
                'v-autocomplete': true,
                'v-autocomplete--is-selecting-index': this.selectedIndex > -1
            });
        },
        computedItems: function computedItems() {
            return this.filteredItems;
        },
        selectedValues: function selectedValues() {
            var _this = this;

            return this.selectedItems.map(function (item) {
                return _this.getValue(item);
            });
        },
        hasDisplayedItems: function hasDisplayedItems() {
            var _this2 = this;

            return this.hideSelected ? this.filteredItems.some(function (item) {
                return !_this2.hasItem(item);
            }) : this.filteredItems.length > 0;
        },

        /**
         * The range of the current input text
         *
         * @return {Number}
         */
        currentRange: function currentRange() {
            if (this.selectedItem == null) return 0;
            return this.getText(this.selectedItem).toString().length;
        },
        filteredItems: function filteredItems() {
            var _this3 = this;

            if (!this.isSearching || this.noFilter || this.internalSearch == null) return this.allItems;
            return this.allItems.filter(function (item) {
                return _this3.filter(item, _this3.internalSearch.toString(), _this3.getText(item).toString());
            });
        },

        internalSearch: {
            get: function get() {
                return this.lazySearch;
            },
            set: function set(val) {
                this.lazySearch = val;
                this.$emit('update:searchInput', val);
            }
        },
        isAnyValueAllowed: function isAnyValueAllowed() {
            return false;
        },
        isDirty: function isDirty() {
            return this.searchIsDirty || this.selectedItems.length > 0;
        },
        isSearching: function isSearching() {
            if (this.multiple) return this.searchIsDirty;
            return this.searchIsDirty && this.internalSearch !== this.getText(this.selectedItem);
        },
        menuCanShow: function menuCanShow() {
            if (!this.isFocused) return false;
            return this.hasDisplayedItems || !this.hideNoData;
        },
        $_menuProps: function $_menuProps() {
            var props = _VSelect2.default.options.computed.$_menuProps.call(this);
            props.contentClass = ('v-autocomplete__content ' + (props.contentClass || '')).trim();
            return _extends({}, defaultMenuProps, props);
        },
        searchIsDirty: function searchIsDirty() {
            return this.internalSearch != null && this.internalSearch !== '';
        },
        selectedItem: function selectedItem() {
            var _this4 = this;

            if (this.multiple) return null;
            return this.selectedItems.find(function (i) {
                return _this4.valueComparator(_this4.getValue(i), _this4.getValue(_this4.internalValue));
            });
        },
        listData: function listData() {
            var data = _VSelect2.default.options.computed.listData.call(this);
            Object.assign(data.props, {
                items: this.virtualizedItems,
                noFilter: this.noFilter || !this.isSearching || !this.filteredItems.length,
                searchInput: this.internalSearch
            });
            return data;
        }
    },
    watch: {
        filteredItems: function filteredItems(val) {
            this.onFilteredItemsChanged(val);
        },
        internalValue: function internalValue() {
            this.setSearch();
        },
        isFocused: function isFocused(val) {
            if (val) {
                this.$refs.input && this.$refs.input.select();
            } else {
                this.updateSelf();
            }
        },
        isMenuActive: function isMenuActive(val) {
            if (val || !this.hasSlot) return;
            this.lazySearch = null;
        },
        items: function items(val, oldVal) {
            // If we are focused, the menu
            // is not active, hide no data is enabled,
            // and items change
            // User is probably async loading
            // items, try to activate the menu
            if (!(oldVal && oldVal.length) && this.hideNoData && this.isFocused && !this.isMenuActive && val.length) this.activateMenu();
        },
        searchInput: function searchInput(val) {
            this.lazySearch = val;
        },
        internalSearch: function internalSearch(val) {
            this.onInternalSearchChanged(val);
        },
        itemText: function itemText() {
            this.updateSelf();
        }
    },
    created: function created() {
        this.setSearch();
    },

    methods: {
        onFilteredItemsChanged: function onFilteredItemsChanged(val) {
            var _this5 = this;

            this.setMenuIndex(-1);
            this.$nextTick(function () {
                _this5.setMenuIndex(val.length > 0 && (val.length === 1 || _this5.autoSelectFirst) ? 0 : -1);
            });
        },
        onInternalSearchChanged: function onInternalSearchChanged(val) {
            this.updateMenuDimensions();
        },
        updateMenuDimensions: function updateMenuDimensions() {
            if (this.isMenuActive && this.$refs.menu) {
                this.$refs.menu.updateDimensions();
            }
        },
        changeSelectedIndex: function changeSelectedIndex(keyCode) {
            // Do not allow changing of selectedIndex
            // when search is dirty
            if (this.searchIsDirty) return;
            if (![_helpers.keyCodes.backspace, _helpers.keyCodes.left, _helpers.keyCodes.right, _helpers.keyCodes.delete].includes(keyCode)) return;
            var indexes = this.selectedItems.length - 1;
            if (keyCode === _helpers.keyCodes.left) {
                this.selectedIndex = this.selectedIndex === -1 ? indexes : this.selectedIndex - 1;
            } else if (keyCode === _helpers.keyCodes.right) {
                this.selectedIndex = this.selectedIndex >= indexes ? -1 : this.selectedIndex + 1;
            } else if (this.selectedIndex === -1) {
                this.selectedIndex = indexes;
                return;
            }
            var currentItem = this.selectedItems[this.selectedIndex];
            if ([_helpers.keyCodes.backspace, _helpers.keyCodes.delete].includes(keyCode) && !this.getDisabled(currentItem)) {
                var newIndex = this.selectedIndex === indexes ? this.selectedIndex - 1 : this.selectedItems[this.selectedIndex + 1] ? this.selectedIndex : -1;
                if (newIndex === -1) {
                    this.setValue(this.multiple ? [] : undefined);
                } else {
                    this.selectItem(currentItem);
                }
                this.selectedIndex = newIndex;
            }
        },
        clearableCallback: function clearableCallback() {
            this.internalSearch = undefined;
            _VSelect2.default.options.methods.clearableCallback.call(this);
        },
        genInput: function genInput() {
            var input = _VTextField2.default.options.methods.genInput.call(this);
            input.data.attrs.role = 'combobox';
            input.data.domProps.value = this.internalSearch;
            return input;
        },
        genSelections: function genSelections() {
            return this.hasSlot || this.multiple ? _VSelect2.default.options.methods.genSelections.call(this) : [];
        },
        onClick: function onClick() {
            if (this.isDisabled) return;
            this.selectedIndex > -1 ? this.selectedIndex = -1 : this.onFocus();
            this.activateMenu();
        },
        onEnterDown: function onEnterDown() {
            // Avoid invoking this method
            // will cause updateSelf to
            // be called emptying search
        },
        onInput: function onInput(e) {
            if (this.selectedIndex > -1) return;
            // If typing and menu is not currently active
            if (e.target.value) {
                this.activateMenu();
                if (!this.isAnyValueAllowed) this.setMenuIndex(0);
            }
            this.mask && this.resetSelections(e.target);
            this.internalSearch = e.target.value;
            this.badInput = e.target.validity && e.target.validity.badInput;
        },
        onKeyDown: function onKeyDown(e) {
            var keyCode = e.keyCode;
            _VSelect2.default.options.methods.onKeyDown.call(this, e);
            // The ordering is important here
            // allows new value to be updated
            // and then moves the index to the
            // proper location
            this.changeSelectedIndex(keyCode);
        },
        onTabDown: function onTabDown(e) {
            _VSelect2.default.options.methods.onTabDown.call(this, e);
            this.updateSelf();
        },
        setSelectedItems: function setSelectedItems() {
            _VSelect2.default.options.methods.setSelectedItems.call(this);
            // #4273 Don't replace if searching
            // #4403 Don't replace if focused
            if (!this.isFocused) this.setSearch();
        },
        setSearch: function setSearch() {
            var _this6 = this;

            // Wait for nextTick so selectedItem
            // has had time to update
            this.$nextTick(function () {
                _this6.internalSearch = _this6.multiple && _this6.internalSearch && _this6.isMenuActive ? _this6.internalSearch : !_this6.selectedItems.length || _this6.multiple || _this6.hasSlot ? null : _this6.getText(_this6.selectedItem);
            });
        },
        updateSelf: function updateSelf() {
            this.updateAutocomplete();
        },
        updateAutocomplete: function updateAutocomplete() {
            if (!this.searchIsDirty && !this.internalValue) return;
            if (!this.valueComparator(this.internalSearch, this.getValue(this.internalValue))) {
                this.setSearch();
            }
        },
        hasItem: function hasItem(item) {
            return this.selectedValues.indexOf(this.getValue(item)) > -1;
        }
    }
});
//# sourceMappingURL=VAutocomplete.js.map