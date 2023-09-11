module.exports = {
	env: {
		browser: true,
		es2022: true,
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 'latest',
	},
	extends: [
		'eslint:recommended',
		'plugin:compat/recommended',
		'plugin:unicorn/recommended',
		'plugin:import/recommended',
		'plugin:prettier/recommended',
	],
	plugins: ['compat', 'unicorn', 'write-good-comments', 'spellcheck'],
	rules: {
		'no-console': 'warn',
		'no-nested-ternary': 'error',
		'no-var': 'error',
		'prefer-const': 'error',
		'comma-dangle': ['error', 'only-multiline'],
		'no-async-promise-executor': 'off',
		'no-prototype-builtins': 'off',

		'unicorn/prevent-abbreviations': [
			'error',
			{
				allowList: {
					elem: true,
					Elem: true,
					args: true,
				},
			},
		],
		'unicorn/filename-case': 'off',
		'unicorn/no-array-for-each': 'off',
		'unicorn/prefer-spread': 'off',
		'unicorn/no-negated-condition': 'off',
		'unicorn/no-array-reduce': 'off',
		'unicorn/prefer-query-selector': 'off',
		'unicorn/prefer-node-protocol': 'off',
		'unicorn/no-this-assignment': 'off',
		'unicorn/consistent-function-scoping': 'off',
		'unicorn/numeric-separators-style': 'off',
		'unicorn/prefer-switch': 'off',

		'import/no-unused-modules': [1, { unusedExports: true }],
		'import/no-useless-path-segments': 'error',
		'import/first': 'warn',
		'import/order': 'warn',

		'write-good-comments/write-good-comments': 'warn',

		'spellcheck/spell-checker': ['warn', require('./.spellcheck.cjs')],
	},
	ignorePatterns: ['package-lock.json', 'node_modules', 'dist'],
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
			files: ['**/demo.js'],
			rules: {
				'no-console': 'off',
			},
		},
		{
			files: ['vitest-setup.js', '**/*.test.js', 'components/**/test.js'],
			env: {
				'vitest-globals/env': true,
			},
			globals: {
				container: true,
			},
			extends: ['plugin:vitest-globals/recommended', 'plugin:testing-library/dom'],
			plugins: ['vitest', 'testing-library'],
			rules: {
				'no-console': 'off',
				'testing-library/prefer-screen-queries': 'off',
			},
		},
	],
};
