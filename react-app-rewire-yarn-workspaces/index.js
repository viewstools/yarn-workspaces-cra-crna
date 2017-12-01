const getWorkspaces = require('get-yarn-workspaces')

module.exports = function rewireYarnWorkspaces(config, env, from) {
  const babel = config.module.rules
    .find(rule => 'oneOf' in rule)
    .oneOf.find(rule => /babel-loader/.test(rule.loader))

  if (!Array.isArray(babel.include)) {
    babel.include = [babel.include]
  }

  babel.include = babel.include.concat(getWorkspaces(from))

  return config
}
