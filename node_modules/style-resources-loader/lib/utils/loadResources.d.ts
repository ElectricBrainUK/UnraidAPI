/// <reference types="node" />
import { LoaderContext, LoaderCallback } from '..';
declare function loadResources(this: LoaderContext, source: string | Buffer, callback: LoaderCallback): Promise<void>;
export default loadResources;
