const path = require('path');

module.exports = function override(config, env) {
  // Add alias for @ to point to src directory
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
  };
  
  return config;
};
