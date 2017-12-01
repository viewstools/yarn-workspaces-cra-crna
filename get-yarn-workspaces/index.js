const findRoot = require('find-root')
const fs = require('fs')
const path = require('path')

module.exports = function getWorkspaces(from) {
  const root = findRoot(from, dir => {
    const pkg = path.join(dir, 'package.json')
    return fs.existsSync(pkg) && 'workspaces' in require(pkg)
  })

  const { workspaces } = require(path.join(root, 'package.json'))

  return workspaces.map(name => path.join(root, name))
}
