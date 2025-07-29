import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["src/**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    ignores: ["dist/**/*"],
    rules: {
      // Reglas básicas de estilo
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],

      // Reglas de buenas prácticas
      "no-console": "warn",
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-duplicate-imports": "error",
      "no-multiple-empty-lines": ["error", { "max": 1 }],

      // Reglas de formato
      "max-len": ["warn", { "code": 100 }],
      "comma-dangle": ["error", "always-multiline"],
      "arrow-parens": ["error", "always"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
    }
  },
  {
    files: ["src/**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    ignores: ["dist/**/*"]
  },
  tseslint.configs.recommended,
]);
