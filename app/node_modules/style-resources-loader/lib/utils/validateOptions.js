"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const internalInjectorKeys = ['prepend', 'append'];
const validatePatterns = (patterns) => _1.isString(patterns) || Array.isArray(patterns) && patterns.every(_1.isString);
const validateInjector = (injector) => _1.isUndefined(injector)
    || _1.isFunction(injector)
    || internalInjectorKeys.includes(injector);
const validateGlobOptions = (globOptions) => _1.isUndefined(globOptions) || _1.isObject(globOptions);
const validateResolveUrl = (resolveUrl) => _1.isUndefined(resolveUrl) || _1.isBoolean(resolveUrl);
const valiateOptions = (options) => {
    const { patterns, injector, globOptions, resolveUrl } = options;
    if (!validatePatterns(patterns)) {
        throw new TypeError('[style-resources-loader] Expected options.patterns to be a string or an array of string. '
            + `Instead received ${typeof patterns}.`);
    }
    if (!validateInjector(injector)) {
        throw new TypeError('[style-resources-loader] Expected options.injector to be a function or `prepend`, `append`. '
            + `Instead received ${typeof injector}.`);
    }
    if (!validateGlobOptions(globOptions)) {
        throw new TypeError('[style-resources-loader] Expected options.globOptions to be an object. '
            + `Instead received ${typeof globOptions}.`);
    }
    if (!validateResolveUrl(resolveUrl)) {
        throw new TypeError('[style-resources-loader] Expected options.resolveUrl to be a boolean. '
            + `Instead received ${typeof resolveUrl}.`);
    }
    return true;
};
exports.default = valiateOptions;
//# sourceMappingURL=validateOptions.js.map