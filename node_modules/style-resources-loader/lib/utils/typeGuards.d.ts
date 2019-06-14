import isPromise from 'is-promise';
export declare const isUndefined: (arg: any) => arg is undefined;
export declare const isString: (arg: any) => arg is string;
export declare const isBoolean: (arg: any) => arg is boolean;
export declare const isObject: <T extends {}>(arg: any) => arg is T;
export declare const isFunction: <T extends (...args: any[]) => any>(arg: any) => arg is T;
export declare const isStyleFile: (file: string) => boolean;
export { isPromise };
