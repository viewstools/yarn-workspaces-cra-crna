const blacklist = require('metro/src/blacklist')
const getWorkspaces = require('get-yarn-workspaces')
const path = require('path')

module.exports = function getConfig(from, options = {}) {
  const workspaces = getWorkspaces(from)

  const config = {
    extraNodeModules: {
      'react-native': path.resolve(from, 'node_modules/react-native'),
    },
    getBlacklistRE() {
      return blacklist(
        workspaces.map(
          workspacePath =>
            `/${workspacePath.replace(
              /\//g,
              '[/\\\\]'
            )}[/\\\\]node_modules[/\\\\]react-native[/\\\\].*/`
        )
      )
    },
    getProjectRoots() {
      return [
        // Keep your project directory.
        path.resolve(from),

        // Include your forked package as a new root.
        options.nodeModules || path.resolve(from, '..', 'node_modules'),
      ].concat(workspaces)
    },
    getEnableBabelRCLookup() {
      // Whether Metro should pick up .babelrc configs from host project
      return options.enableBabelRCLookup || true
    }
  }
  return config
}
