# How to use yarn workspaces with Create React App and Create React Native App (Expo) to share common code across

[This post is on medium too!](https://medium.com/viewsdx/how-to-use-yarn-workspaces-with-create-react-app-and-create-react-native-app-expo-to-share-common-ea27bc4bad62)

The goal of this tutorial is to make a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)
using [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) to share
common code across a [Create React App (CRA)](https://github.com/facebookincubator/create-react-app)
and a [Create React Native App (CRNA/Expo)](https://github.com/react-community/create-react-native-app).

There are currently some issues with the projects that when fixed, these
workarounds shouldn't be needed anymore:
- [facebook/metro#1](https://github.com/facebook/metro-bundler/issues/1),
- [react-community/create-react-native-app#232](https://github.com/react-community/create-react-native-app/issues/232),
- [react-community/create-react-native-app#340](https://github.com/react-community/create-react-native-app/issues/340),
- [react-community/create-react-native-app#408](https://github.com/react-community/create-react-native-app/issues/408),
- [facebookincubator/create-react-app#3405](https://github.com/facebookincubator/create-react-app/issues/3405),
- [facebookincubator/create-react-app#3435](https://github.com/facebookincubator/create-react-app/issues/3435),
- [yarnpkg/yarn#3882](https://github.com/yarnpkg/yarn/issues/3882).

Some of the solutions below may also help for lerna setups.

## Pre-requisites
Make sure you're running node ~ version 8 and at least yarn 1.3.0 and have
`create-react-app` and `create-react-native-app` installed.

## Setup workspaces
In this guide, we'll setup four folders but feel free to structure it as you see
fit:
- `web` the CRA project,
- `native` the CRNA project,
- `core` common logic, and
- `views` for shared UI.


Make a new folder where you want your workspaces to be and add a `package.json`
that looks like this:

```json
{
  "private": true,
  "workspaces": [
    "web",
    "native",
    "core",
    "views"
  ]
}
```

For the rest of this guide, we're going to assume that this folder is called
`workspaces` and it's in your home directory. We will refer to it as `~/workspaces`.

## Setup core
`core` in our example will be just an empty project. Make a `core` folder and put
this `package.json` inside:

```json
{
  "name": "core",
  "version": "0.0.1"
}
```

Let's put a few sample files in there to use as a test. We'll also leverage the
project specific extensions in web and native.

`test.js`:
```js
import value from './value'
export default value
```

`value.native.js`:
```js
export default 'value in native'
```

`value.web.js`:
```js
export default 'value in web'
```

## Setup views
We will use [Views](https://github.com/viewsdx/docs) for our UI. If you want to
use React directly, you may still benefit from this folder by putting shared
components across your projects here. Otherwise, just skip this section.

`views` is where our UI sits. Make a `views` folder and put this `package.json` inside:

```json
{
  "name": "views",
  "version": "0.0.1",
  "scripts": {
    "native": "views-morph . --as react-native --watch",
    "native:build": "views-morph . --as react-native",
    "web": "views-morph . --as react-dom --watch",
    "web:build": "views-morph . --as react-dom"
  }
}
```

Then add the latest `views-morph` to it:
```bash
yarn add --dev views-morph
```

Add a file called `Test.view` with this:
```
Test Vertical
backgroundColor deepskyblue
margin 50
onClick props.onClick
Text
fontSize 28
text Hey I'm a button!
```

Views uses some CSS defaults that make it behave close to how React Native renders the UI, add them
by copying [views.css](https://github.com/viewsdx/yarn-workspaces-cra-crna/blob/master/views.css) to `src/index.css`.

Views is a productive way to create interfaces together with your design team
and design in production. If you want to learn more about it, reach out at
https://twitter.com/viewsdx or join the conversation at https://slack.viewsdx.com :).

## Web
There are some issues with running CRA's init scripts inside the workspace, so
just go to a temporary folder anywhere and make a new project:

```bash
# go to some temporary location
cd /tmp
# make the app
create-react-app web
# get rid of node modules and yarn.lock
rm -rf web/node_modules web/yarn.lock
# move it to the workspaces
mv web ~/workspaces
cd ~/workspaces/web
```

The next step is to have CRA compile your other workspaces code if they're
imported by your app.

Install `react-app-rewired` and `react-app-rewire-yarn-workspaces` in the web project:
```bash
yarn add --dev react-app-rewired react-app-rewire-yarn-workspaces
```

Swap the `start`, `build`, and `test` scripts in `package.json` for these:
```json
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test --env=jsdom",
```

And add a file called `config-overrides.js` with this:
```js
const rewireYarnWorkspaces = require('react-app-rewire-yarn-workspaces');

module.exports = function override(config, env) {
  return rewireYarnWorkspaces(config, env);
};
```

To test the connection with `core`, add this to `src/App.js`:

```js
import test from 'core/test'

alert(test)
```

If you're using Views, test it by overwriting `App.js` with this:
```js
import React, {Component} from 'react';
import test from 'core/test';
import Test from 'views/Test.view.js';

alert(test);

class App extends Component {
  render() {
    return <Test onClick={() => alert('just clicked a button!')} />;
  }
}

export default App;
```

## Native
There are some issues with running CRNA's init scripts inside the workspace, so
just go to a temporary folder anywhere and make a new project:

```bash
# go to some temporary location
cd /tmp
# make the app
create-react-native-app native
# get rid of node modules and yarn.lock
rm -rf native/node_modules native/yarn.lock
# move it to the workspaces
mv native ~/workspaces
cd ~/workspaces/native
```

We'll first need to swap CRNA's entry point because the way it picks up our
`App.js` is very much dependent on the location of files, so it's easier this
way. We'll call that file `crna-entry.js`.

Either get the original file from
[here](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/src/bin/crna-entry.js).
If you do, make sure you change `import App from '../../../../App';` for `import App from './App';` so
it picks up your app.

...or, use this version want to avoid wrapping your app in a `View`. Add a file
called `crna-entry.js` with this:
```js
import App from './App';
import Expo from 'expo';
import React from 'react';

const AwakeInDevApp = props => [
  <App key="app" {...props} />,
  process.env.NODE_ENV === 'development' ? (
    <Expo.KeepAwake key="keep-awake" />
  ) : null,
];
Expo.registerRootComponent(AwakeInDevApp);
```

After that, in `package.json`, replace:
```json
  "main": "./node_modules/react-native-scripts/build/bin/crna-entry.js",
```
for:
```json
  "main": "crna-entry.js",
```

Then, replace `app.json` for this:
```json
{
  "expo": {
    "sdkVersion": "23.0.0",
    "ignoreNodeModulesValidation": true,
    "packagerOpts": {
      "config": "rn-cli.config.js",
      "projectRoots": ""
    }
  }
}
```
Note that this guide was created when Expo's SDK was at v23.0.0. If your
`app.json` has a different version, use that instead.

Install `metro-bundler-config-yarn-workspaces` and `crna-make-symlinks-for-yarn-workspaces`:
```bash
yarn add --dev metro-bundler-config-yarn-workspaces crna-make-symlinks-for-yarn-workspaces
```

Add a file called `rn-cli.config.js` with this:

```js
const getConfig = require('metro-bundler-config-yarn-workspaces')
module.exports = getConfig(__dirname)
```

> If your workspaces are not located in the root folder (e.g. root/packages/*) 
you must provide a `nodeModules` option indicating where the `node_modules` root
folder is located as described below:

```js
import test from 'core/test'

const getConfig = require('metro-bundler-config-yarn-workspaces')

const options = { nodeModules: path.resolve(__dirname, '..', '..') }

module.exports = getConfig(__dirname, options)  
```

Add a file called `link-workspaces.js` with this:
```js
require('crna-make-symlinks-for-yarn-workspaces')(__dirname)
```

Add `prestart` script to your native project's `package.json`:
```json
    "prestart": "node link-workspaces.js",
```

To test the connection with `core`, add this to `App.js`:

```js
import test from 'core/test'

alert(test)
```

If you're using Views, test it by overwriting `App.js` with this:
```js
import React, {Component} from 'react';
import test from 'core/test';
import Test from 'views/Test.view.js';

alert(test);

class App extends Component {
  render() {
    return <Test onClick={() => alert('just clicked a button!')} />;
  }
}

export default App;
```

If you get an error like `Cannot find entry file crna-entry.js in any of the
roots...`, press `shift+R` when you start the expo runner so it restarts the
packager and clears the cache.

Part of the setup may also come in handy for React Native CLI. [See this
comment](https://github.com/facebook/metro/issues/1#issuecomment-346502388).
I also wanted to thank [Neil Ding @GingerBear](https://github.com/GingerBear)
for his gist, without it [metro-bundler-config-yarn-workspaces](https://www.npmjs.com/package/metro-bundler-config-yarn-workspaces)
wouldn't be possible.

## Before starting the apps...

At this point, I'd probably recommend wiping all the node_modules of each
project and starting from scratch:
```bash
cd ~/workspaces
rm -rf node_modules core/node_modules views/node_modules native/node_modules web/node_modules
yarn
```

Dependencies are still added to the different project folders.

If you're using Views, you need to start the morpher by project type until
[viewsdx/morph#31](https://github.com/viewsdx/morph/issues/31) is implemented.

For web, in the `views` folder, run:
```bash
yarn web
```

For native, in the `views` folder, run:
```bash
yarn native
```

We'll be providing a concurrent process runner like the one implemented in
https://github.com/viewsdx/use soon.

I hope the process works for you! This is the GitHub repo that contains a sample
project and the supporting dev packages used in here. If you find any issues or
have suggestions around some of the steps, feel free to open an issue.

Thanks to [Larissa](https://github.com/callogerasl) and [Neil](https://github.com/neil-buckley)
for their help 🙏.

Happy hacking!
