const findRoot = require('find-root')
const fs = require('fs')
const path = require('path')
const globa = require('glob')

module.exports = function getWorkspaces(from) {
  const root = findRoot(from, dir => {
    const pkg = path.join(dir, 'package.json')
    return fs.existsSync(pkg) && 'workspaces' in require(pkg)
  })

  const { workspaces } = require(path.join(root, 'package.json'))
  const paths = [].concat.apply(
    [],
    workspaces
      .map(name => path.join(root, name))
      .map(p => {
        if (!p.match(/\*/)) return p
        return glob.sync(p)
      })
  )
  return paths
}
