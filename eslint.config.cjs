const globals = require('globals');
const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');
const js = require('@eslint/js');
const jsdoc = require('eslint-plugin-jsdoc');

const compat = require('eslint-plugin-compat');
const importPlugin = require('eslint-plugin-import');
const spellcheck = require('eslint-plugin-spellcheck');
const testingLibrary = require('eslint-plugin-testing-library');
const writeGoodComments = require('eslint-plugin-write-good-comments');

module.exports = [
	{
		ignores: ['**/node_modules', '**/build', '**/.claude'],
	},
	js.configs.recommended,
	jsdoc.configs['flat/recommended'],
	...fixupConfigRules(compat.configs['flat/recommended']),
	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: globals.builtin,
		},
	},
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		plugins: {
			import: importPlugin,
			'write-good-comments': writeGoodComments,
			spellcheck,
		},
		rules: {
			'no-console': 'warn',
			'no-nested-ternary': 'error',
			'no-var': 'error',
			'prefer-const': 'error',
			'comma-dangle': ['error', 'only-multiline'],
			'no-async-promise-executor': 'off',
			'no-prototype-builtins': 'off',

			// TODO This rule doesn't work after updating to eslint 9
			// https://github.com/import-js/eslint-plugin-import/pull/2829
			// 'import/no-unused-modules': [1, { unusedExports: true }],

			'import/no-unresolved': [1, { ignore: ['bun', 'bun:test', String.raw`\.asText$`] }],
			'import/no-useless-path-segments': 'error',
			'import/first': 'warn',
			'import/order': 'warn',

			'write-good-comments/write-good-comments': 'off',

			'spellcheck/spell-checker': ['warn', require('./spellcheck.config.cjs')],
			'jsdoc/no-undefined-types': ['warn', { definedTypes: ['Component', 'TemplateStringsArray'] }],
		},
	},
	{
		files: ['**/*.js', '**/*.mjs'],
		languageOptions: {
			globals: {
				...globals.browser,
				process: false,
			},
		},
	},
	{
		files: ['**/*.cjs'],
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['**/demo.js', 'demo/*', 'demo/**/*'],
		rules: {
			'no-console': 'off',
			'jsdoc/require-jsdoc': 'off',
		},
	},
	{
		files: ['demo/server.js', 'devTools/*', 'plugins/*'],
		languageOptions: {
			globals: {
				...globals.node,
				Bun: false,
			},
		},
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['test-setup.js', '**/*.test.js', 'components/**/.test.js'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.jest,
				Bun: false,
				container: false,
				mock: true,
				spyOn: true,
				setSystemTime: true,
			},
		},
		plugins: {
			'testing-library': fixupPluginRules({ rules: testingLibrary.rules }),
		},
		rules: {
			...testingLibrary.configs.dom.rules,
			'no-console': 'off',
			'testing-library/prefer-screen-queries': 'off',
			'compat/compat': 'off',
		},
	},
];
