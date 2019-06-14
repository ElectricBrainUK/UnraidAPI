/// <reference types="node" />
import { loader } from 'webpack';
import glob from 'glob';
export declare type Loader = loader.Loader;
export declare type LoaderContext = loader.LoaderContext;
export declare type LoaderCallback = loader.loaderCallback;
export declare type StyleResourcesFileExt = 'css' | 'sass' | 'scss' | 'less' | 'styl';
export interface StyleResource {
    file: string;
    content: string;
}
export declare type StyleResources = ReadonlyArray<StyleResource>;
export declare type StyleResourcesFunctionalInjector = (source: string | Buffer, resources: StyleResources) => string | Buffer | Promise<string | Buffer>;
export declare type StyleResourcesInjector = 'prepend' | 'append' | StyleResourcesFunctionalInjector;
export declare type StyleResourcesNormalizedInjector = StyleResourcesFunctionalInjector;
export interface StyleResourcesLoaderOptions {
    patterns: string | string[];
    injector?: StyleResourcesInjector;
    globOptions?: glob.IOptions;
    resolveUrl?: boolean;
}
export interface StyleResourcesLoaderNormalizedOptions {
    patterns: string[];
    injector: StyleResourcesNormalizedInjector;
    globOptions: glob.IOptions;
    resolveUrl: boolean;
}
