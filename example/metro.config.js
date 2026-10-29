const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// The example's native projects and scripts expect Metro on this port.
config.server.port = 8099;

module.exports = config;
