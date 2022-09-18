module.exports = {
    ignorePatterns: ['**/*.js'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended',
        'eslint-config-prettier',
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        'vue/multi-word-component-names': 'off',
    },
};
