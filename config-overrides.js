// config-overrides.js
module.exports = {
    webpack: function (config) {
      return { ...config, ignoreWarnings: [/Failed to parse source map/] };
    },
  };