"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = require("loader-utils");
const _1 = require(".");
const normalizePatterns = (patterns) => Array.isArray(patterns) ? patterns : [patterns];
const normalizeInjector = (injector) => {
    if (_1.isUndefined(injector) || injector === 'prepend') {
        return (source, resources) => resources.map(({ content }) => content).join('') + source;
    }
    if (injector === 'append') {
        return (source, resources) => source + resources.map(({ content }) => content).join('');
    }
    return injector;
};
function normalizeOptions() {
    const options = loader_utils_1.getOptions(this) || {};
    if (!_1.validateOptions(options)) {
        throw new TypeError('[style-resources-loader] This error is caused by a bug in options validator. '
            + 'Please file an issue: https://github.com/yenshih/style-resources-loader/issues.');
    }
    const { patterns, injector, globOptions = {}, resolveUrl = true, } = options;
    return {
        patterns: normalizePatterns(patterns),
        injector: normalizeInjector(injector),
        globOptions,
        resolveUrl,
    };
}
exports.default = normalizeOptions;
//# sourceMappingURL=normalizeOptions.js.map