"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const loader = function (source) {
    this.cacheable && this.cacheable();
    const callback = this.async();
    if (!utils_1.isFunction(callback)) {
        throw new Error('[style-resources-loader] Synchronous compilation is not supported.');
    }
    Reflect.apply(utils_1.loadResources, this, [source, callback]);
};
exports.default = loader;
//# sourceMappingURL=loader.js.map