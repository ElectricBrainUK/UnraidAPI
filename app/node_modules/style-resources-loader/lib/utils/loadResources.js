"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
async function loadResources(source, callback) {
    try {
        const options = Reflect.apply(_1.normalizeOptions, this, []);
        const resources = await Reflect.apply(_1.getResources, this, [options]);
        const content = await Reflect.apply(_1.injectResources, this, [options, source, resources]);
        return callback(null, content);
    }
    catch (err) {
        return callback(err);
    }
}
exports.default = loadResources;
//# sourceMappingURL=loadResources.js.map