"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
async function injectResources(options, source, resources) {
    const { injector } = options;
    const dist = injector(source, resources);
    const content = _1.isPromise(dist) ? await dist : dist;
    if (!_1.isString(content) && !(content instanceof Buffer)) {
        throw new TypeError('[style-resources-loader] Expected options.injector(...) returns a string or a Buffer. '
            + `Instead received ${typeof content}.`);
    }
    return content;
}
exports.default = injectResources;
//# sourceMappingURL=injectResources.js.map