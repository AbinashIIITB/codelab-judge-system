module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    ignorePatterns: ['node_modules/', 'dist/', '.next/', 'coverage/'],
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            parser: '@typescript-eslint/parser',
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
            ],
            plugins: ['@typescript-eslint'],
        },
    ],
};
