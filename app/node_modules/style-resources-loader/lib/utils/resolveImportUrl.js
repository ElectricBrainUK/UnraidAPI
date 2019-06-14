"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
function resolveImportUrl({ file, content }) {
    return content.replace(/(@import|@require)(\s+(?:\([a-z,\s]+\)\s*)?)(?:'([^']+)'|"([^"]+)"|([^\s"';]+))/g, (match, importDeclaration, spacingOrOptions, single, double, unquoted) => {
        const pathToResource = single || double || unquoted;
        if (!pathToResource || /^[~/]/.test(pathToResource)) {
            return match;
        }
        const absolutePathToResource = path_1.default.resolve(path_1.default.dirname(file), pathToResource);
        const relativePathFromContextToResource = path_1.default.relative(this.context, absolutePathToResource)
            .split(path_1.default.sep)
            .join('/');
        const quote = (match.match(/['"]$/) || [''])[0];
        return `${importDeclaration}${spacingOrOptions}${quote}${relativePathFromContextToResource}${quote}`;
    });
}
exports.default = resolveImportUrl;
//# sourceMappingURL=resolveImportUrl.js.map