// Polyfill for next/config which was removed in Next.js 16
// This allows Storybook 8 to work with Next.js 16

module.exports = function getConfig() {
  return {
    publicRuntimeConfig: {},
    serverRuntimeConfig: {},
  };
};

module.exports.default = module.exports;
