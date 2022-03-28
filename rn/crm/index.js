import React, {Component} from 'react';
import {AppRegistry, UIManager} from 'react-native';
import RootScene from "./src/RootScene";
const modules = require.getModules();
const moduleIds = Object.keys(modules);
const loadedModuleNames = moduleIds
  .filter((moduleId) => modules[moduleId].isInitialized)
  .map((moduleId) => modules[moduleId].verboseName);
const waitingModuleNames = moduleIds
  .filter((moduleId) => !modules[moduleId].isInitialized)
  .map((moduleId) => modules[moduleId].verboseName);

// make sure that the modules you expect to be waiting are actually waiting
console.log(
  'loaded:',
  loadedModuleNames.length,
  'waiting:',
  waitingModuleNames.length
);

// grab this text blob, and put it in a file named packager/modulePaths.js
console.log(
  `module.exports = ${JSON.stringify(
    loadedModuleNames.sort(),
    null,
    2
  )};`
);
// 启用Android Layout动画
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export default class crm extends Component {
    render() {
        return (
            <RootScene launchProps={this.props}/>
        );
    }
}

AppRegistry.registerComponent('crm', () => crm);
