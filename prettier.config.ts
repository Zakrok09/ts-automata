import { type Config } from "prettier";

const config: Config = {
    arrowParens: "avoid",
    filepath: "src/**/*.ts",
    insertPragma: false,
    printWidth: 120,
    proseWrap: "always",
    requirePragma: false,
    semi: true,
    singleQuote: false,
    tabWidth: 4,
    trailingComma: "none",
    useTabs: false
};

export default config;
