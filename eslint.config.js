<<<<<<< HEAD:FE/React_Native/project/eslint.config.js
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([expoConfig, { ignores: ["dist/*"] }]);
=======
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      "import/namespace": "off",
      "import/no-unresolved": "off",
      "import/no-duplicates": "off",
    },
  }
]);
>>>>>>> 55e6b04bdb0039b31ed0125a769dac91701491a9:eslint.config.js
