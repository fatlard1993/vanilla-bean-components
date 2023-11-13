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
		'unicorn/no-null': 'off',
		'unicorn/no-await-expression-member': 'off',
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
				describe: true,
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
