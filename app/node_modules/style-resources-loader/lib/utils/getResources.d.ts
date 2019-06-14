import { LoaderContext, StyleResource, StyleResourcesLoaderNormalizedOptions } from '..';
declare function getResources(this: LoaderContext, options: StyleResourcesLoaderNormalizedOptions): Promise<StyleResource[]>;
export default getResources;
