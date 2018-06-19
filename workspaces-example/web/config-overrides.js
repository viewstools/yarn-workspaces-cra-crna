const rewireYarnWorkspaces = require('react-app-rewire-yarn-workspaces')
const package = require('../package.json')

module.exports = {
  webpack: function(config, env) {
    return rewireYarnWorkspaces(config, env)
  },
  jest: function(config) {
    if (package.workspaces) {
      config.transformIgnorePatterns = package.workspaces.map(
        key => `<rootDir>/node_modules/(?!${key})`
      )
    }
    return config
  },
}
