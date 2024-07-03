import globals from "globals";
// import pluginJs from "@eslint/js";
import js from "@eslint/js";


export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {sourceType: "commonjs"}
  },
  {
    languageOptions: {
      globals: {...globals.browser, ...globals.node}
    }
  },
];