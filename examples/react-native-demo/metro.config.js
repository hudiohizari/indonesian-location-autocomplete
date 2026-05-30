const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo (so Metro can resolve local packages and root node_modules)
config.watchFolders = [workspaceRoot];

// 2. Set module resolution paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Point react/react-dom/react-native to the SINGLE copy at the workspace root
config.resolver.extraNodeModules = {
  'react': path.resolve(workspaceRoot, 'node_modules/react'),
  'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
};

// 4. Block duplicate local copies of react/react-dom AND non-mobile devDeps
//    This prevents Metro from finding the LOCAL copies in examples/react-native-demo/node_modules/,
//    forcing it to fall through to extraNodeModules (the single root copy).
config.resolver.blockList = [
  // Block LOCAL duplicate copies of react and react-dom to prevent dual-React crash
  /examples[/\\]react-native-demo[/\\]node_modules[/\\]react[/\\]/,
  /examples[/\\]react-native-demo[/\\]node_modules[/\\]react-dom[/\\]/,
  // Block non-mobile devDependencies (vite, vitest, esbuild) to prevent watcher crash on Windows
  /[/\\]node_modules[/\\]vite[/\\]/,
  /[/\\]node_modules[/\\]vitest[/\\]/,
  /[/\\]node_modules[/\\]@esbuild[/\\]/,
  /[/\\]node_modules[/\\]esbuild[/\\]/,
  ...(config.resolver.blockList || []),
];

module.exports = config;
