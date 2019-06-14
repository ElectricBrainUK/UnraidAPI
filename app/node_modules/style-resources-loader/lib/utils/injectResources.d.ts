/// <reference types="node" />
import { LoaderContext, StyleResources, StyleResourcesLoaderNormalizedOptions } from '..';
declare function injectResources(this: LoaderContext, options: StyleResourcesLoaderNormalizedOptions, source: string | Buffer, resources: StyleResources): Promise<string | Buffer>;
export default injectResources;
