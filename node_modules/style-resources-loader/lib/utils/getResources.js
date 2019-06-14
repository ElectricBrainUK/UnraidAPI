"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const glob_1 = __importDefault(require("glob"));
const _1 = require(".");
async function getResources(options) {
    const { patterns, globOptions, resolveUrl } = options;
    const resourceFragments = await Promise.all(patterns
        .map(async (pattern) => {
        const partialFiles = (await util_1.default.promisify(glob_1.default)(pattern, globOptions)).filter(_1.isStyleFile);
        partialFiles.forEach(this.dependency.bind(this));
        const partialResources = await Promise.all(partialFiles.map(async (file) => {
            const content = await util_1.default.promisify(fs_1.default.readFile)(file, 'utf8');
            const resource = { file, content };
            return resolveUrl
                ? {
                    file,
                    content: Reflect.apply(_1.resolveImportUrl, this, [resource]),
                }
                : resource;
        }));
        return partialResources;
    }));
    const emptyResources = [];
    const resources = emptyResources.concat(...resourceFragments);
    return resources;
}
exports.default = getResources;
//# sourceMappingURL=getResources.js.map