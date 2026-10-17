const { existsSync } = require('fs');
const { join } = require('path');
const globals = require('globals');

const libraryConfig = require('./eslint.config.cjs');
const librarySpellcheck = require('./spellcheck.config.cjs');

// The app's own words, from the spellcheck.config.cjs beside its eslint config, join the library's
const appSpellcheckPath = join(process.cwd(), 'spellcheck.config.cjs');
const appSpellcheck =
	existsSync(appSpellcheckPath) && appSpellcheckPath !== require.resolve('./spellcheck.config.cjs')
		? require(appSpellcheckPath)
		: {};

/**
 * The library's lint config, set up for an app: the app's spellcheck words merged in, node and Bun globals for its
 * server and scripts, and JSDoc left optional. An app's eslint.config.cjs spreads it and adds only what is its own.
 * @example module.exports = [...require('@vanilla-bean/components/eslint.app.config.cjs'), { rules: { ... } }];
 */
module.exports = [
	...libraryConfig,
	{
		rules: {
			'spellcheck/spell-checker': [
				'warn',
				{
					...librarySpellcheck,
					...appSpellcheck,
					skipWords: [...new Set([...librarySpellcheck.skipWords, ...(appSpellcheck.skipWords ?? [])])],
					skipIfMatch: [...(librarySpellcheck.skipIfMatch ?? []), ...(appSpellcheck.skipIfMatch ?? [])],
				},
			],
			// lowdb publishes only an exports map, which the import resolver can't read
			'import/no-unresolved': ['warn', { ignore: ['bun', 'bun:test', String.raw`\.asText$`, '^lowdb'] }],
			// An app documents what needs it; the library documents everything, since its JSDoc becomes its types
			'jsdoc/require-jsdoc': 'off',
			'jsdoc/require-param': 'off',
			'jsdoc/require-param-type': 'off',
			'jsdoc/require-param-description': 'off',
			'jsdoc/require-returns': 'off',
			'jsdoc/require-returns-type': 'off',
			'jsdoc/require-returns-description': 'off',
		},
	},
	{
		files: ['server/**/*.js', 'scripts/**/*.js', 'cli/**/*.js', 'client/build.js', '*.config.js'],
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
		// Fixture strings and shorthand identifiers aren't prose, and a word list read as prose flags itself
		files: ['**/*.test.js', 'spellcheck.config.cjs'],
		rules: {
			'spellcheck/spell-checker': 'off',
		},
	},
];
