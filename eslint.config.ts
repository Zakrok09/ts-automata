import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(eslint.configs.all, tseslint.configs.strict, {
    rules: {
        "@typescript-eslint/no-non-null-assertion": "warn",
        "class-methods-use-this": "off",
        curly: "off",
        "id-length": "off",
        "no-continue": "off",
        "no-plusplus": "off",
        "no-ternary": "off",
        "one-var": "off"
    }
});
