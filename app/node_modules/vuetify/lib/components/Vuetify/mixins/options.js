var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var OPTIONS_DEFAULTS = {
    minifyTheme: null,
    themeCache: null,
    customProperties: false,
    cspNonce: null
};
export default function options() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _extends({}, OPTIONS_DEFAULTS, options);
}
//# sourceMappingURL=options.js.map