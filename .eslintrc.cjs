module.exports = {
	env: {
		browser: true,
		es2024: true,
	},
	globals: {
		process: true,
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 'latest',
	},
	extends: [
		'eslint:recommended',
		'plugin:compat/recommended',
		'plugin:import/recommended',
		'plugin:prettier/recommended',
	],
	plugins: ['compat', 'write-good-comments', 'spellcheck'],
	rules: {
		'no-console': 'warn',
		'no-nested-ternary': 'error',
		'no-var': 'error',
		'prefer-const': 'error',
		'comma-dangle': ['error', 'only-multiline'],
		'no-async-promise-executor': 'off',
		'no-prototype-builtins': 'off',

		'import/no-unresolved': [1, { ignore: ['bun', 'bun:test'] }],
		'import/no-unused-modules': [1, { unusedExports: true }],
		'import/no-useless-path-segments': 'error',
		'import/first': 'warn',
		'import/order': 'warn',

		'write-good-comments/write-good-comments': 'warn',

		'spellcheck/spell-checker': ['warn', require('./.spellcheck.cjs')],
	},
	ignorePatterns: ['package-lock.json', 'node_modules', 'build'],
	overrides: [
		{
			files: ['**/*.cjs'],
			env: {
				browser: false,
				node: true,
			},
			rules: {
				'no-console': 'off',
			},
		},
		{
			files: ['**/demo.js', 'demo/*'],
			rules: {
				'no-console': 'off',
			},
		},
		{
			files: ['demo/server.js'],
			env: {
				browser: false,
				node: true,
			},
			globals: {
				Bun: true,
			},
			rules: {
				'no-console': 'off',
			},
		},
		{
			files: ['test-setup.js', '**/*.test.js', 'components/**/.test.js'],
			env: {
				browser: true,
				node: true,
			},
			globals: {
				Bun: true,
				container: true,
				expect: true,
				test: true,
			},
			extends: ['plugin:testing-library/dom'],
			plugins: ['testing-library'],
			rules: {
				'no-console': 'off',
				'testing-library/prefer-screen-queries': 'off',
			},
		},
	],
};
