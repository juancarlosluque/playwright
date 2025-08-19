module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
    },
    rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-var-requires': 'off',
        'prefer-const': 'error',
        'no-var': 'error',
        'no-console': 'off',
        'no-debugger': 'error',
        'no-duplicate-imports': 'error',
        'no-unused-expressions': 'error',
        'prefer-template': 'error',
        'object-shorthand': 'error',
        'arrow-spacing': 'error',
        'comma-dangle': ['error', 'never'],
        'quotes': ['error', 'double'],
        'semi': ['error', 'always']
    },
    env: {
        node: true,
        es2022: true
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'test-results/',
        '*.js'
    ]
};
