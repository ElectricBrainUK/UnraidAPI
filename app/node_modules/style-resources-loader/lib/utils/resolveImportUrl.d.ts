import { LoaderContext, StyleResource } from '..';
declare function resolveImportUrl(this: LoaderContext, { file, content }: StyleResource): string;
export default resolveImportUrl;
