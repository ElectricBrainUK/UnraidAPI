// const tsConfig = require('./tsconfig.server.json');
const tsConfigPaths = require('tsconfig-paths');

const baseUrl = './dist'; // Either absolute or relative path. If relative it's resolved to current working directory.
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: {},
  // paths: tsConfig.compilerOptions.paths,
});
