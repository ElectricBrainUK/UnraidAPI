"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const is_plain_object_1 = __importDefault(require("is-plain-object"));
const is_callable_1 = __importDefault(require("is-callable"));
const is_promise_1 = __importDefault(require("is-promise"));
exports.isPromise = is_promise_1.default;
const _1 = require(".");
exports.isUndefined = (arg) => typeof arg === 'undefined';
exports.isString = (arg) => typeof arg === 'string';
exports.isBoolean = (arg) => typeof arg === 'boolean';
exports.isObject = (arg) => is_plain_object_1.default(arg);
exports.isFunction = (arg) => is_callable_1.default(arg);
exports.isStyleFile = (file) => _1.supportedFileExtsWithDot.includes(path_1.default.extname(file));
//# sourceMappingURL=typeGuards.js.map