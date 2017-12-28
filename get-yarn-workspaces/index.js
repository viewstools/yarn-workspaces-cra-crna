const findRoot = require('find-root');
const flatten = require('flatten');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = function getWorkspaces(from) {
  const root = findRoot(from, dir => {
    const pkg = path.join(dir, 'package.json');
    return fs.existsSync(pkg) && 'workspaces' in require(pkg);
  });

  const {workspaces} = require(path.join(root, 'package.json'));
  return flatten(workspaces.map(name => glob.sync(path.join(root, name))));
};
