const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Shim react-dom for React Native — @clerk/clerk-react imports it
// but it's only used for web portal features that don't apply on native.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-dom' && platform !== 'web') {
    return {
      type: 'empty',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
